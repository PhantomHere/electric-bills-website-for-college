import { Account } from './types';
import { canBill, canManageAccess, canReviewReadings, isApprovedStaff } from './permissions';

export interface SearchItem {
  label: string;
  href: string;
  description: string;
  keywords: string[];
  access?: 'staff' | 'controller' | 'operator' | 'admin';
}

export const SEARCH_INDEX: SearchItem[] = [
  { label: 'My bills', href: '/bills', description: 'Current and past billing periods, line by line', keywords: ['bill', 'invoice', 'pay', 'amount', 'due', 'debt'] },
  { label: 'Meters & readings', href: '/meters', description: 'Submit a reading, see your meter history', keywords: ['meter', 'reading', 'submit', 'kwh', 'verification'] },
  { label: 'Payments', href: '/payments', description: 'Payment history and receipts', keywords: ['payment', 'receipt', 'paid', 'history', 'transaction'] },
  { label: 'Tariffs', href: '/tariffs', description: 'What a kilowatt-hour costs, by zone', keywords: ['tariff', 'price', 'rate', 'cost', 'night', 'day', 'peak'] },
  { label: 'Profile settings', href: '/profile', description: 'Your details, password, linked contract, staff access', keywords: ['profile', 'account', 'password', 'email', 'contract', 'link', 'work here'] },
  { label: 'FAQ', href: '/faq', description: 'How accounts, readings and billing work', keywords: ['faq', 'help', 'question', 'how', 'support'] },
  { label: 'Staff dashboard', href: '/dashboard', description: 'Abonents, balances and bills', keywords: ['dashboard', 'staff', 'abonent', 'customers'], access: 'staff' },
  { label: 'Review readings', href: '/dashboard/readings', description: 'Verify or reject submitted meter readings', keywords: ['review', 'verify', 'reject', 'readings', 'controller'], access: 'controller' },
  { label: 'Generate bills', href: '/dashboard/billing', description: 'Create a bill from verified readings', keywords: ['billing', 'generate', 'create bill', 'operator'], access: 'operator' },
  { label: 'Access requests', href: '/dashboard/requests', description: 'Approve or revoke staff access', keywords: ['admin', 'approve', 'reject', 'request', 'role', 'revoke'], access: 'admin' },
];

function visible(item: SearchItem, account: Account | null): boolean {
  switch (item.access) {
    case 'staff': return isApprovedStaff(account);
    case 'controller': return canReviewReadings(account);
    case 'operator': return canBill(account);
    case 'admin': return canManageAccess(account);
    default: return true;
  }
}

export function searchSite(query: string, account: Account | null): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_INDEX.filter(
    (item) =>
      visible(item, account) &&
      (item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q) || q.includes(k)))
  ).sort((a, b) => Number(b.label.toLowerCase().startsWith(q)) - Number(a.label.toLowerCase().startsWith(q)));
}
