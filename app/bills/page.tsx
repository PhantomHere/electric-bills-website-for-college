'use client';

import { useState } from 'react';
import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { BillView, Payment } from '@/lib/types';
import { billsOf, contractsOf, sumRemaining } from '@/lib/selectors';
import { formatMoney } from '@/lib/format';
import { BillsList } from '@/components/BillsList';
import { LinkContractCard } from '@/components/LinkContractCard';
import { PageHeader } from '@/components/PageHeader';
import { PayModal } from '@/components/PayModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { Tabs } from '@/components/Tabs';

type Filter = 'all' | 'unpaid' | 'paid';

export default function BillsPage() {
  const { account } = useSession();
  const { data, bills } = useData();
  const [filter, setFilter] = useState<Filter>('all');
  const [paying, setPaying] = useState<BillView | null>(null);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  if (!account) return null;

  if (!account.abonentId) {
    return (
      <main>
        <PageHeader title="Bills" subtitle="Every billing period, line by line" />
        <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
          <LinkContractCard />
        </div>
      </main>
    );
  }

  const contracts = contractsOf(data, account.abonentId);
  const mine = billsOf(bills, contracts.map((c) => c.id));
  const owed = sumRemaining(mine);
  const counts = {
    all: mine.length,
    unpaid: mine.filter((b) => b.remaining > 0).length,
    paid: mine.filter((b) => b.remaining === 0).length,
  };
  const pick = (list: BillView[]) =>
    list.filter((b) => (filter === 'all' ? true : filter === 'paid' ? b.remaining === 0 : b.remaining > 0));

  return (
    <main>
      <PageHeader
        title="Bills"
        subtitle={owed > 0 ? `${formatMoney(owed)} currently owed` : 'Everything is paid — nice.'}
      />
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <Tabs
          label="Filter bills"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'unpaid', label: 'Unpaid', count: counts.unpaid },
            { value: 'paid', label: 'Paid', count: counts.paid },
          ]}
        />

        <div className="mt-8 space-y-10">
          {contracts.map((contract) => {
            const list = pick(mine.filter((b) => b.contractId === contract.id));
            return (
              <section key={contract.id}>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-[#888]">{contract.contractNumber}</h2>
                  <span className="text-sm text-[#666]">{contract.address}</span>
                </div>
                <BillsList
                  bills={list}
                  onPay={setPaying}
                  onReceipt={setReceipt}
                  emptyTitle={filter === 'unpaid' ? 'Nothing to pay' : 'No bills here'}
                  emptyText={filter === 'unpaid' ? 'Every bill on this contract is settled.' : undefined}
                />
              </section>
            );
          })}
        </div>
      </div>
      <PayModal bill={paying} accountId={account.id} onClose={() => setPaying(null)} />
      <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />
    </main>
  );
}
