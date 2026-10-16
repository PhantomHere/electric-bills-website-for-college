'use client';

import { useState } from 'react';
import { useSession } from '@/lib/session-provider';
import { StaffRole } from '@/lib/types';
import { Button } from './Button';
import { Badge } from './Badge';
import { SelectField } from './FormField';
import { useToast } from './ToastProvider';

export function WorkHereButton() {
  const { account, requestWorkAccess } = useSession();
  const toast = useToast();
  const [role, setRole] = useState<StaffRole>('controller');
  if (!account) return null;

  if (account.workAccessStatus === 'approved') {
    return <Badge tone="green">Staff account · {account.role}</Badge>;
  }

  if (account.workAccessStatus === 'pending') {
    return (
      <div className="rounded-2xl bg-[#fff8e6] px-4 py-3 text-sm text-[#8a4b04]">
        Your request to join as <span className="font-semibold">{account.requestedRole}</span> is waiting on an admin.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {account.workAccessStatus === 'rejected' && (
        <p className="rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#a02828]">
          Your last request wasn&apos;t approved. You can ask again.
        </p>
      )}
      <SelectField label="Role you're requesting" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
        <option value="controller">Controller — review meter readings</option>
        <option value="operator">Operator — billing and payments</option>
        <option value="viewer">Viewer — read only</option>
      </SelectField>
      <Button
        className="w-full"
        onClick={async () => {
          const res = await requestWorkAccess(role);
          if (res.ok) toast('Request sent — an admin will review it');
          else toast(res.error ?? 'Could not send the request', 'error');
        }}
      >
        Work here?
      </Button>
    </div>
  );
}
