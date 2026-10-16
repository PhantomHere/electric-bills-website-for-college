'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Banknote, FileText, Gauge, HelpCircle, LayoutDashboard, LogOut, Menu, Tag, X, Zap,
} from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { isApprovedStaff } from '@/lib/permissions';
import { initials } from '@/lib/format';

export function SiteHeader() {
  const { account, logout } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  // AppShell only renders the header once an account exists, but the type
  // is nullable — guard rather than assert.
  if (!account) return null;

  const staff = isApprovedStaff(account);
  const showCustomer = !staff || !!account.abonentId;

  const links = [
    ...(showCustomer
      ? [
          { href: '/bills', label: 'Bills', icon: FileText },
          { href: '/meters', label: 'Meters', icon: Gauge },
          { href: '/payments', label: 'Payments', icon: Banknote },
        ]
      : []),
    { href: '/tariffs', label: 'Tariffs', icon: Tag },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
    ...(staff ? [{ href: '/dashboard', label: 'Staff', icon: LayoutDashboard }] : []),
  ];

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

  return (
    <header className="sticky top-0 z-30 border-b border-[#eee] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Zap className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          </span>
          Volt
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(l.href) ? 'bg-[#f2f2f2] text-black' : 'text-[#555] hover:bg-[#f2f2f2] hover:text-black'
              }`}
            >
              <l.icon className="h-3.5 w-3.5" />
              {l.label}
            </Link>
          ))}
          <Link
            href="/profile"
            aria-label="Profile settings"
            title={account.fullName}
            className={`ml-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              pathname === '/profile' ? 'bg-black text-white' : 'bg-[#f2f2f2] hover:bg-[#e8e8e8]'
            }`}
          >
            {initials(account.fullName)}
          </Link>
          <button
            onClick={logout}
            aria-label="Log out"
            title="Log out"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-[#666] transition-colors hover:bg-[#f2f2f2] hover:text-black"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#f2f2f2] md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav aria-label="Mobile" className="animate-fade-in border-t border-[#eee] bg-white px-6 pb-4 pt-2 md:hidden">
          <Link href="/profile" className="flex items-center gap-3 rounded-xl px-2 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2f2] text-xs font-semibold">
              {initials(account.fullName)}
            </span>
            <span>
              <span className="block text-sm font-semibold">{account.fullName}</span>
              <span className="block text-xs text-[#888]">{account.role} · Profile settings</span>
            </span>
          </Link>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-xl px-2 py-3 text-sm font-medium ${isActive(l.href) ? 'bg-[#f2f2f2]' : ''}`}
            >
              <l.icon className="h-4 w-4 text-[#666]" />
              {l.label}
            </Link>
          ))}
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-sm font-medium text-[#DB3E3E]">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
