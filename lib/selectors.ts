import { Abonent, BillView, Contract, DataState, Meter, Reading } from './types';

export const contractsOf = (d: DataState, abonentId: string): Contract[] =>
  d.contracts.filter((c) => c.abonentId === abonentId);

export const metersOf = (d: DataState, contractIds: string[]): Meter[] =>
  d.meters.filter((m) => contractIds.includes(m.contractId));

export const billsOf = (bills: BillView[], contractIds: string[]): BillView[] =>
  bills.filter((b) => contractIds.includes(b.contractId));

export const abonentOfContract = (d: DataState, contractId: string): Abonent | undefined => {
  const c = d.contracts.find((x) => x.id === contractId);
  return c ? d.abonents.find((a) => a.id === c.abonentId) : undefined;
};

export const readingsOf = (d: DataState, meterId: string): Reading[] =>
  d.readings.filter((r) => r.meterId === meterId).sort((a, b) => b.date.localeCompare(a.date));

export const latestVerified = (d: DataState, meterId: string): Reading | undefined =>
  readingsOf(d, meterId).find((r) => r.status === 'verified');

export const sumRemaining = (bills: BillView[]): number =>
  Math.round(bills.reduce((s, b) => s + b.remaining, 0) * 100) / 100;
