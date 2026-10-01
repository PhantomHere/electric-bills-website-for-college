'use client';

import { useState } from 'react';
import { useSession } from '@/lib/session-provider';
import { StaffRole } from '@/lib/types';

export function WorkHereButton() {
  const { account, requestWorkAccess } = useSession();
  const [role, setRole] = useState<StaffRole>('controller');

  if (account.workAccessStatus === 'approved') {
    return (
      <span className="inline-block rounded-full bg-[#0B2545]/8 px-3 py-1.5 text-sm font-medium text-[#0B2545]">
        Staff account, {account.role}
      </span>
    );
  }

  if (account.workAccessStatus === 'pending') {
    return (
      <div className="rounded-2xl bg-[#F2F6FB] px-4 py-3 text-sm text-[#0B2545]">
        Request to join as <span className="font-medium">{account.requestedRole}</span> is waiting
        on an admin.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0B2545] focus:border-[#2F6FB0] focus:outline-none"
        value={role}
        onChange={(e) => setRole(e.target.value as StaffRole)}
      >
        <option value="controller">Controller — meter readings</option>
        <option value="operator">Operator — billing</option>
        <option value="viewer">Viewer — read only</option>
      </select>
      <button
        onClick={() => requestWorkAccess(role)}
        className="rounded-full bg-[#0B2545] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4E89]"
      >
        Work here?
      </button>
    </div>
  );
}
