import { BillStatus } from './types';
import { Tone } from '@/components/Badge';

export const STATUS_META: Record<BillStatus, { label: string; tone: Tone }> = {
  paid: { label: 'Paid', tone: 'green' },
  accrued: { label: 'Awaiting payment', tone: 'amber' },
  partially_paid: { label: 'Partially paid', tone: 'blue' },
  overdue: { label: 'Overdue', tone: 'red' },
};
