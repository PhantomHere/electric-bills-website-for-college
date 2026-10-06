'use client';

import { useState } from 'react';
import { useSession } from '@/lib/session-provider';
import { StaffRole } from '@/lib/types';
import { Button } from './Button';

export function WorkHereButton() {
  const { account, requestWorkAccess } = useSession();
  const [role, setRole] = useState<StaffRole>('controller');
  if (!account) return null;

  if (account.workAccessStatus === 'approved') {
    return (
      <span className="inline-block rounded-full bg-[#e6f9ef] px-3 py-1.5 text-sm font-semibold text-[#04C65D]">
        Staff account, {account.role}
      </span>
    );
  }

  if (account.workAccessStatus === 'pending') {
    return (
      <div className="rounded-2xl bg-[#fff8e6] px-4 py-3 text-sm text-[#92610b]">
        Request to join as <span className="font-semibold">{account.requestedRole}</span> is
        waiting on an admin.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-[#444]">Role you&apos;re requesting</span>
        <select
          className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-black"
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
        >
          <option value="controller">Controller — meter readings</option>
          <option value="operator">Operator — billing</option>
          <option value="viewer">Viewer — read only</option>
        </select>
      </label>
      <Button onClick={() => requestWorkAccess(role)} className="w-full">
        Work here?
      </Button>
    </div>
  );
}
