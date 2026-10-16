'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search, Users } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { Abonent, BillView, Payment } from '@/lib/types';
import { canBill, isApprovedStaff } from '@/lib/permissions';
import { billsOf, contractsOf, metersOf, sumRemaining } from '@/lib/selectors';
import { formatMoney } from '@/lib/format';
import { Badge } from '@/components/Badge';
import { BillsList } from '@/components/BillsList';
import { Collapse } from '@/components/Collapse';
import { EmptyState } from '@/components/EmptyState';
import { Forbidden } from '@/components/Forbidden';
import { PageHeader } from '@/components/PageHeader';
import { PayModal } from '@/components/PayModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { StaffNav } from '@/components/StaffNav';
import { StatCard } from '@/components/StatCard';
import { Tabs } from '@/components/Tabs';

type Filter = 'all' | 'debt' | 'clear';
const STATUS_TONE = { active: 'green', closed: 'gray', blocked: 'red' } as const;

export default function DashboardPage() {
  const { account } = useSession();
  const { data, bills } = useData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [paying, setPaying] = useState<BillView | null>(null);
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const rows = useMemo(
    () =>
      data.abonents.map((a) => {
        const contracts = contractsOf(data, a.id);
        const ids = contracts.map((c) => c.id);
        const mine = billsOf(bills, ids);
        return { a, contracts, meters: metersOf(data, ids), bills: mine, owed: sumRemaining(mine), overdue: mine.filter((b) => b.pastDue).length };
      }),
    [data, bills]
  );

  if (!isApprovedStaff(account)) return <Forbidden text="This area is for approved staff." />;
  const operator = canBill(account);

  const q = query.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    const matches =
      !q ||
      r.a.fullName.toLowerCase().includes(q) ||
      r.a.accountNumber.includes(q) ||
      r.contracts.some((c) => c.contractNumber.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
    return matches && (filter === 'all' ? true : filter === 'debt' ? r.owed > 0 : r.owed === 0);
  });

  const pendingReadings = data.readings.filter((r) => r.status === 'pending').length;

  return (
    <main>
      <PageHeader title="Staff overview" subtitle="Abonents, balances and bills">
        <StaffNav />
      </PageHeader>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Abonents" value={data.abonents.length} sub={`${data.contracts.length} contracts`} />
          <StatCard label="Outstanding" value={formatMoney(sumRemaining(bills))} sub="across all contracts" />
          <StatCard label="Overdue bills" value={bills.filter((b) => b.pastDue).length} tone={bills.some((b) => b.pastDue) ? 'danger' : 'success'} sub="past their due date" />
          <StatCard label="Readings to review" value={pendingReadings} sub={pendingReadings ? 'waiting for a controller' : 'queue is clear'} />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <Tabs
            label="Filter abonents"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: rows.length },
              { value: 'debt', label: 'With balance', count: rows.filter((r) => r.owed > 0).length },
              { value: 'clear', label: 'Settled', count: rows.filter((r) => r.owed === 0).length },
            ]}
          />
          <label className="flex min-w-64 items-center gap-2 rounded-full border border-[#ddd] bg-white px-4 py-2.5 focus-within:border-black">
            <Search className="h-4 w-4 text-[#888]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, account, contract, address…"
              aria-label="Search abonents"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#999]"
            />
          </label>
        </div>

        <div className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState icon={Users} title="No abonents match" text="Try a different search or filter." />
          ) : (
            filtered.map((r) => {
              const open = openId === r.a.id;
              return (
                <AbonentRow
                  key={r.a.id}
                  open={open}
                  onToggle={() => setOpenId(open ? null : r.a.id)}
                  abonent={r.a}
                  owed={r.owed}
                  overdue={r.overdue}
                >
                  <div className="space-y-6 border-t border-[#f0f0f0] px-4 py-5 sm:px-5">
                    {r.contracts.map((c) => {
                      const meter = r.meters.find((m) => m.contractId === c.id && m.status === 'active') ?? r.meters.find((m) => m.contractId === c.id);
                      return (
                        <div key={c.id}>
                          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                            <span className="font-semibold">{c.contractNumber}</span>
                            <span className="text-[#666]">
                              {c.address}
                              {meter && <span className="text-[#999]"> · meter {meter.serialNumber} ({meter.status})</span>}
                            </span>
                          </div>
                          <BillsList
                            bills={r.bills.filter((b) => b.contractId === c.id)}
                            onPay={operator ? setPaying : undefined}
                            payLabel="Record payment"
                            onReceipt={setReceipt}
                            emptyTitle="No bills on this contract"
                          />
                        </div>
                      );
                    })}
                  </div>
                </AbonentRow>
              );
            })
          )}
        </div>
      </div>

      <PayModal bill={paying} accountId={account?.id ?? null} staffMode onClose={() => setPaying(null)} />
      <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />
    </main>
  );
}

function AbonentRow({
  open, onToggle, abonent, owed, overdue, children,
}: {
  open: boolean;
  onToggle: () => void;
  abonent: Abonent;
  owed: number;
  overdue: number;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-[#fafafa] sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{abonent.fullName}</p>
          <p className="text-xs text-[#888]">
            {abonent.accountNumber} · {abonent.type === 'legal' ? 'Business' : 'Residential'}
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Badge tone={STATUS_TONE[abonent.status]}>{abonent.status}</Badge>
          {overdue > 0 && <Badge tone="red">{overdue} overdue</Badge>}
        </div>
        <div className="text-right">
          <p className={`font-semibold ${owed > 0 ? '' : 'text-[#087a3d]'}`}>{owed > 0 ? formatMoney(owed) : 'Settled'}</p>
          {owed > 0 && <p className="text-xs text-[#888]">owed</p>}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#999] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <Collapse open={open}>{children}</Collapse>
    </div>
  );
}
