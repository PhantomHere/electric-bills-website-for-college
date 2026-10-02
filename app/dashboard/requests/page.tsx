'use client';

import { useSession } from '@/lib/session-provider';

export default function RequestsPage() {
  const { account, allAccounts, resolveWorkAccess } = useSession();

  if (!account || account.role !== 'admin') {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm text-[#64748B]">Only admins can review staff access requests.</p>
      </main>
    );
  }

  const pending = allAccounts.filter((a) => a.workAccessStatus === 'pending');

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Staff access requests</h1>
      <p className="mt-2 text-sm text-[#64748B]">
        Approving sets the account's role immediately — it signs in with staff access on their
        next page load.
      </p>

      {pending.length === 0 ? (
        <p className="mt-8 text-sm text-[#64748B]">Nothing waiting on review.</p>
      ) : (
        <ul className="mt-8 divide-y divide-[#E2E8F0] rounded-2xl border border-[#E2E8F0]">
          {pending.map((a) => (
            <li key={a.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium">{a.fullName}</p>
                <p className="font-mono text-xs text-[#64748B]">
                  {a.email} — requesting {a.requestedRole}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => resolveWorkAccess(a.id, 'rejected')}
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-[#64748B] hover:bg-[#F2F6FB]"
                >
                  Reject
                </button>
                <button
                  onClick={() => resolveWorkAccess(a.id, 'approved')}
                  className="rounded-full bg-[#0B2545] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1D4E89]"
                >
                  Approve
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
