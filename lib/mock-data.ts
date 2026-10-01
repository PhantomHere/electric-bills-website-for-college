import { Account, Abonent, Contract, Bill } from './types';

// Stand-in for `select * from public.abonents`
export const mockAbonents: Abonent[] = [
  { id: 'ab-1', accountNumber: '100001', fullName: 'Ivan Petrov', type: 'individual', status: 'active' },
  { id: 'ab-2', accountNumber: '100002', fullName: 'Anna Schmidt', type: 'individual', status: 'active' },
];

// Stand-in for `select * from public.contracts`
export const mockContracts: Contract[] = [
  { id: 'c-1', abonentId: 'ab-1', contractNumber: 'C-2024-001', address: 'Leninsky Prospekt 10-5', status: 'active' },
  { id: 'c-2', abonentId: 'ab-2', contractNumber: 'C-2024-002', address: 'Gagarina Street 22-17', status: 'active' },
];

// Stand-in for `select * from public.bills`
export const mockBills: Bill[] = [
  { id: 'b-1', contractId: 'c-1', periodStart: '2026-06-01', periodEnd: '2026-07-01', amount: 1423.5, status: 'paid', dueDate: '2026-07-21' },
  { id: 'b-2', contractId: 'c-1', periodStart: '2026-07-01', periodEnd: '2026-08-01', amount: 1510.0, status: 'partially_paid', dueDate: '2026-08-21' },
  { id: 'b-3', contractId: 'c-1', periodStart: '2026-08-01', periodEnd: '2026-09-01', amount: 1602.75, status: 'accrued', dueDate: '2026-09-21' },
  { id: 'b-4', contractId: 'c-2', periodStart: '2026-06-01', periodEnd: '2026-07-01', amount: 980.2, status: 'paid', dueDate: '2026-07-21' },
  { id: 'b-5', contractId: 'c-2', periodStart: '2026-07-01', periodEnd: '2026-08-01', amount: 1005.4, status: 'overdue', dueDate: '2026-08-21' },
];

// Stand-in for `select * from public.users` joined with an auth account.
// role/workAccessStatus mimic what would sit in the `users` table once
// someone's "Work here?" request has been approved by an admin.
export const mockAccounts: Account[] = [
  { id: 'acc-1', fullName: 'Ivan Petrov', email: 'ivan.petrov@example.com', role: 'customer', workAccessStatus: 'none', abonentId: 'ab-1' },
  { id: 'acc-2', fullName: 'Anna Schmidt', email: 'anna.schmidt@example.com', role: 'customer', workAccessStatus: 'pending', requestedRole: 'controller', abonentId: 'ab-2' },
  { id: 'acc-3', fullName: 'Maria Sokolova', email: 'admin@example.com', role: 'admin', workAccessStatus: 'approved' },
  { id: 'acc-4', fullName: 'Dmitry Kuznetsov', email: 'operator1@example.com', role: 'operator', workAccessStatus: 'approved' },
];
