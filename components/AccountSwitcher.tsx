'use client';

import { useSession } from '@/lib/session-provider';

// Dev-only: lets you preview the site as different roles without building
// auth yet. Delete this component once Supabase Auth is in place.
export function AccountSwitcher() {
  const { account, allAccounts, switchAccount } = useSession();

  return (
    <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F2F6FB] px-6 py-2.5 text-xs">
      <span className="text-[#64748B]">dev preview</span>
      <label className="flex items-center gap-2">
        <span className="text-[#64748B]">Viewing as</span>
        <select
          className="rounded-lg bg-white px-3 py-1.5 text-[#0B2545] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
          value={account.id}
          onChange={(e) => switchAccount(e.target.value)}
        >
          {allAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.fullName} — {a.role}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
