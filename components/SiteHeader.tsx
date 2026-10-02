'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, FileText, User, LayoutDashboard } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { isStaff } from '@/lib/types';
import { initials } from '@/lib/format';

export function SiteHeader() {
  const { account } = useSession();
  const pathname = usePathname();

  const links = [
    { href: '/bills', label: 'My bills', icon: FileText, show: true },
    ...(isStaff(account.role) && account.workAccessStatus === 'approved'
      ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true }]
      : []),
  ];

  return (
    <header className="border-b border-[#E2E8F0]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B2545] text-white">
            <Zap className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          </span>
          Volt
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? 'bg-[#0B2545] text-white' : 'text-[#64748B] hover:text-[#0B2545]'
                }`}
              >
                <l.icon className="h-3.5 w-3.5" />
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/profile"
            className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
              pathname === '/profile'
                ? 'bg-[#0B2545] text-white'
                : 'bg-[#F2F6FB] text-[#0B2545] hover:bg-[#0B2545]/10'
            }`}
            title="Profile settings"
          >
            {initials(account.fullName)}
          </Link>
        </nav>
      </div>
    </header>
  );
}
