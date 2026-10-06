'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, FileText, LayoutDashboard, LogOut, HelpCircle } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { isStaff } from '@/lib/types';
import { initials } from '@/lib/format';

export function SiteHeader() {
  const { account, logout } = useSession();
  const pathname = usePathname();

  // AppShell only renders SiteHeader once an account exists, but the type
  // is still nullable here — guard rather than assert.
  if (!account) return null;

  const links = [
    { href: '/bills', label: 'My bills', icon: FileText },
    ...(isStaff(account.role) && account.workAccessStatus === 'approved'
      ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
      : []),
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-[#eee] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
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
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-[#f2f2f2] text-black' : 'text-[#555] hover:bg-[#f2f2f2] hover:text-black'
                }`}
              >
                <l.icon className="h-3.5 w-3.5" />
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/profile"
            className={`ml-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
              pathname === '/profile'
                ? 'bg-black text-white'
                : 'bg-[#f2f2f2] text-[#1a1a1a] hover:bg-[#e8e8e8]'
            }`}
            title="Profile settings"
          >
            {initials(account.fullName)}
          </Link>
          <button
            onClick={logout}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-[#666] hover:bg-[#f2f2f2] hover:text-black"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
