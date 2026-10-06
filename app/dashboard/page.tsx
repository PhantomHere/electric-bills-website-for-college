'use client';

import Link from 'next/link';
import { useSession } from '@/lib/session-provider';
import { hasAtLeast } from '@/lib/types';
import { mockAbonents, mockContracts, mockBills } from '@/lib/mock-data';
import { BillsTable } from '@/components/BillsTable';
import { PageHeader } from '@/components/PageHeader';

export default function DashboardPage() {
  const { account, allAccounts } = useSession();

  if (!account || !hasAtLeast(account.role, 'viewer') || account.workAccessStatus !== 'approved') {
    return (
      <main className="mx-auto max-w-6xl px-8 py-16">
        <p className="text-sm text-[#666]">You don&apos;t have staff access to this page.</p>
      </main>
    );
  }

  const pendingCount = allAccounts.filter((a) => a.workAccessStatus === 'pending').length;

  return (
    <main>
      <PageHeader title="Staff dashboard" subtitle="Abonents, contracts and bills" />
      <div className="mx-auto max-w-6xl px-8 py-16">
        {account.role === 'admin' && (
          <div className="mb-8 flex justify-end">
            <Link
              href="/dashboard/requests"
              className="text-sm font-semibold underline hover:no-underline"
            >
              Access requests{pendingCount > 0 && ` (${pendingCount})`} →
            </Link>
          </div>
        )}

        <div className="space-y-10">
          {/* Replace with: select * from abonents join contracts ... */}
          {mockAbonents.map((abonent) => {
            const contracts = mockContracts.filter((c) => c.abonentId === abonent.id);
            return (
              <section key={abonent.id}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="font-semibold">{abonent.fullName}</h2>
                  <span className="text-xs text-[#888]">
                    {abonent.accountNumber} · {abonent.status}
                  </span>
                </div>
                <div className="space-y-5">
                  {contracts.map((contract) => {
                    const bills = mockBills.filter((b) => b.contractId === contract.id);
                    return (
                      <div key={contract.id}>
                        <p className="mb-1.5 text-xs text-[#888]">
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
      </div>
    </main>
  );
}
