'use client';

import { useState } from 'react';
import { Receipt as ReceiptIcon } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { Payment, PaymentStatus } from '@/lib/types';
import { contractsOf } from '@/lib/selectors';
import { formatDateTime, formatMoney, periodLabel } from '@/lib/format';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { LinkContractCard } from '@/components/LinkContractCard';
import { PageHeader } from '@/components/PageHeader';
import { ReceiptModal } from '@/components/ReceiptModal';
import { StatCard } from '@/components/StatCard';
import { Tabs } from '@/components/Tabs';

type Filter = 'all' | PaymentStatus;
const TONE = { success: 'green', pending: 'amber', failed: 'red' } as const;
const METHOD = { cash: 'Cash', card: 'Card', bank: 'Bank transfer', online: 'Online banking' };

export default function PaymentsPage() {
  const { account } = useSession();
  const { data } = useData();
  const [filter, setFilter] = useState<Filter>('all');
  const [receipt, setReceipt] = useState<Payment | null>(null);
  if (!account) return null;

  if (!account.abonentId) {
    return (
      <main>
        <PageHeader title="Payments" subtitle="History and receipts" />
        <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
          <LinkContractCard />
        </div>
      </main>
    );
  }

  const ids = contractsOf(data, account.abonentId).map((c) => c.id);
  const all = data.payments.filter((p) => ids.includes(p.contractId)).sort((a, b) => b.date.localeCompare(a.date));
  const list = all.filter((p) => filter === 'all' || p.status === filter);
  const totalPaid = all.filter((p) => p.status === 'success').reduce((s, p) => s + p.amount, 0);
  const count = (s: PaymentStatus) => all.filter((p) => p.status === s).length;

  return (
    <main>
      <PageHeader title="Payments" subtitle="History and receipts" />
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total paid" value={formatMoney(totalPaid)} sub={`${count('success')} successful payments`} />
          <StatCard label="Pending" value={count('pending')} sub="waiting to be confirmed" />
          <StatCard label="Failed" value={count('failed')} tone={count('failed') ? 'danger' : 'default'} sub="didn't go through" />
        </div>

        <div className="mt-10">
          <Tabs
            label="Filter payments"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: all.length },
              { value: 'success', label: 'Successful', count: count('success') },
              { value: 'pending', label: 'Pending', count: count('pending') },
              { value: 'failed', label: 'Failed', count: count('failed') },
            ]}
          />
        </div>

        <div className="mt-6">
          {list.length === 0 ? (
            <EmptyState icon={ReceiptIcon} title="No payments here" text="Payments you make will be listed with a receipt." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#eee] text-left text-xs uppercase tracking-wide text-[#888]">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">For</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 text-right font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => {
                    const bill = data.bills.find((b) => b.id === p.billId);
                    return (
                      <tr key={p.id} className="border-b border-[#f5f5f5] last:border-0">
                        <td className="whitespace-nowrap px-4 py-3">{formatDateTime(p.date)}</td>
                        <td className="px-4 py-3 text-[#666]">{bill ? periodLabel(bill.periodStart, bill.periodEnd) : '—'}</td>
                        <td className="px-4 py-3 text-[#666]">
                          {METHOD[p.method]}
                          {p.transactionId && <span className="ml-2 text-xs text-[#999]">{p.transactionId}</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{formatMoney(p.amount)}</td>
                        <td className="px-4 py-3 text-right"><Badge tone={TONE[p.status]}>{p.status}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          {p.status === 'success' && (
                            <button onClick={() => setReceipt(p)} className="text-sm font-semibold underline hover:no-underline">
                              Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />
    </main>
  );
}
