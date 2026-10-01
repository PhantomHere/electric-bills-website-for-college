'use client';

import { useSession } from '@/lib/session-provider';
import { mockContracts, mockBills } from '@/lib/mock-data';
import { BillsTable } from '@/components/BillsTable';

export default function BillsPage() {
  const { account } = useSession();

  if (!account.abonentId) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm text-[#64748B]">This account isn&apos;t linked to an abonent record.</p>
      </main>
    );
  }

  // Replace with: select * from contracts where abonent_id = ...
  const contracts = mockContracts.filter((c) => c.abonentId === account.abonentId);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">My bills</h1>

      <div className="mt-8 space-y-10">
        {contracts.map((contract) => {
          // Replace with: select * from bills where contract_id = ...
          const bills = mockBills.filter((b) => b.contractId === contract.id);
          return (
            <section key={contract.id}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-mono text-xs text-[#64748B]">{contract.contractNumber}</h2>
                <span className="text-sm text-[#64748B]">{contract.address}</span>
              </div>
              <BillsTable bills={bills} />
            </section>
          );
        })}
      </div>
    </main>
  );
}
