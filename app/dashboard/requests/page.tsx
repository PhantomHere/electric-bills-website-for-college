'use client';

import { useSession } from '@/lib/session-provider';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';

export default function RequestsPage() {
  const { account, allAccounts, resolveWorkAccess } = useSession();

  if (!account || account.role !== 'admin') {
    return (
      <main className="mx-auto max-w-6xl px-8 py-16">
        <p className="text-sm text-[#666]">Only admins can review staff access requests.</p>
      </main>
    );
  }

  const pending = allAccounts.filter((a) => a.workAccessStatus === 'pending');

  return (
    <main>
      <PageHeader
        title="Staff access requests"
        subtitle="Approving sets the role immediately — it's live on their next page load"
      />
      <div className="mx-auto max-w-6xl px-8 py-16">
        {pending.length === 0 ? (
          <p className="text-sm text-[#666]">Nothing waiting on review.</p>
        ) : (
          <ul className="divide-y divide-[#f0f0f0] rounded-2xl border border-[#e8e8e8]">
            {pending.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium">{a.fullName}</p>
                  <p className="text-xs text-[#888]">
                    {a.email} — requesting {a.requestedRole}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => resolveWorkAccess(a.id, 'rejected')}>
                    Reject
                  </Button>
                  <Button onClick={() => resolveWorkAccess(a.id, 'approved')}>Approve</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
