'use client';

import Link from 'next/link';
import { useSession } from '@/lib/session-provider';
import { hasAtLeast } from '@/lib/types';
import { mockAbonents, mockContracts, mockBills } from '@/lib/mock-data';
import { BillsTable } from '@/components/BillsTable';

export default function DashboardPage() {
  const { account, allAccounts } = useSession();

  if (!account || !hasAtLeast(account.role, 'viewer') || account.workAccessStatus !== 'approved') {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm text-[#64748B]">You don&apos;t have staff access to this page.</p>
      </main>
    );
  }

  const pendingCount = allAccounts.filter((a) => a.workAccessStatus === 'pending').length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-baseline justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Staff dashboard</h1>
        {account.role === 'admin' && (
          <Link
            href="/dashboard/requests"
            className="text-sm font-semibold text-[#2F6FB0] hover:underline"
          >
            Access requests{pendingCount > 0 && ` (${pendingCount})`} →
          </Link>
        )}
      </div>

      <div className="mt-8 space-y-10">
        {/* Replace with: select * from abonents join contracts ... */}
        {mockAbonents.map((abonent) => {
          const contracts = mockContracts.filter((c) => c.abonentId === abonent.id);
          return (
            <section key={abonent.id}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-semibold">{abonent.fullName}</h2>
                <span className="font-mono text-xs text-[#64748B]">
                  {abonent.accountNumber} · {abonent.status}
                </span>
              </div>
              <div className="space-y-5">
                {contracts.map((contract) => {
                  const bills = mockBills.filter((b) => b.contractId === contract.id);
                  return (
                    <div key={contract.id}>
                      <p className="mb-1.5 font-mono text-xs text-[#64748B]">
                        {contract.contractNumber} — {contract.address}
                      </p>
                      <BillsTable bills={bills} />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
