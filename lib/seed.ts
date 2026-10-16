// Seed data: the stationary stand-in for the Supabase tables. Bills are not
// typed in by hand — they are generated from the readings and tariffs with
// the same computeBill() the billing page uses, so every number is consistent.

import {
  Abonent, Account, Bill, BillLine, Contract, DataState, Meter, Payment,
  PaymentMethod, Reading, ReadingSource, Tariff,
} from './types';
import { addDays } from './format';
import { computeBill, round3 } from './billing';

export const DEMO_PASSWORD = 'demo123';

export type SeedAccount = Omit<Account, 'passwordHash' | 'salt' | 'createdAt'> & { password: string };

export const SEED_ACCOUNTS: SeedAccount[] = [
  { id: 'acc-1', fullName: 'Ivan Petrov', email: 'ivan.petrov@example.com', password: DEMO_PASSWORD, role: 'customer', workAccessStatus: 'none', abonentId: 'ab-1' },
  { id: 'acc-2', fullName: 'Anna Schmidt', email: 'anna.schmidt@example.com', password: DEMO_PASSWORD, role: 'customer', workAccessStatus: 'pending', requestedRole: 'controller', abonentId: 'ab-2' },
  { id: 'acc-3', fullName: 'Maria Sokolova', email: 'admin@example.com', password: DEMO_PASSWORD, role: 'admin', workAccessStatus: 'approved' },
  { id: 'acc-4', fullName: 'Dmitry Kuznetsov', email: 'operator1@example.com', password: DEMO_PASSWORD, role: 'operator', workAccessStatus: 'approved' },
  { id: 'acc-5', fullName: 'Elena Morozova', email: 'controller1@example.com', password: DEMO_PASSWORD, role: 'controller', workAccessStatus: 'approved' },
  { id: 'acc-6', fullName: 'Pavel Orlov', email: 'viewer1@example.com', password: DEMO_PASSWORD, role: 'viewer', workAccessStatus: 'approved' },
];

const ABONENTS: Abonent[] = [
  { id: 'ab-1', accountNumber: '100001', fullName: 'Ivan Petrov', type: 'individual', status: 'active' },
  { id: 'ab-2', accountNumber: '100002', fullName: 'Anna Schmidt', type: 'individual', status: 'active' },
  { id: 'ab-3', accountNumber: '200001', fullName: 'LLC "Baltic Trade"', type: 'legal', status: 'active' },
  { id: 'ab-4', accountNumber: '100003', fullName: 'Sergey Volkov', type: 'individual', status: 'blocked' },
];

const CONTRACTS: Contract[] = [
  { id: 'c-1', abonentId: 'ab-1', contractNumber: 'C-2024-001', address: 'Leninsky Prospekt 10, apt. 5, Kaliningrad', startDate: '2024-01-15', status: 'active' },
  { id: 'c-2', abonentId: 'ab-2', contractNumber: 'C-2024-002', address: 'Gagarina Street 22, apt. 17, Kaliningrad', startDate: '2024-02-10', status: 'active' },
  { id: 'c-3', abonentId: 'ab-3', contractNumber: 'C-2025-001', address: 'Portovaya Street 1, Kaliningrad', startDate: '2025-02-01', status: 'active' },
  { id: 'c-4', abonentId: 'ab-4', contractNumber: 'C-2024-003', address: 'Sovetsky Prospekt 3, apt. 41, Kaliningrad', startDate: '2024-03-01', status: 'active' },
];

const METERS: Meter[] = [
  { id: 'm-1', contractId: 'c-1', serialNumber: 'SN-A-10001', type: 'multi', installDate: '2024-01-15', nextVerification: '2026-12-20', status: 'active' },
  { id: 'm-2', contractId: 'c-2', serialNumber: 'SN-A-10002', type: 'single', installDate: '2024-02-10', nextVerification: '2032-02-01', status: 'active' },
  { id: 'm-3', contractId: 'c-3', serialNumber: 'SN-B-20001', type: 'multi', installDate: '2025-02-01', nextVerification: '2033-01-20', status: 'active' },
  { id: 'm-4', contractId: 'c-4', serialNumber: 'SN-A-10003', type: 'single', installDate: '2020-03-01', nextVerification: '2028-03-01', status: 'faulty' },
];

const TARIFFS: Tariff[] = [
  { id: 't-1', name: 'Residential day 2025', zone: 'day', price: 6.1, validFrom: '2025-01-01', validTo: '2025-12-31', abonentType: 'individual' },
  { id: 't-2', name: 'Residential night 2025', zone: 'night', price: 3.0, validFrom: '2025-01-01', validTo: '2025-12-31', abonentType: 'individual' },
  { id: 't-3', name: 'Residential peak 2025', zone: 'peak', price: 9.2, validFrom: '2025-01-01', validTo: '2025-12-31', abonentType: 'individual' },
  { id: 't-4', name: 'Residential single 2025', zone: 'single', price: 5.1, validFrom: '2025-01-01', validTo: '2025-12-31', abonentType: 'individual' },
  { id: 't-5', name: 'Residential day', zone: 'day', price: 6.5, validFrom: '2026-01-01', validTo: null, abonentType: 'individual' },
  { id: 't-6', name: 'Residential night', zone: 'night', price: 3.2, validFrom: '2026-01-01', validTo: null, abonentType: 'individual' },
  { id: 't-7', name: 'Residential peak', zone: 'peak', price: 9.8, validFrom: '2026-01-01', validTo: null, abonentType: 'individual' },
  { id: 't-8', name: 'Residential single', zone: 'single', price: 5.4, validFrom: '2026-01-01', validTo: null, abonentType: 'individual' },
  { id: 't-9', name: 'Business day', zone: 'day', price: 8.9, validFrom: '2026-01-01', validTo: null, abonentType: 'legal' },
  { id: 't-10', name: 'Business night', zone: 'night', price: 5.1, validFrom: '2026-01-01', validTo: null, abonentType: 'legal' },
  { id: 't-11', name: 'Business peak', zone: 'peak', price: 12.4, validFrom: '2026-01-01', validTo: null, abonentType: 'legal' },
  { id: 't-12', name: 'Business single', zone: 'single', price: 8.1, validFrom: '2026-01-01', validTo: null, abonentType: 'legal' },
];

// Monthly readings on the 1st, March → October.
const READING_DATES = [
  '2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01',
  '2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01',
];

function series(
  meterId: string,
  start: { day: number; night?: number; peak?: number },
  deltas: { day: number[]; night?: number[]; peak?: number[] },
  source: ReadingSource
): Reading[] {
  let { day, night, peak } = start;
  return READING_DATES.map((date, i) => {
    if (i > 0) {
      day += deltas.day[i - 1];
      if (night !== undefined && deltas.night) night += deltas.night[i - 1];
      if (peak !== undefined && deltas.peak) peak += deltas.peak[i - 1];
    }
    return {
      id: `r-${meterId}-${date}`,
      meterId,
      date,
      day: round3(day),
      night: night === undefined ? null : round3(night),
      peak: peak === undefined ? null : round3(peak),
      source,
      enteredBy: source === 'automatic' ? null : 'acc-5',
      status: 'verified',
    };
  });
}

export function buildSeedData(): DataState {
  const readings: Reading[] = [
    ...series('m-1', { day: 1000, night: 400, peak: 90 },
      { day: [118, 120, 125, 115, 110, 122, 128], night: [48, 50, 55, 52, 50, 54, 58], peak: [9, 10, 12, 11, 10, 12, 13] }, 'manual'),
    ...series('m-2', { day: 5000 }, { day: [150, 140, 160, 155, 148, 162, 170] }, 'manual'),
    ...series('m-3', { day: 20000, night: 8000, peak: 2500 },
      { day: [2500, 2700, 2400, 2600, 2800, 2900, 3000], night: [1100, 1200, 1000, 1150, 1250, 1300, 1350], peak: [300, 350, 330, 310, 340, 360, 380] }, 'automatic'),
  ];

  // A customer-submitted reading waiting for a controller to review.
  const annaLast = readings.filter((r) => r.meterId === 'm-2').slice(-1)[0];
  readings.push({
    id: 'r-m-2-2026-10-10', meterId: 'm-2', date: '2026-10-10',
    day: round3(annaLast.day + 82), night: null, peak: null,
    source: 'manual', enteredBy: 'acc-2', status: 'pending',
  });

  const abonentOf = (contractId: string) =>
    ABONENTS.find((a) => a.id === CONTRACTS.find((c) => c.id === contractId)!.abonentId)!;

  const bills: Bill[] = [];
  const billLines: BillLine[] = [];
  for (const contract of CONTRACTS) {
    const meter = METERS.find((m) => m.contractId === contract.id && m.status === 'active');
    if (!meter) continue;
    for (let i = 0; i < READING_DATES.length - 1; i++) {
      const res = computeBill({
        contract, abonent: abonentOf(contract.id), meter, readings, tariffs: TARIFFS,
        periodStart: READING_DATES[i], periodEnd: READING_DATES[i + 1],
      });
      if (!res.ok || !res.value) continue;
      const id = `b-${contract.id}-${READING_DATES[i].slice(0, 7)}`;
      bills.push({ id, ...res.value.bill });
      res.value.lines.forEach((l, n) => billLines.push({ id: `${id}-l${n}`, billId: id, ...l }));
    }
  }

  // Payment history: fully paid up to a point, with a few realistic loose ends.
  const payments: Payment[] = [];
  const methods: PaymentMethod[] = ['card', 'online', 'bank'];
  let counter = 0;
  const pay = (
    contractId: string, monthIdx: number, share: number,
    method: PaymentMethod, accountId: string | null,
    status: Payment['status'] = 'success', dateOverride?: string
  ) => {
    const bill = bills.find((b) => b.id === `b-${contractId}-${READING_DATES[monthIdx].slice(0, 7)}`);
    if (!bill) return;
    counter++;
    payments.push({
      id: `p-${counter}`,
      billId: bill.id,
      contractId,
      accountId,
      amount: Math.round(bill.amount * share * 100) / 100,
      date: dateOverride ?? `${addDays(bill.periodEnd, 6 + (counter % 5))}T1${counter % 10}:15:00`,
      method,
      transactionId: method === 'cash' ? null : `TX-${1000 + counter}`,
      status,
    });
  };

  for (let i = 0; i <= 5; i++) pay('c-1', i, 1, methods[i % 3], 'acc-1');          // Ivan: paid through August
  pay('c-1', 6, 1, 'online', 'acc-1', 'failed', '2026-10-10T09:41:00');           // …one failed attempt on September
  for (let i = 0; i <= 3; i++) pay('c-2', i, 1, methods[(i + 1) % 3], 'acc-2');    // Anna: paid Mar–Jun
  pay('c-2', 4, 0.4, 'cash', null);                                                // July only partly paid
  for (let i = 0; i <= 5; i++) pay('c-3', i, 1, 'bank', null);                     // Baltic Trade: paid through August
  pay('c-3', 6, 1, 'bank', null, 'pending', '2026-10-11T08:30:00');                // September payment still pending

  return {
    abonents: ABONENTS, contracts: CONTRACTS, meters: METERS, tariffs: TARIFFS,
    readings, bills, billLines, payments,
  };
}
