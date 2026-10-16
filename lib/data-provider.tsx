'use client';

// The data layer: abonents, contracts, meters, tariffs, readings, bills and
// payments, persisted to localStorage. Every action validates like the real
// backend would (a reading can't go down, a payment can't exceed what's
// owed, a bill needs verified readings…) and returns a Result instead of
// throwing. When Supabase is connected, this provider's internals become
// queries/RPC calls; the action names and Result shapes stay the same.

import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import {
  Bill, BillView, DataState, Meter, Payment, PaymentMethod, Reading,
  ReadingSource, Result,
} from './types';
import { fail, ok } from './result';
import { buildSeedData } from './seed';
import { computeBill, deriveBillViews, DraftBill, round2, round3 } from './billing';
import { formatDate, formatMoney, todayISO, uid } from './format';

const DATA_KEY = 'volt.v2.data';

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
  source: ReadingSource;
  enteredBy: string | null;
  autoVerify: boolean;
}

interface DataContextValue {
  ready: boolean;
  data: DataState;
  bills: BillView[];
  submitReading: (input: ReadingInput) => Result<Reading>;
  reviewReading: (id: string, decision: 'verified' | 'rejected', reviewerId: string, note?: string) => Result;
  previewBill: (contractId: string, periodStart: string, periodEnd: string) => Result<DraftBill>;
  generateBill: (contractId: string, periodStart: string, periodEnd: string) => Result<string>;
  recordPayment: (billId: string, amount: number, method: PaymentMethod, accountId: string | null) => Result<Payment>;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

function isDataState(x: unknown): x is DataState {
  if (!x || typeof x !== 'object') return false;
  return (Object.keys(EMPTY) as (keyof DataState)[]).every((k) => Array.isArray((x as DataState)[k]));
}

// Returns an error message, or null if the reading fits between its neighbours.
function checkReading(
  readings: Reading[],
  meter: Meter,
  c: { date: string; day: number; night: number | null; peak: number | null },
  ignoreId?: string
): string | null {
  const others = readings.filter((r) => r.meterId === meter.id && r.status !== 'rejected' && r.id !== ignoreId);
  if (others.some((r) => r.date === c.date)) return `There's already a reading for ${formatDate(c.date)}.`;

  const prev = others.filter((r) => r.date < c.date).sort((a, b) => b.date.localeCompare(a.date))[0];
  const next = others.filter((r) => r.date > c.date).sort((a, b) => a.date.localeCompare(b.date))[0];

  const zones = [
    { key: 'day' as const, label: meter.type === 'single' ? 'meter' : 'day' },
    { key: 'night' as const, label: 'night' },
    { key: 'peak' as const, label: 'peak' },
  ];
  for (const z of zones) {
    const cv = c[z.key];
    if (prev) {
      const pv = prev[z.key];
      if (pv != null) {
        if (cv == null) return `Include the ${z.label} reading — the previous one had it.`;
        if (cv < pv) return `The ${z.label} reading can't be lower than the previous one (${pv}) from ${formatDate(prev.date)}.`;
      }
    }
    if (next) {
      const nv = next[z.key];
      if (nv != null && cv != null && cv > nv) {
        return `The ${z.label} reading can't be higher than the later one (${nv}) from ${formatDate(next.date)}.`;
      }
    }
  }
  return null;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataState>(EMPTY);
  const [ready, setReady] = useState(false);
  const ref = useRef<DataState>(EMPTY);

  function commit(next: DataState) {
    ref.current = next;
    setData(next);
  }

  useEffect(() => {
    let loaded: DataState | null = null;
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isDataState(parsed)) loaded = parsed;
      }
    } catch {
      /* corrupt or unavailable storage — fall back to the seed */
    }
    const initial = loaded ?? buildSeedData();
    ref.current = initial;
    setData(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, ready]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== DATA_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (isDataState(parsed)) {
          ref.current = parsed;
          setData(parsed);
        }
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // "Today" is read only once the browser has loaded the data, never during
  // server prerendering — status (e.g. overdue) depends on the real date.
  const bills = useMemo(
    () => (ready ? deriveBillViews(data.bills, data.billLines, data.payments, todayISO()) : []),
    [data, ready]
  );

  function prepareBill(contractId: string, start: string, end: string): Result<DraftBill> {
    const d = ref.current;
    const contract = d.contracts.find((c) => c.id === contractId);
    if (!contract || contract.status !== 'active') return fail('That contract is not active.');
    const abonent = d.abonents.find((a) => a.id === contract.abonentId);
    const meter = d.meters.find((m) => m.contractId === contractId && m.status === 'active');
    if (!abonent) return fail('Abonent not found.');
    if (!meter) return fail('This contract has no active meter.');
    if (!start || !end) return fail('Choose both dates.');
    const overlap = d.bills.find((b) => b.contractId === contractId && b.periodStart < end && b.periodEnd > start);
    if (overlap) {
      return fail(`That overlaps an existing bill (${formatDate(overlap.periodStart)} – ${formatDate(overlap.periodEnd)}).`);
    }
    return computeBill({ contract, abonent, meter, readings: d.readings, tariffs: d.tariffs, periodStart: start, periodEnd: end });
  }

  const value: DataContextValue = {
    ready,
    data,
    bills,

    submitReading(input) {
      const d = ref.current;
      const meter = d.meters.find((m) => m.id === input.meterId);
      if (!meter) return fail('Meter not found.');
      if (meter.status !== 'active') return fail("This meter isn't active, so readings can't be submitted.");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return fail('Enter a valid date.');
      if (input.date > todayISO()) return fail("The reading date can't be in the future.");
      if (input.date < meter.installDate) return fail('That date is before the meter was installed.');

      const nums = [input.day, input.night, input.peak].filter((n): n is number => n != null);
      if (nums.some((n) => !Number.isFinite(n) || n < 0 || n > 9_999_999)) {
        return fail('Readings must be positive numbers.');
      }
      if (meter.type === 'single' && (input.night != null || input.peak != null)) {
        return fail('This is a single-zone meter — it only has one value.');
      }
      if (meter.type === 'multi' && input.night == null) return fail('Enter the night reading.');

      const candidate = {
        date: input.date,
        day: round3(input.day),
        night: input.night == null ? null : round3(input.night),
        peak: input.peak == null ? null : round3(input.peak),
      };
      const problem = checkReading(d.readings, meter, candidate);
      if (problem) return fail(problem);

      const reading: Reading = {
        id: uid('r'),
        meterId: meter.id,
        ...candidate,
        source: input.source,
        enteredBy: input.enteredBy,
        status: input.autoVerify ? 'verified' : 'pending',
        reviewedBy: input.autoVerify ? input.enteredBy ?? undefined : undefined,
      };
      commit({ ...d, readings: [...d.readings, reading] });
      return ok(reading);
    },

    reviewReading(id, decision, reviewerId, note) {
      const d = ref.current;
      const reading = d.readings.find((r) => r.id === id);
      if (!reading) return fail('Reading not found.');
      if (reading.status !== 'pending') return fail('That reading was already reviewed.');
      if (decision === 'rejected' && !note?.trim()) {
        return fail('Add a short reason so the customer knows what to fix.');
      }
      if (decision === 'verified') {
        const meter = d.meters.find((m) => m.id === reading.meterId);
        if (meter) {
          const problem = checkReading(d.readings, meter, reading, reading.id);
          if (problem) return fail(problem);
        }
      }
      commit({
        ...d,
        readings: d.readings.map((r) =>
          r.id === id ? { ...r, status: decision, reviewedBy: reviewerId, note: note?.trim() || undefined } : r
        ),
      });
      return ok();
    },

    previewBill: prepareBill,

    generateBill(contractId, start, end) {
      const res = prepareBill(contractId, start, end);
      if (!res.ok || !res.value) return fail(res.error ?? 'Could not generate the bill.');
      const id = uid('b');
      const bill: Bill = { id, ...res.value.bill };
      const lines = res.value.lines.map((l, i) => ({ id: `${id}-l${i}`, billId: id, ...l }));
      const d = ref.current;
      commit({ ...d, bills: [...d.bills, bill], billLines: [...d.billLines, ...lines] });
      return ok(id);
    },

    recordPayment(billId, amount, method, accountId) {
      const d = ref.current;
      const bill = d.bills.find((b) => b.id === billId);
      if (!bill) return fail('Bill not found.');
      const paid = d.payments
        .filter((p) => p.billId === billId && p.status === 'success')
        .reduce((s, p) => s + p.amount, 0);
      const remaining = round2(bill.amount - paid);
      const value = round2(amount);
      if (remaining <= 0) return fail('This bill is already paid.');
      if (!(value > 0)) return fail('Enter an amount greater than zero.');
      if (value > remaining + 0.001) return fail(`That's more than the ${formatMoney(remaining)} still owed.`);

      const payment: Payment = {
        id: uid('p'),
        billId,
        contractId: bill.contractId,
        accountId,
        amount: value,
        date: new Date().toISOString(),
        method,
        transactionId:
          method === 'cash'
            ? null
            : `TX-${Math.random().toString(36).slice(2, 8).toUpperCase()}${Date.now().toString(36).slice(-3).toUpperCase()}`,
        status: 'success',
      };
      commit({ ...d, payments: [...d.payments, payment] });
      return ok(payment);
    },

    resetDemoData() {
      commit(buildSeedData());
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
