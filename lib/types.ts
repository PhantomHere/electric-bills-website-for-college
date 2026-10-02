// Mirrors the Postgres enums/tables from the Supabase schema.
// When Supabase is connected, these stay the same — only lib/mock-data.ts
// gets replaced by real queries.

export type StaffRole = 'admin' | 'operator' | 'controller' | 'viewer';
// Every account starts as a plain customer; "Work here?" requests a StaffRole.
export type AccountRole = 'customer' | StaffRole;

export type WorkAccessStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface Account {
  id: string;
  fullName: string;
  email: string;
  // Plaintext, demo-only — this stands in for Supabase Auth, which is the
  // only place a real password should ever be handled.
  password: string;
  role: AccountRole;
  workAccessStatus: WorkAccessStatus;
  requestedRole?: StaffRole; // which staff role they asked for, while pending
  abonentId?: string; // links a customer account to their abonent record
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

export type ContractStatus = 'active' | 'terminated';

export interface Contract {
  id: string;
  abonentId: string;
  contractNumber: string;
  address: string;
  status: ContractStatus;
}

export type BillStatus = 'accrued' | 'paid' | 'partially_paid' | 'overdue';

export interface Bill {
  id: string;
  contractId: string;
  periodStart: string; // ISO date
  periodEnd: string;
  amount: number;
  status: BillStatus;
  dueDate: string;
}

// Simple hierarchy so UI can do e.g. hasAtLeast(role, 'operator')
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
