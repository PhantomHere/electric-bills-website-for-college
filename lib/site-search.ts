export interface SearchItem {
  label: string;
  href: string;
  description: string;
  keywords: string[];
}

// Static index for the home page search box. Small enough to filter
// client-side with no debounce/server round trip needed.
export const SEARCH_INDEX: SearchItem[] = [
  { label: 'My bills', href: '/bills', description: 'Current and past billing periods', keywords: ['bill', 'invoice', 'pay', 'payment', 'amount', 'due'] },
  { label: 'Profile settings', href: '/profile', description: 'Contact details and staff access', keywords: ['profile', 'account', 'settings', 'email', 'work here'] },
  { label: 'Staff dashboard', href: '/dashboard', description: 'Abonents, contracts and bills', keywords: ['dashboard', 'staff', 'abonent', 'contract'] },
  { label: 'Access requests', href: '/dashboard/requests', description: 'Approve or reject staff access requests', keywords: ['admin', 'approve', 'reject', 'request', 'role'] },
  { label: 'FAQ', href: '/faq', description: 'Common questions about accounts and billing', keywords: ['faq', 'help', 'question', 'how'] },
];

export function searchSite(query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_INDEX.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
  );
}
