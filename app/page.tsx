'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight, ArrowUpRight, Banknote, CalendarClock, FileText, Gauge, HelpCircle, LayoutDashboard,
  Receipt as ReceiptIcon, ShieldCheck, Tag, UserCog, Wallet, Zap,
} from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { BillView, Payment } from '@/lib/types';
import { canBill, canManageAccess, canReviewReadings, isApprovedStaff } from '@/lib/permissions';
import { billsOf, contractsOf, latestVerified, metersOf, sumRemaining } from '@/lib/selectors';
import { customerNotices } from '@/lib/notifications';
import { FAQ } from '@/lib/faq-data';
import {
  daysBetween, formatDate, formatKwh, formatMoney, formatNumber, greeting, monthLabel, todayISO,
} from '@/lib/format';
import { Badge } from '@/components/Badge';
import { BillsList } from '@/components/BillsList';
import { Button, LinkButton } from '@/components/Button';
import { Card, CardTitle } from '@/components/Card';
import { ConsumptionChart } from '@/components/ConsumptionChart';
import { EmptyState } from '@/components/EmptyState';
import { FaqAccordion } from '@/components/FaqAccordion';
import { LinkContractCard } from '@/components/LinkContractCard';
import { NotificationList } from '@/components/NotificationList';
import { PayModal } from '@/components/PayModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { ServiceCard, ServiceCarousel } from '@/components/ServiceCarousel';
import { SiteSearch } from '@/components/SiteSearch';
import { StatCard } from '@/components/StatCard';

const PAYMENT_TONE = { success: 'green', pending: 'amber', failed: 'red' } as const;

export default function HomePage() {
  const { account, allAccounts } = useSession();
  const { data, bills } = useData();
  const [paying, setPaying] = useState<BillView | null>(null);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  if (!account) return null; // AppShell redirects before this would ever show

  const today = todayISO();
  const staff = isApprovedStaff(account);
  const firstName = account.fullName.split(' ')[0];

  const contracts = account.abonentId ? contractsOf(data, account.abonentId) : [];
  const contractIds = contracts.map((c) => c.id);
  const myBills = billsOf(bills, contractIds);
  const unpaid = myBills.filter((b) => b.remaining > 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const balance = sumRemaining(myBills);
  const nextDue = unpaid[0];
  const meters = metersOf(data, contractIds);
  const mainMeter = meters.find((m) => m.status === 'active');
  const lastReading = mainMeter ? latestVerified(data, mainMeter.id) : undefined;

  const lastBill = myBills[0];
  const prevBill = lastBill && myBills.find((b) => b.contractId === lastBill.contractId && b.periodStart < lastBill.periodStart);
  const change = lastBill && prevBill && prevBill.amount > 0 ? ((lastBill.amount - prevBill.amount) / prevBill.amount) * 100 : null;

  const byPeriod = new Map<string, { label: string; day: number; night: number; peak: number }>();
  for (const b of myBills) {
    const cur = byPeriod.get(b.periodStart) ?? { label: monthLabel(b.periodStart), day: 0, night: 0, peak: 0 };
    cur.day += b.consumptionDay;
    cur.night += b.consumptionNight;
    cur.peak += b.consumptionPeak;
    byPeriod.set(b.periodStart, cur);
  }
  const chartData = Array.from(byPeriod.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([, v]) => v);

  const notices = customerNotices({ bills: myBills, data, contractIds, today });
  const recentPayments = data.payments
    .filter((p) => contractIds.includes(p.contractId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const hasPastDue = myBills.some((b) => b.pastDue);
  const nextDueDays = nextDue ? daysBetween(today, nextDue.dueDate) : null;

  const services: ServiceCard[] = [
    { href: '/bills', label: 'Bills', description: 'Every period, line by line', icon: FileText },
    { href: '/meters', label: 'Meters & readings', description: 'Submit and track readings', icon: Gauge },
    { href: '/payments', label: 'Payments', description: 'History and receipts', icon: Banknote },
    { href: '/tariffs', label: 'Tariffs', description: 'What a kWh costs', icon: Tag },
    { href: '/profile', label: 'Profile settings', description: 'Details, password, staff access', icon: UserCog },
    { href: '/faq', label: 'FAQ', description: 'How everything works', icon: HelpCircle },
    ...(staff ? [{ href: '/dashboard', label: 'Staff overview', description: 'Abonents and balances', icon: LayoutDashboard }] : []),
    ...(canReviewReadings(account) ? [{ href: '/dashboard/readings', label: 'Review readings', description: 'Verify submitted values', icon: Gauge }] : []),
    ...(canBill(account) ? [{ href: '/dashboard/billing', label: 'Generate bills', description: 'From verified readings', icon: ReceiptIcon }] : []),
    ...(canManageAccess(account) ? [{ href: '/dashboard/requests', label: 'Access requests', description: 'Approve or revoke roles', icon: ShieldCheck }] : []),
  ];

  const allBills = bills;
  const pendingReadings = data.readings.filter((r) => r.status === 'pending').length;
  const pendingRequests = allAccounts.filter((a) => a.workAccessStatus === 'pending').length;
  const overdueAll = allBills.filter((b) => b.pastDue).length;

  return (
    <main>
      {/* Hero */}
      <section
        className="px-6 pb-24 pt-14 text-center sm:px-8 sm:pt-20"
        style={{ background: 'linear-gradient(135deg, #a8e6cf 0%, #88d3ce 25%, #7eb8da 50%, #9b8fd9 75%, #c9a0dc 100%)' }}
      >
        <div className="mx-auto max-w-2xl">
          <h1 className="text-[clamp(30px,5vw,46px)] font-bold leading-tight tracking-tight">
            {greeting()}, {firstName}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-lg text-[#222] opacity-85">
            {account.abonentId
              ? 'Your electricity account at a glance.'
              : staff
                ? `Signed in as ${account.role}.`
                : 'Link your contract to see your bills.'}
          </p>
          <div className="mt-8">
            <SiteSearch />
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-12 max-w-6xl px-6 sm:px-8">
        {/* Customer cabinet */}
        {account.abonentId ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Amount due"
                icon={Wallet}
                value={balance > 0 ? formatMoney(balance) : 'All settled'}
                tone={balance === 0 ? 'success' : hasPastDue ? 'danger' : 'default'}
                sub={balance > 0 ? `${unpaid.length} unpaid bill${unpaid.length === 1 ? '' : 's'}` : 'Nothing to pay right now'}
                action={nextDue && <Button size="sm" onClick={() => setPaying(nextDue)}>Pay now</Button>}
              />
              <StatCard
                label="Next due date"
                icon={CalendarClock}
                value={nextDue ? formatDate(nextDue.dueDate) : '—'}
                tone={nextDue && nextDueDays! < 0 ? 'danger' : 'default'}
                sub={
                  nextDue
                    ? nextDueDays! < 0
                      ? `${-nextDueDays!} day${nextDueDays === -1 ? '' : 's'} overdue`
                      : nextDueDays === 0 ? 'Due today' : `In ${nextDueDays} day${nextDueDays === 1 ? '' : 's'}`
                    : 'No upcoming payments'
                }
              />
              <StatCard
                label="Last meter reading"
                icon={Gauge}
                value={lastReading ? formatNumber(lastReading.day, 0) : '—'}
                sub={lastReading ? `${formatDate(lastReading.date)} · ${mainMeter!.serialNumber}` : 'No verified readings yet'}
                action={<LinkButton href="/meters" variant="outline" size="sm">Submit reading</LinkButton>}
              />
              <StatCard
                label="Latest bill"
                icon={Zap}
                value={lastBill ? formatMoney(lastBill.amount) : '—'}
                sub={
                  lastBill ? (
                    <span className="inline-flex items-center gap-1">
                      {formatKwh(lastBill.consumptionDay + lastBill.consumptionNight + lastBill.consumptionPeak)}
                      {change !== null && (
                        <span className={`ml-1 inline-flex items-center ${change > 0 ? 'text-[#c02f2f]' : 'text-[#087a3d]'}`}>
                          {change > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          {Math.abs(change).toFixed(0)}%
                        </span>
                      )}
                    </span>
                  ) : 'No bills yet'
                }
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardTitle>Electricity used</CardTitle>
                {chartData.length > 0 ? (
                  <ConsumptionChart data={chartData} />
                ) : (
                  <p className="text-sm text-[#666]">Usage will show here once your first bill is issued.</p>
                )}
              </Card>
              <Card>
                <CardTitle>Needs your attention</CardTitle>
                <NotificationList notices={notices.slice(0, 4)} />
              </Card>
            </div>

            <section className="mt-12">
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-2xl font-bold tracking-tight">To pay</h2>
                <Link href="/bills" className="text-sm font-semibold underline hover:no-underline">All bills →</Link>
              </div>
              {unpaid.length > 0 ? (
                <BillsList bills={unpaid.slice(0, 3)} onPay={setPaying} onReceipt={setReceipt} />
              ) : (
                <EmptyState icon={FileText} title="Nothing to pay" text="Every bill is settled. New bills appear here as soon as they're issued." />
              )}
            </section>

            <section className="mt-12">
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Recent payments</h2>
                <Link href="/payments" className="text-sm font-semibold underline hover:no-underline">All payments →</Link>
              </div>
              {recentPayments.length > 0 ? (
                <ul className="divide-y divide-[#f0f0f0] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
                  {recentPayments.map((p) => {
                    const b = myBills.find((x) => x.id === p.billId);
                    return (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div>
                          <p className="font-medium">{formatMoney(p.amount)}</p>
                          <p className="text-xs text-[#888]">
                            {formatDate(p.date.slice(0, 10))}{b ? ` · ${formatDate(b.periodStart).slice(2)}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge tone={PAYMENT_TONE[p.status]}>{p.status}</Badge>
                          {p.status === 'success' && (
                            <button onClick={() => setReceipt(p)} className="text-sm font-semibold underline hover:no-underline">
                              Receipt
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState icon={ReceiptIcon} title="No payments yet" text="Payments you make will be listed here with receipts." />
              )}
            </section>
          </>
        ) : (
          <div className="space-y-6">
            {!staff && <LinkContractCard />}
            {staff && !account.abonentId && (
              <Card>
                <p className="text-sm text-[#666]">
                  You&apos;re signed in as <span className="font-semibold text-[#1a1a1a]">{account.role}</span>. Use the staff
                  tools below, or link a contract in Profile settings if you also have an account with us.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Staff */}
        {staff && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-bold tracking-tight">Staff</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Outstanding" icon={Wallet} value={formatMoney(sumRemaining(allBills))} sub="across all abonents" />
              <StatCard label="Overdue bills" icon={FileText} value={overdueAll} tone={overdueAll > 0 ? 'danger' : 'success'} sub="past their due date" />
              {canReviewReadings(account) && (
                <StatCard
                  label="Readings to review"
                  icon={Gauge}
                  value={pendingReadings}
                  sub={pendingReadings > 0 ? 'waiting for a controller' : 'queue is clear'}
                  action={<LinkButton href="/dashboard/readings" variant="outline" size="sm">Open queue</LinkButton>}
                />
              )}
              {canManageAccess(account) && (
                <StatCard
                  label="Access requests"
                  icon={ShieldCheck}
                  value={pendingRequests}
                  sub={pendingRequests > 0 ? 'waiting for approval' : 'nothing pending'}
                  action={<LinkButton href="/dashboard/requests" variant="outline" size="sm">Review</LinkButton>}
                />
              )}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Services</h2>
          <ServiceCarousel items={services} />
        </section>

        <section className="mt-12 pb-4">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Frequently asked</h2>
            <Link href="/faq" className="text-sm font-semibold underline hover:no-underline">All questions →</Link>
          </div>
          <FaqAccordion items={FAQ.slice(0, 4)} />
        </section>
      </div>

      <PayModal bill={paying} onClose={() => setPaying(null)} />
      <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />
    </main>
  );
}
