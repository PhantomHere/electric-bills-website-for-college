'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, UserCog, LayoutDashboard, HelpCircle, ShieldCheck } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { isStaff, BillStatus } from '@/lib/types';
import { mockContracts, mockBills, mockAbonents } from '@/lib/mock-data';
import { FAQ } from '@/lib/faq-data';
import { BillsTable } from '@/components/BillsTable';
import { NoticeBox } from '@/components/NoticeBox';
import { Tabs } from '@/components/Tabs';
import { SiteSearch } from '@/components/SiteSearch';
import { ServiceCarousel, ServiceCard } from '@/components/ServiceCarousel';
import { CategoryGrid } from '@/components/CategoryGrid';

type BillFilter = 'all' | 'unpaid' | 'paid';
const UNPAID: BillStatus[] = ['accrued', 'overdue', 'partially_paid'];

const STEPS = [
  { n: 1, title: 'Create an account', desc: 'Register with your name, email and a password.' },
  { n: 2, title: 'See your bills', desc: 'Every period, its amount, due date and status.' },
  { n: 3, title: 'Request staff access', desc: 'Optional — ask to join as controller, operator or viewer.' },
  { n: 4, title: 'Get approved', desc: 'An admin reviews it; approval applies immediately.' },
];

export default function HomePage() {
  const { account, allAccounts } = useSession();
  const [billFilter, setBillFilter] = useState<BillFilter>('all');
  const [audience, setAudience] = useState<'customer' | 'staff'>('customer');
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
    billFilter === 'all' ? true : billFilter === 'paid' ? b.status === 'paid' : UNPAID.includes(b.status)
  );

  const overdueCount = mockBills.filter((b) => b.status === 'overdue').length;
  const pendingRequests = allAccounts.filter((a) => a.workAccessStatus === 'pending').length;
  const staffCount = allAccounts.filter((a) => isStaff(a.role) && a.workAccessStatus === 'approved').length;

  const popular: ServiceCard[] = [
    { href: '/bills', label: 'My bills', description: 'Current and past periods', icon: FileText },
    { href: '/profile', label: 'Profile settings', description: 'Contact details, staff access', icon: UserCog },
    ...(staffApproved
      ? [{ href: '/dashboard', label: 'Staff dashboard', description: 'Abonents and contracts', icon: LayoutDashboard }]
      : []),
    ...(account.role === 'admin'
      ? [{ href: '/dashboard/requests', label: 'Access requests', description: `${pendingRequests} pending`, icon: ShieldCheck }]
      : []),
    { href: '/faq', label: 'FAQ', description: 'How accounts and billing work', icon: HelpCircle },
  ];

  const customerCategory: ServiceCard[] = [
    { href: '/bills', label: 'My bills', description: 'View current and past billing periods, see what\u2019s paid, due or overdue', icon: FileText },
    { href: '/profile', label: 'Profile settings', description: 'Update your details or request staff access', icon: UserCog },
    { href: '/faq', label: 'FAQ', description: 'How bills are calculated and how the demo works', icon: HelpCircle },
  ];

  const staffCategory: ServiceCard[] = [
    { href: '/dashboard', label: 'Staff dashboard', description: 'Browse every abonent, contract and bill', icon: LayoutDashboard },
    ...(account.role === 'admin'
      ? [{ href: '/dashboard/requests', label: 'Access requests', description: `Review ${pendingRequests} pending staff request${pendingRequests === 1 ? '' : 's'}`, icon: ShieldCheck }]
      : []),
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden px-8 pb-20 pt-24 text-center">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'linear-gradient(135deg, #a8e6cf 0%, #88d3ce 20%, #7eb8da 45%, #9b8fd9 70%, #c9a0dc 100%)',
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <h1 className="text-[clamp(32px,5vw,48px)] font-bold leading-tight tracking-tight">
            Hi, {account.fullName}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-[#222] opacity-85">
            Electricity billing, in one place — signed in as {account.role}.
          </p>
          <div className="mt-8">
            <SiteSearch />
          </div>
          <p className="mt-3 text-sm text-[#333]">
            For example: <Link href="/bills" className="font-medium underline">my bills</Link> or{' '}
            <Link href="/faq" className="font-medium underline">how billing works</Link>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-8">
        {/* Popular */}
        <section className="py-14">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">Popular</h2>
          <ServiceCarousel items={popular} />
        </section>

        {overdueBill && (
          <div className="pb-4">
            <NoticeBox>
              Your bill for {overdueBill.periodStart} – {overdueBill.periodEnd} was due{' '}
              {overdueBill.dueDate} and is now overdue.{' '}
              <Link href="/bills" className="font-semibold underline">
                Review and pay
              </Link>
            </NoticeBox>
          </div>
        )}
      </div>

      {/* How it works */}
      <section className="bg-[#f7f8fa] py-16">
        <div className="mx-auto max-w-6xl px-8">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-[#666]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-8">
        {/* Real stats */}
        <section className="py-16">
          <h2 className="mb-1 text-2xl font-bold tracking-tight">This demo, right now</h2>
          <p className="mb-8 text-sm text-[#888]">
            Counted live from the mock dataset — not marketing numbers.
          </p>
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            <div>
              <div className="text-4xl font-bold tracking-tight">{mockAbonents.length}</div>
              <div className="mt-1 text-sm text-[#666]">abonents</div>
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight">{mockBills.length}</div>
              <div className="mt-1 text-sm text-[#666]">bills tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight">{overdueCount}</div>
              <div className="mt-1 text-sm text-[#666]">overdue now</div>
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight">{staffCount}</div>
              <div className="mt-1 text-sm text-[#666]">approved staff</div>
            </div>
          </div>
        </section>

        {/* Category grid */}
        <section className="pb-16">
          {staffApproved ? (
            <>
              <Tabs
                value={audience}
                onChange={setAudience}
                options={[
                  { value: 'customer', label: 'For your account' },
                  { value: 'staff', label: 'For staff' },
                ]}
              />
              <div className="mt-6">
                <CategoryGrid items={audience === 'customer' ? customerCategory : staffCategory} />
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-5 text-2xl font-bold tracking-tight">For your account</h2>
              <CategoryGrid items={customerCategory} />
            </>
          )}
        </section>
      </div>

      {/* Good to know */}
      <section className="bg-[#f7f8fa] py-16">
        <div className="mx-auto max-w-6xl px-8">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">Good to know</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-6">
              <span className="inline-block rounded-full bg-[#fff8e6] px-2.5 py-1 text-xs font-semibold text-[#d97706]">
                Tip
              </span>
              <h3 className="mt-3 font-semibold">Request staff access anytime</h3>
              <p className="mt-1.5 text-sm text-[#666]">
                Open Profile settings and ask to join as controller, operator or viewer.
              </p>
              <Link href="/profile" className="mt-3 block text-sm font-semibold underline">
                Request access →
              </Link>
            </div>
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-6">
              <span className="inline-block rounded-full bg-[#e6f9ef] px-2.5 py-1 text-xs font-semibold text-[#04C65D]">
                New
              </span>
              <h3 className="mt-3 font-semibold">Approvals happen instantly</h3>
              <p className="mt-1.5 text-sm text-[#666]">
                Once an admin approves a request, the role applies immediately.
              </p>
              <Link href="/faq" className="mt-3 block text-sm font-semibold underline">
                Learn more →
              </Link>
            </div>
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-6">
              <span className="inline-block rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-semibold text-[#3B82F6]">
                Service
              </span>
              <h3 className="mt-3 font-semibold">Everything in one place</h3>
              <p className="mt-1.5 text-sm text-[#666]">
                Bills, statuses and staff tools all live under one account.
              </p>
              <Link href="/bills" className="mt-3 block text-sm font-semibold underline">
                View my bills →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-8">
        {account.abonentId && myBills.length > 0 && (
          <section className="py-16">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Recent bills</h2>
              <Link href="/bills" className="text-sm font-semibold underline">
                View all →
              </Link>
            </div>
            <Tabs
              value={billFilter}
              onChange={setBillFilter}
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

        <section className="pb-20">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Frequently asked</h2>
            <Link href="/faq" className="text-sm font-semibold underline">
              All questions →
            </Link>
          </div>
          <dl className="divide-y divide-[#f0f0f0] rounded-2xl border border-[#e8e8e8]">
            {FAQ.slice(0, 3).map((item) => (
              <div key={item.q} className="px-6 py-5">
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-1.5 text-sm text-[#666]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
