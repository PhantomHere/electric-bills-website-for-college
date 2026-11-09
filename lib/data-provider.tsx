'use client';

// The data layer, backed by Supabase. Reads are plain table queries — row-level
// security decides what each person gets back (a customer: their own contracts,
// meters, bills and payments; staff: everything). Writes never touch the tables
// directly: they call the SQL functions from 09_data_functions.sql, which check
// the same rules the app used to check locally (a reading can't go down, a
// payment can't exceed what's owed, a bill needs verified readings, …).
//
// The shape of useData() is unchanged, except the actions are now async.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import { useSession } from './session-provider';
import { isApprovedStaff } from './permissions';
import {
  Abonent, AbonentStatus, AbonentType, Bill, BillLine, BillView, Contract, DataState, Meter,
  MeterStatus, MeterType, Payment, PaymentMethod, PaymentStatus, Reading, ReadingSource,
  ReadingStatus, Result, Tariff, TariffZone,
} from './types';
import { fail, ok } from './result';
import { deriveBillViews, DraftBill, round2, round3 } from './billing';
import { addDays, todayISO } from './format';

const POLL_MS = 30_000; // pick up changes made on other devices

const EMPTY: DataState = {
  abonents: [], contracts: [], meters: [], tariffs: [],
  readings: [], bills: [], billLines: [], payments: [],
};

export interface ReadingInput {
  meterId: string;
  date: string;
  day: number;
  night: number | null;
  peak: number | null;
}

interface DataContextValue {
  ready: boolean;
  error: string | null;
  data: DataState;
  bills: BillView[];
  nameOf: (accountId: string | null) => string;
  refresh: () => Promise<void>;
  submitReading: (input: ReadingInput) => Promise<Result>;
  reviewReading: (id: string, decision: 'verified' | 'rejected', note?: string) => Promise<Result>;
  previewBill: (contractId: string, periodStart: string, periodEnd: string) => Promise<Result<DraftBill>>;
  generateBill: (contractId: string, periodStart: string, periodEnd: string) => Promise<Result<string>>;
  recordPayment: (billId: string, amount: number, method: PaymentMethod) => Promise<Result<Payment>>;
}

const DataContext = createContext<DataContextValue | null>(null);

// ---------- row shapes (what the database returns) and their mappers ----------
// Ids are bigints in the database; the app treats ids as opaque strings.
// Columns are listed explicitly — notably abonents.passport_data is never fetched.

type One<T> = T | T[] | null;
const one = <T,>(x: One<T> | undefined): T | null => (Array.isArray(x) ? x[0] ?? null : x ?? null);
const str = (v: number | string) => String(v);
const num = (v: number | string) => Number(v);
const numOrNull = (v: number | string | null) => (v == null ? null : Number(v));

interface AbonentRow { abonent_id: number; account_number: string; full_name: string; type: AbonentType; status: AbonentStatus }
interface ContractRow {
  contract_id: number; abonent_id: number; contract_number: string; start_date: string;
  status: 'active' | 'terminated'; addresses: One<{ full_address: string }>;
}
interface MeterRow {
  meter_id: number; contract_id: number; serial_number: string; type: MeterType;
  installation_date: string; next_verification_date: string | null; status: MeterStatus;
}
interface TariffRow {
  tariff_id: number; name: string; zone: TariffZone; price: number | string;
  valid_from: string; valid_to: string | null; abonent_type: AbonentType;
}
interface ReadingRow {
  reading_id: number; meter_id: number; reading_date: string; value_day: number | string;
  value_night: number | string | null; value_peak: number | string | null; source: ReadingSource;
  entered_by: number | null; status: ReadingStatus; reviewed_by: number | null; review_note: string | null;
}
interface BillRow {
  bill_id: number; contract_id: number; period_start: string; period_end: string; due_date: string;
  created_at: string; consumption_day: number | string; consumption_night: number | string;
  consumption_peak: number | string; amount: number | string;
}
interface LineRow {
  detail_id: number; bill_id: number; consumption: number | string; price: number | string;
  line_amount: number | string; tariffs: One<{ name: string; zone: TariffZone }>;
}
interface PaymentRow {
  payment_id: number; bill_id: number | null; contract_id: number; paid_by: number | null;
  amount: number | string; payment_date: string; method: PaymentMethod;
  transaction_id: string | null; status: PaymentStatus;
}
interface PreviewRow {
  zone: TariffZone; tariff_name: string; consumption: number | string;
  price: number | string; line_amount: number | string;
}

async function fetchAll(): Promise<DataState> {
  const [ab, co, me, ta, re, bi, li, pa] = await Promise.all([
    supabase.from('abonents').select('abonent_id, account_number, full_name, type, status'),
    supabase.from('contracts').select('contract_id, abonent_id, contract_number, start_date, status, addresses(full_address)'),
    supabase.from('meters').select('meter_id, contract_id, serial_number, type, installation_date, next_verification_date, status'),
    supabase.from('tariffs').select('tariff_id, name, zone, price, valid_from, valid_to, abonent_type'),
    supabase.from('meter_readings').select('reading_id, meter_id, reading_date, value_day, value_night, value_peak, source, entered_by, status, reviewed_by, review_note'),
    supabase.from('bills').select('bill_id, contract_id, period_start, period_end, due_date, created_at, consumption_day, consumption_night, consumption_peak, amount'),
    supabase.from('bill_details').select('detail_id, bill_id, consumption, price, line_amount, tariffs(name, zone)'),
    supabase.from('payments').select('payment_id, bill_id, contract_id, paid_by, amount, payment_date, method, transaction_id, status'),
  ]);
  for (const r of [ab, co, me, ta, re, bi, li, pa]) {
    if (r.error) throw new Error(r.error.message);
  }

  const abonents = (ab.data as unknown as AbonentRow[]).map((r): Abonent => ({
    id: str(r.abonent_id), accountNumber: r.account_number, fullName: r.full_name, type: r.type, status: r.status,
  }));
  const contracts = (co.data as unknown as ContractRow[]).map((r): Contract => ({
    id: str(r.contract_id), abonentId: str(r.abonent_id), contractNumber: r.contract_number,
    address: one(r.addresses)?.full_address ?? '', startDate: r.start_date, status: r.status,
  }));
  const meters = (me.data as unknown as MeterRow[]).map((r): Meter => ({
    id: str(r.meter_id), contractId: str(r.contract_id), serialNumber: r.serial_number, type: r.type,
    installDate: r.installation_date, nextVerification: r.next_verification_date ?? '', status: r.status,
  }));
  const tariffs = (ta.data as unknown as TariffRow[]).map((r): Tariff => ({
    id: str(r.tariff_id), name: r.name, zone: r.zone, price: num(r.price),
    validFrom: r.valid_from, validTo: r.valid_to, abonentType: r.abonent_type,
  }));
  const readings = (re.data as unknown as ReadingRow[]).map((r): Reading => ({
    id: str(r.reading_id), meterId: str(r.meter_id), date: r.reading_date, day: num(r.value_day),
    night: numOrNull(r.value_night), peak: numOrNull(r.value_peak), source: r.source,
    enteredBy: r.entered_by == null ? null : str(r.entered_by), status: r.status,
    reviewedBy: r.reviewed_by == null ? undefined : str(r.reviewed_by), note: r.review_note ?? undefined,
  }));
  const bills = (bi.data as unknown as BillRow[]).map((r): Bill => ({
    id: str(r.bill_id), contractId: str(r.contract_id), periodStart: r.period_start, periodEnd: r.period_end,
    dueDate: r.due_date, createdAt: r.created_at.slice(0, 10), consumptionDay: num(r.consumption_day),
    consumptionNight: num(r.consumption_night), consumptionPeak: num(r.consumption_peak), amount: num(r.amount),
  }));
  const billLines = (li.data as unknown as LineRow[]).map((r): BillLine => {
    const t = one(r.tariffs);
    return {
      id: str(r.detail_id), billId: str(r.bill_id), zone: t?.zone ?? 'single', tariffName: t?.name ?? '',
      consumption: num(r.consumption), price: num(r.price), amount: num(r.line_amount),
    };
  });
  // Payments without a bill (advances) aren't part of this app's bill views.
  const payments = (pa.data as unknown as PaymentRow[])
    .filter((r) => r.bill_id != null)
    .map((r): Payment => ({
      id: str(r.payment_id), billId: str(r.bill_id as number), contractId: str(r.contract_id),
      accountId: r.paid_by == null ? null : str(r.paid_by), amount: num(r.amount), date: r.payment_date,
      method: r.method, transactionId: r.transaction_id, status: r.status,
    }));

  return { abonents, contracts, meters, tariffs, readings, bills, billLines, payments };
}

async function fetchNames(): Promise<Record<string, string>> {
  const { data, error } = await supabase.rpc('person_names');
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const r of data as { user_id: number; full_name: string }[]) out[str(r.user_id)] = r.full_name;
  return out;
}

function toDraft(periodStart: string, periodEnd: string, rows: PreviewRow[]): DraftBill {
  const lines = rows.map((r) => ({
    zone: r.zone, tariffName: r.tariff_name, consumption: num(r.consumption),
    price: num(r.price), amount: num(r.line_amount),
  }));
  const sum = (zones: TariffZone[]) =>
    round3(lines.filter((l) => zones.includes(l.zone)).reduce((s, l) => s + l.consumption, 0));
  return {
    bill: {
      contractId: '', periodStart, periodEnd, dueDate: addDays(periodEnd, 20), createdAt: periodEnd,
      consumptionDay: sum(['day', 'single']), consumptionNight: sum(['night']), consumptionPeak: sum(['peak']),
      amount: round2(lines.reduce((s, l) => s + l.amount, 0)),
    },
    lines,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { account, hydrated } = useSession();
  const accountId = account?.id ?? null;
  const staff = isApprovedStaff(account);

  const [data, setData] = useState<DataState>(EMPTY);
  const [names, setNames] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);
  const lastLoad = useRef(0);
  const dataRef = useRef<DataState>(EMPTY);

  // Fetch everything this person may see. Always returns what it fetched, but
  // only applies it to the screen if no newer fetch has started since.
  const load = useCallback(async (): Promise<DataState | null> => {
    const mine = ++seq.current;
    try {
      const [next, people] = await Promise.all([fetchAll(), staff ? fetchNames() : Promise.resolve({})]);
      if (mine === seq.current) {
        dataRef.current = next;
        setData(next);
        setNames(people);
        setError(null);
        lastLoad.current = Date.now();
      }
      return next;
    } catch (e) {
      if (mine === seq.current) setError(e instanceof Error ? e.message : 'Could not load your data.');
      return null;
    }
  }, [staff]);

  useEffect(() => {
    if (!hydrated) return;
    if (!accountId) {
      seq.current++;
      dataRef.current = EMPTY;
      setData(EMPTY);
      setNames({});
      setError(null);
      setReady(true);
      return;
    }
    setReady(false);
    void load().then(() => setReady(true));
  }, [hydrated, accountId, load]);

  // Keep other devices in step: refetch when the tab regains focus, and
  // every 30 seconds while it's visible.
  useEffect(() => {
    if (!accountId) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastLoad.current > 5000) void load();
    };
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, POLL_MS);
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [accountId, load]);

  // "Today" is read only once data has loaded in the browser, never during
  // server prerendering — status (e.g. overdue) depends on the real date.
  const bills = useMemo(
    () => (ready ? deriveBillViews(data.bills, data.billLines, data.payments, todayISO()) : []),
    [data, ready]
  );

  const value: DataContextValue = {
    ready,
    error,
    data,
    bills,

    nameOf(id) {
      if (!id) return 'Automatic';
      if (id === accountId) return account?.fullName ?? 'You';
      return names[id] ?? 'Unknown';
    },

    async refresh() {
      await load();
    },

    async submitReading(input) {
      const { error: err } = await supabase.rpc('submit_reading', {
        p_meter_id: Number(input.meterId),
        p_date: input.date,
        p_day: input.day,
        p_night: input.night,
        p_peak: input.peak,
      });
      if (err) return fail(err.message);
      await load();
      return ok();
    },

    async reviewReading(id, decision, note) {
      const { error: err } = await supabase.rpc('review_reading', {
        p_reading_id: Number(id),
        p_decision: decision,
        p_note: note?.trim() || null,
      });
      if (err) return fail(err.message);
      await load();
      return ok();
    },

    async previewBill(contractId, start, end) {
      if (!start || !end) return fail('Choose both dates.');
      const { data: rows, error: err } = await supabase.rpc('preview_bill', {
        p_contract_id: Number(contractId), p_start: start, p_end: end,
      });
      if (err) return fail(err.message);
      const draft = toDraft(start, end, (rows ?? []) as PreviewRow[]);
      draft.bill.contractId = contractId;
      return ok(draft);
    },

    async generateBill(contractId, start, end) {
      const { data: id, error: err } = await supabase.rpc('generate_bill', {
        p_contract_id: Number(contractId), p_period_start: start, p_period_end: end,
      });
      if (err) return fail(err.message);
      await load();
      return ok(String(id));
    },

    async recordPayment(billId, amount, method) {
      if (!Number.isFinite(amount)) return fail('Enter an amount greater than zero.');
      const { data: id, error: err } = await supabase.rpc('record_payment', {
        p_bill_id: Number(billId), p_amount: amount, p_method: method,
      });
      if (err) return fail(err.message);
      const fresh = await load();
      const paymentId = String(id);
      const found = (fresh ?? dataRef.current).payments.find((p) => p.id === paymentId);
      if (found) return ok(found);
      // The payment is saved; only the refresh failed. Still return something
      // the receipt can show, so the customer doesn't pay twice.
      const bill = dataRef.current.bills.find((b) => b.id === billId);
      return ok({
        id: paymentId, billId, contractId: bill?.contractId ?? '', accountId, amount: round2(amount),
        date: new Date().toISOString(), method, transactionId: null, status: 'success' as PaymentStatus,
      });
    },
  };

  return (
    <DataContext.Provider value={value}>
      {error && (
        <div role="alert" className="fixed inset-x-0 top-0 z-[60] bg-[#fde8e8] px-4 py-2 text-center text-sm text-[#a02828]">
          Couldn&apos;t load the latest data ({error}).{' '}
          <button className="font-semibold underline" onClick={() => void load()}>Retry</button>
        </div>
      )}
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
