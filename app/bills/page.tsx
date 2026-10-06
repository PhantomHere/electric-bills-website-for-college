'use client';

import { useSession } from '@/lib/session-provider';
import { mockContracts, mockBills } from '@/lib/mock-data';
import { BillsTable } from '@/components/BillsTable';
import { PageHeader } from '@/components/PageHeader';

export default function BillsPage() {
  const { account } = useSession();
  if (!account) return null; // AppShell redirects before this would ever show

  if (!account.abonentId) {
    return (
      <main>
        <PageHeader title="My bills" subtitle="Current and past billing periods" />
        <div className="mx-auto max-w-6xl px-8 py-16">
          <p className="text-sm text-[#666]">This account isn&apos;t linked to an abonent record.</p>
        </div>
      </main>
    );
  }

  // Replace with: select * from contracts where abonent_id = ...
  const contracts = mockContracts.filter((c) => c.abonentId === account.abonentId);

  return (
    <main>
      <PageHeader title="My bills" subtitle="Current and past billing periods" />
      <div className="mx-auto max-w-6xl px-8 py-16">
        <div className="space-y-10">
          {contracts.map((contract) => {
            // Replace with: select * from bills where contract_id = ...
            const bills = mockBills.filter((b) => b.contractId === contract.id);
            return (
              <section key={contract.id}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-[#888]">
                    {contract.contractNumber}
                  </h2>
                  <span className="text-sm text-[#666]">{contract.address}</span>
                </div>
                <BillsTable bills={bills} />
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
