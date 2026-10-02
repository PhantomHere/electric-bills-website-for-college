'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-provider';
import { isStaff, BillStatus } from '@/lib/types';
import { mockContracts, mockBills, mockAbonents } from '@/lib/mock-data';
import { BillsTable } from '@/components/BillsTable';
import { NoticeBox } from '@/components/NoticeBox';
import { Tabs } from '@/components/Tabs';

type Filter = 'all' | 'unpaid' | 'paid';
const UNPAID: BillStatus[] = ['accrued', 'overdue', 'partially_paid'];

export default function HomePage() {
  const { account } = useSession();
  const [filter, setFilter] = useState<Filter>('all');

  const contracts = account.abonentId
    ? mockContracts.filter((c) => c.abonentId === account.abonentId)
    : [];
  const myBills = mockBills
    .filter((b) => contracts.some((c) => c.id === b.contractId))
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart));
  const outstanding = myBills.find((b) => b.status === 'accrued' || b.status === 'overdue');
  const visibleBills = myBills.filter((b) =>
    filter === 'all' ? true : filter === 'paid' ? b.status === 'paid' : UNPAID.includes(b.status)
  );

  const staffApproved = isStaff(account.role) && account.workAccessStatus === 'approved';
  const overdueCount = mockBills.filter((b) => b.status === 'overdue').length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Hi, {account.fullName}
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">Signed in as {account.role}</p>
        </div>

        {account.abonentId ? (
          <div className="rounded-2xl bg-[#F2F6FB] p-6">
            <p className="text-sm text-[#64748B]">
              {outstanding ? 'Amount due' : 'Account status'}
            </p>
            {outstanding ? (
              <>
                <p className="mt-1 font-mono text-3xl font-medium">
                  {outstanding.amount.toFixed(2)} ₽
                </p>
                <p className="mt-1 text-sm text-[#64748B]">Due {outstanding.dueDate}</p>
              </>
            ) : (
              <p className="mt-1 text-lg font-semibold">You&apos;re all caught up</p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#F2F6FB] p-6">
            <p className="text-sm font-semibold">Across all accounts</p>
            <p className="mt-1 font-mono text-3xl font-medium">{overdueCount}</p>
            <p className="mt-1 text-sm text-[#64748B]">bills currently overdue</p>
          </div>
        )}
      </div>

      {outstanding && (
        <div className="mt-6">
          <NoticeBox>
            Your bill for {outstanding.periodStart} – {outstanding.periodEnd} is due{' '}
            {outstanding.dueDate}.{' '}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E2E8F0] p-5">
              <p className="text-sm text-[#64748B]">Abonents</p>
              <p className="mt-1 font-mono text-2xl font-medium">{mockAbonents.length}</p>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] p-5">
              <p className="text-sm text-[#64748B]">Overdue bills</p>
              <p className="mt-1 font-mono text-2xl font-medium">{overdueCount}</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
