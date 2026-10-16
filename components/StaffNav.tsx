'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { canBill, canManageAccess, canReviewReadings } from '@/lib/permissions';

// Sub-navigation shown inside the gradient header of every staff page,
// limited to what the signed-in role can actually open.
export function StaffNav() {
  const { account, allAccounts } = useSession();
  const { data } = useData();
  const pathname = usePathname();

  const pendingReadings = data.readings.filter((r) => r.status === 'pending').length;
  const pendingRequests = allAccounts.filter((a) => a.workAccessStatus === 'pending').length;

  const items = [
    { href: '/dashboard', label: 'Overview', show: true, badge: 0 },
    { href: '/dashboard/readings', label: 'Readings', show: canReviewReadings(account), badge: pendingReadings },
    { href: '/dashboard/billing', label: 'Billing', show: canBill(account), badge: 0 },
    { href: '/dashboard/requests', label: 'Access requests', show: canManageAccess(account), badge: pendingRequests },
  ].filter((i) => i.show);

  return (
    <nav aria-label="Staff sections" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-white/50 p-1 backdrop-blur">
      {items.map((i) => {
        const active = pathname === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              active ? 'bg-white text-black shadow-sm' : 'text-[#333] hover:bg-white/60'
            }`}
          >
            {i.label}
            {i.badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[11px] font-semibold text-white">
                {i.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
