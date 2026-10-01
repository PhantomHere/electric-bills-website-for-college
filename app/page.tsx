'use client';

import Link from 'next/link';
import { useSession } from '@/lib/session-provider';
import { isStaff } from '@/lib/types';
import { AccountSwitcher } from '@/components/AccountSwitcher';

export default function HomePage() {
  const { account } = useSession();

  const links = [
    { href: '/bills', label: 'My bills', hint: 'Current and past periods' },
    { href: '/profile', label: 'Profile settings', hint: 'Contact details, staff access' },
    ...(isStaff(account.role) && account.workAccessStatus === 'approved'
      ? [{ href: '/dashboard', label: 'Staff dashboard', hint: 'All abonents and contracts' }]
      : []),
  ];

  return (
    <main className="min-h-screen">
      <AccountSwitcher />
      <div className="mx-auto grid max-w-4xl gap-10 px-6 py-12 md:grid-cols-[1.3fr_1fr]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hi, {account.fullName}</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Signed in as {account.role}
            {account.workAccessStatus === 'pending' && ' — staff request pending'}
          </p>

          <nav className="mt-8 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] px-5 py-4 transition-colors hover:border-[#0B2545]"
              >
                <span className="font-medium">{l.label}</span>
                <span className="text-sm text-[#64748B]">{l.hint}</span>
              </Link>
            ))}
          </nav>
        </div>

        <aside className="h-fit rounded-2xl bg-[#F2F6FB] p-6">
          <h2 className="text-sm font-semibold">Account status</h2>
          <p className="mt-2 text-sm text-[#64748B]">
            {account.workAccessStatus === 'approved'
              ? `You have ${account.role} access to the staff side of this account.`
              : account.workAccessStatus === 'pending'
              ? `Your request to join as ${account.requestedRole} is with an admin for review.`
              : 'This is a customer account. You can request staff access from Profile settings.'}
          </p>
        </aside>
      </div>
    </main>
  );
}
