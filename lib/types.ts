// Mirrors the Postgres tables/enums from the Supabase schema. When Supabase
// is connected these shapes stay; only the provider internals change.

export type StaffRole = 'admin' | 'operator' | 'controller' | 'viewer';
// Every account starts as a customer; "Work here?" requests a StaffRole.
export type AccountRole = 'customer' | StaffRole;
export type WorkAccessStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface Account {
  id: string;
  fullName: string;
  email: string;
  role: AccountRole;
  workAccessStatus: WorkAccessStatus;
  requestedRole?: StaffRole;
  abonentId?: string; // set once the customer links their contract
  createdAt: string; // from Supabase Auth (auth.users.created_at)
}

export interface Result<T = undefined> {
  ok: boolean;
  error?: string;
  value?: T;
}

export type AbonentType = 'individual' | 'legal';
export type AbonentStatus = 'active' | 'closed' | 'blocked';

export interface Abonent {
  id: string;
  accountNumber: string;
  fullName: string;
  type: AbonentType;
  status: AbonentStatus;
}

export interface Contract {
  id: string;
  abonentId: string;
  contractNumber: string;
  address: string;
  startDate: string;
  status: 'active' | 'terminated';
}

export type MeterType = 'single' | 'multi';
export type MeterStatus = 'active' | 'replaced' | 'faulty';

export interface Meter {
  id: string;
  contractId: string;
  serialNumber: string;
  type: MeterType;
  installDate: string;
  nextVerification: string;
  status: MeterStatus;
}

export type TariffZone = 'day' | 'night' | 'peak' | 'single';

export interface Tariff {
  id: string;
  name: string;
  zone: TariffZone;
  price: number; // per kWh
  validFrom: string;
  validTo: string | null;
  abonentType: AbonentType;
}

export type ReadingSource = 'manual' | 'automatic' | 'estimated';
export type ReadingStatus = 'pending' | 'verified' | 'rejected';

export interface Reading {
  id: string;
  meterId: string;
  date: string;
  day: number; // also used by single-zone meters
  night: number | null;
  peak: number | null;
  source: ReadingSource;
  enteredBy: string | null; // account id; null = automatic
  status: ReadingStatus;
  reviewedBy?: string;
  note?: string;
}

export interface Bill {
  id: string;
  contractId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  createdAt: string;
  consumptionDay: number;
  consumptionNight: number;
  consumptionPeak: number;
  amount: number;
  status: BillStatus; 
}

export interface BillLine {
  id: string;
  billId: string;
  zone: TariffZone;
  tariffName: string;
  consumption: number;
  price: number;
  amount: number;
}

export type PaymentMethod = 'cash' | 'card' | 'bank' | 'online';
export type PaymentStatus = 'success' | 'pending' | 'failed';

export interface Payment {
  id: string;
  billId: string;
  contractId: string;
  accountId: string | null;
  amount: number;
  date: string; // ISO datetime
  method: PaymentMethod;
  transactionId: string | null;
  status: PaymentStatus;
}

export type BillStatus = 'accrued' | 'paid' | 'partially_paid' | 'overdue';

// A bill plus everything derived from its lines and payments. Status is
// never stored — it is always computed, so it can't drift out of sync.
export interface BillView extends Bill {
  lines: BillLine[];
  payments: Payment[];
  paid: number;
  remaining: number;
  status: BillStatus;
  pastDue: boolean;
}

export interface DataState {
  abonents: Abonent[];
  contracts: Contract[];
  meters: Meter[];
  tariffs: Tariff[];
  readings: Reading[];
  bills: Bill[];
  billLines: BillLine[];
  payments: Payment[];
}

// Staff hierarchy so UI can do hasAtLeast(role, 'operator').
export const STAFF_LEVEL: Record<StaffRole, number> = {
  viewer: 1,
  controller: 2,
  operator: 3,
  admin: 4,
};

export function isStaff(role: AccountRole): role is StaffRole {
  return role !== 'customer';
}

export function hasAtLeast(role: AccountRole, min: StaffRole): boolean {
  return isStaff(role) && STAFF_LEVEL[role] >= STAFF_LEVEL[min];
}
