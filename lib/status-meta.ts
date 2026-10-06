import { BillStatus } from './types';

// Soft-tint status pills — one color family per state, used everywhere
// a bill status shows up.
export const STATUS_META: Record<BillStatus, { label: string; chip: string; text: string }> = {
  paid: { label: 'Paid', chip: 'bg-[#e6f9ef]', text: 'text-[#04C65D]' },
  accrued: { label: 'Accrued', chip: 'bg-[#fff8e6]', text: 'text-[#d97706]' },
  partially_paid: { label: 'Partially paid', chip: 'bg-[#eff6ff]', text: 'text-[#3B82F6]' },
  overdue: { label: 'Overdue', chip: 'bg-[#fde8e8]', text: 'text-[#DB3E3E]' },
};
