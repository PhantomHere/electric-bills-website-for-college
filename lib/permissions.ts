import { Account, hasAtLeast, isStaff, StaffRole } from './types';

type A = Account | null | undefined;

export function isApprovedStaff(a: A): boolean {
  return !!a && isStaff(a.role) && a.workAccessStatus === 'approved';
}

function atLeast(a: A, min: StaffRole): boolean {
  return !!a && a.workAccessStatus === 'approved' && hasAtLeast(a.role, min);
}

export const canReviewReadings = (a: A) => atLeast(a, 'controller');
export const canBill = (a: A) => atLeast(a, 'operator');
export const canManageAccess = (a: A) => atLeast(a, 'admin');
