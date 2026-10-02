'use client';

import { useState } from 'react';
import { useSession } from '@/lib/session-provider';
import { StaffRole } from '@/lib/types';

export function WorkHereButton() {
  const { account, requestWorkAccess } = useSession();
  const [role, setRole] = useState<StaffRole>('controller');
  if (!account) return null;

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
        Request to join as <span className="font-semibold">{account.requestedRole}</span> is
        waiting on an admin.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm text-[#64748B]">Role you&apos;re requesting</span>
        <select
          className="w-full rounded-xl bg-[#F2F6FB] px-4 py-3 text-sm text-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
        >
          <option value="controller">Controller — meter readings</option>
          <option value="operator">Operator — billing</option>
          <option value="viewer">Viewer — read only</option>
        </select>
      </label>
      <button
        onClick={() => requestWorkAccess(role)}
        className="w-full rounded-full bg-[#0B2545] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1D4E89]"
      >
        Work here?
      </button>
    </div>
  );
}
