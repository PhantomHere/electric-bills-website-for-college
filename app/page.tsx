'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, UserCog, LayoutDashboard } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { isStaff, BillStatus } from '@/lib/types';
import { mockContracts, mockBills, mockAbonents } from '@/lib/mock-data';
import { BillsTable } from '@/components/BillsTable';
import { NoticeBox } from '@/components/NoticeBox';
import { Tabs } from '@/components/Tabs';

type Filter = 'all' | 'unpaid' | 'paid';
const UNPAID: BillStatus[] = ['accrued', 'overdue', 'partially_paid'];

export default function HomePage() {
  const { account, allAccounts } = useSession();
  const [filter, setFilter] = useState<Filter>('all');
  if (!account) return null; // AppShell redirects before this would ever show

  const staffApproved = isStaff(account.role) && account.workAccessStatus === 'approved';

  const contracts = account.abonentId
    ? mockContracts.filter((c) => c.abonentId === account.abonentId)
    : [];
  const myBills = mockBills
    .filter((b) => contracts.some((c) => c.id === b.contractId))
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart));
  const overdueBill = myBills.find((b) => b.status === 'overdue');
  const visibleBills = myBills.filter((b) =>
    filter === 'all' ? true : filter === 'paid' ? b.status === 'paid' : UNPAID.includes(b.status)
  );

  const overdueCount = mockBills.filter((b) => b.status === 'overdue').length;
  const pendingRequests = allAccounts.filter((a) => a.workAccessStatus === 'pending').length;

  const services = [
    { href: '/bills', label: 'My bills', desc: 'Current and past periods', icon: FileText },
    { href: '/profile', label: 'Profile settings', desc: 'Contact details, staff access', icon: UserCog },
    ...(staffApproved
      ? [{ href: '/dashboard', label: 'Staff dashboard', desc: 'Abonents and contracts', icon: LayoutDashboard }]
      : []),
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold leading-tight tracking-tight">Hi, {account.fullName}</h1>
      <p className="mt-2 text-sm text-[#64748B]">Signed in as {account.role}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {services.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-2xl border border-[#E2E8F0] p-5 transition-colors hover:border-[#0B2545]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F6FB]">
              <s.icon className="h-4 w-4 text-[#0B2545]" />
            </span>
            <p className="mt-3 font-semibold">{s.label}</p>
            <p className="mt-0.5 text-sm text-[#64748B]">{s.desc}</p>
          </Link>
        ))}
      </div>

      {overdueBill && (
        <div className="mt-8">
          <NoticeBox>
            Your bill for {overdueBill.periodStart} – {overdueBill.periodEnd} was due{' '}
            {overdueBill.dueDate} and is now overdue.{' '}
            <Link href="/bills" className="font-semibold underline">
              Review and pay
            </Link>
          </NoticeBox>
        </div>
      )}

      {account.abonentId && myBills.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-lg font-semibold">Recent bills</h2>
            <Link href="/bills" className="text-sm font-semibold text-[#2F6FB0] hover:underline">
              View all →
            </Link>
          </div>
          <Tabs
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'paid', label: 'Paid' },
            ]}
          />
          <div className="mt-4">
            <BillsTable bills={visibleBills.slice(0, 3)} />
          </div>
        </section>
      )}

      {staffApproved && (
        <section className="mt-12">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Staff overview</h2>
            <Link href="/dashboard" className="text-sm font-semibold text-[#2F6FB0] hover:underline">
              Open dashboard →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E2E8F0] p-5">
              <p className="text-sm text-[#64748B]">Abonents</p>
              <p className="mt-1 font-mono text-2xl font-medium">{mockAbonents.length}</p>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] p-5">
              <p className="text-sm text-[#64748B]">Overdue bills</p>
              <p className="mt-1 font-mono text-2xl font-medium">{overdueCount}</p>
            </div>
            {account.role === 'admin' && (
              <Link
                href="/dashboard/requests"
                className="rounded-2xl border border-[#E2E8F0] p-5 transition-colors hover:border-[#0B2545]"
              >
                <p className="text-sm text-[#64748B]">Pending requests</p>
                <p className="mt-1 font-mono text-2xl font-medium">{pendingRequests}</p>
              </Link>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
