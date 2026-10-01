import { BillStatus } from './types';

// One mapping, used everywhere a bill status appears. Navy carries most of
// the UI, so status is mostly shades of navy — red is kept in reserve for
// the one state that actually needs to alarm someone: overdue.
export const STATUS_META: Record<BillStatus, { label: string; chip: string; text: string }> = {
  paid: { label: 'Paid', chip: 'bg-[#0B2545]/8', text: 'text-[#0B2545]' },
  accrued: { label: 'Accrued', chip: 'bg-[#64748B]/10', text: 'text-[#64748B]' },
  partially_paid: { label: 'Partially paid', chip: 'bg-[#2F6FB0]/10', text: 'text-[#2F6FB0]' },
  overdue: { label: 'Overdue', chip: 'bg-[#C0392B]/10', text: 'text-[#C0392B]' },
};
