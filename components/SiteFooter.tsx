'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { canBill, canManageAccess, canReviewReadings, isApprovedStaff } from '@/lib/permissions';

export function SiteFooter() {
  const { account } = useSession();

  const columns: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: 'Account',
      links: [
        { href: '/bills', label: 'Bills' },
        { href: '/meters', label: 'Meters & readings' },
        { href: '/payments', label: 'Payments' },
        { href: '/profile', label: 'Profile settings' },
      ],
    },
    {
      title: 'Information',
      links: [
        { href: '/tariffs', label: 'Tariffs' },
        { href: '/faq', label: 'FAQ' },
      ],
    },
  ];
  if (isApprovedStaff(account)) {
    columns.push({
      title: 'Staff',
      links: [
        { href: '/dashboard', label: 'Overview' },
        ...(canReviewReadings(account) ? [{ href: '/dashboard/readings', label: 'Review readings' }] : []),
        ...(canBill(account) ? [{ href: '/dashboard/billing', label: 'Generate bills' }] : []),
        ...(canManageAccess(account) ? [{ href: '/dashboard/requests', label: 'Access requests' }] : []),
      ],
    });
  }

  return (
    <footer className="mt-20 bg-[#1a1a1a] text-white">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-[2fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5 text-lg font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                <Zap className="h-4 w-4" fill="currentColor" strokeWidth={0} />
              </span>
              Volt
            </div>
            <p className="mt-3 max-w-xs text-sm text-[#aaa]">
              Electricity billing. Running on demo data — nothing here is billed for real.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-sm font-semibold">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-[#aaa] transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-[#333] pt-6 text-xs text-[#777]">
          Volt is a demo built for coursework — not a real utility, and no real payments are taken.
        </p>
      </div>
    </footer>
  );
}
