// The billing rules, as pure functions. This is the TypeScript twin of the
// generate_bill() / refresh_bill_status() SQL functions — same rules, so the
// numbers don't change when the data moves to Supabase.

import {
  Abonent, Bill, BillLine, BillStatus, BillView, Contract, Meter, Payment,
  Reading, Result, Tariff, TariffZone,
} from './types';
import { fail, ok } from './result';
import { addDays } from './format';

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const round3 = (n: number) => Math.round((n + Number.EPSILON) * 1000) / 1000;

export function latestVerifiedOnOrBefore(
  readings: Reading[],
  meterId: string,
  date: string
): Reading | undefined {
  let best: Reading | undefined;
  for (const r of readings) {
    if (r.meterId !== meterId || r.status !== 'verified' || r.date > date) continue;
    if (!best || r.date > best.date) best = r;
  }
  return best;
}

export interface DraftBill {
  bill: Omit<Bill, 'id'>;
  lines: Omit<BillLine, 'id' | 'billId'>[];
}

export function computeBill(args: {
  contract: Contract;
  abonent: Abonent;
  meter: Meter;
  readings: Reading[];
  tariffs: Tariff[];
  periodStart: string;
  periodEnd: string;
  dueDays?: number;
}): Result<DraftBill> {
  const { contract, abonent, meter, readings, tariffs, periodStart, periodEnd } = args;
  const dueDays = args.dueDays ?? 20;

  if (periodEnd <= periodStart) return fail('The period must end after it starts.');

  const from = latestVerifiedOnOrBefore(readings, meter.id, periodStart);
  const to = latestVerifiedOnOrBefore(readings, meter.id, periodEnd);
  if (!from || !to || from.id === to.id) {
    return fail(
      'Not enough verified readings for this period — need one on or before the start and a later one on or before the end.'
    );
  }

  const diffs: { zone: TariffZone; consumption: number }[] = [];
  if (meter.type === 'single') {
    diffs.push({ zone: 'single', consumption: to.day - from.day });
  } else {
    if (to.night == null || from.night == null) {
      return fail('This multi-zone meter is missing night readings.');
    }
    diffs.push({ zone: 'day', consumption: to.day - from.day });
    diffs.push({ zone: 'night', consumption: to.night - from.night });
    if (to.peak != null && from.peak != null) {
      diffs.push({ zone: 'peak', consumption: to.peak - from.peak });
    }
  }
  if (diffs.some((d) => d.consumption < 0)) {
    return fail('A reading in this period is lower than the one before it.');
  }

  const lines: DraftBill['lines'] = [];
  for (const d of diffs) {
    const tariff = tariffs.find(
      (t) =>
        t.zone === d.zone &&
        t.abonentType === abonent.type &&
        t.validFrom <= periodEnd &&
        (t.validTo === null || t.validTo >= periodEnd)
    );
    if (!tariff) return fail(`No ${d.zone} tariff for ${abonent.type} customers on ${periodEnd}.`);
    const consumption = round3(d.consumption);
    lines.push({
      zone: d.zone,
      tariffName: tariff.name,
      consumption,
      price: tariff.price,
      amount: round2(consumption * tariff.price),
    });
  }

  const sum = (zones: TariffZone[]) =>
    round3(lines.filter((l) => zones.includes(l.zone)).reduce((s, l) => s + l.consumption, 0));

  return ok({
    bill: {
      contractId: contract.id,
      periodStart,
      periodEnd,
      dueDate: addDays(periodEnd, dueDays),
      createdAt: periodEnd,
      consumptionDay: sum(['day', 'single']),
      consumptionNight: sum(['night']),
      consumptionPeak: sum(['peak']),
      amount: round2(lines.reduce((s, l) => s + l.amount, 0)),
    },
    lines,
  });
}

// Same precedence as refresh_bill_status() in the SQL: paid, then partially
// paid, then overdue, else accrued. Only successful payments count.
export function billStatus(amount: number, paid: number, dueDate: string, today: string): BillStatus {
  if (paid >= amount) return 'paid';
  if (paid > 0) return 'partially_paid';
  if (dueDate < today) return 'overdue';
  return 'accrued';
}

export function deriveBillViews(
  bills: Bill[],
  lines: BillLine[],
  payments: Payment[],
  today: string
): BillView[] {
  const linesBy = new Map<string, BillLine[]>();
  for (const l of lines) linesBy.set(l.billId, [...(linesBy.get(l.billId) ?? []), l]);
  const payBy = new Map<string, Payment[]>();
  for (const p of payments) payBy.set(p.billId, [...(payBy.get(p.billId) ?? []), p]);

  return bills
    .map((b): BillView => {
      const ps = (payBy.get(b.id) ?? []).sort((a, c) => c.date.localeCompare(a.date));
      const paid = round2(ps.filter((p) => p.status === 'success').reduce((s, p) => s + p.amount, 0));
      const remaining = round2(Math.max(0, b.amount - paid));
      return {
        ...b,
        lines: linesBy.get(b.id) ?? [],
        payments: ps,
        paid,
        remaining,
        status: billStatus(b.amount, paid, b.dueDate, today),
        pastDue: remaining > 0 && b.dueDate < today,
      };
    })
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart) || a.contractId.localeCompare(b.contractId));
}
