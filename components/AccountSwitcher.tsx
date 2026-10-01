'use client';

import { useSession } from '@/lib/session-provider';

// Dev-only: lets you preview the site as different roles without building
// auth yet. Delete this component once Supabase Auth is in place.
export function AccountSwitcher() {
  const { account, allAccounts, switchAccount } = useSession();

  return (
    <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F2F6FB] px-6 py-2.5 text-xs">
      <span className="text-[#64748B]">dev preview</span>
      <select
        className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-[#0B2545] focus:border-[#2F6FB0] focus:outline-none"
        value={account.id}
        onChange={(e) => switchAccount(e.target.value)}
      >
        {allAccounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.fullName} — {a.role}
          </option>
        ))}
      </select>
    </div>
  );
}
