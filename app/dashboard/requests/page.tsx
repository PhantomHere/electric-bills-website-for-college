'use client';

import { ShieldCheck } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { canManageAccess } from '@/lib/permissions';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Forbidden } from '@/components/Forbidden';
import { PageHeader } from '@/components/PageHeader';
import { StaffNav } from '@/components/StaffNav';
import { useToast } from '@/components/ToastProvider';

export default function RequestsPage() {
  const { account, allAccounts, resolveWorkAccess, revokeStaff } = useSession();
  const toast = useToast();
  if (!canManageAccess(account)) return <Forbidden text="Only admins can manage staff access." />;

  const pending = allAccounts.filter((a) => a.workAccessStatus === 'pending');
  const staff = allAccounts.filter((a) => a.role !== 'customer' && a.workAccessStatus === 'approved');
  const declined = allAccounts.filter((a) => a.workAccessStatus === 'rejected');

  return (
    <main>
      <PageHeader title="Access requests" subtitle="Approving sets the role immediately — it's live on their next page load">
        <StaffNav />
      </PageHeader>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">
          Waiting for approval <span className="text-[#999]">{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Nothing waiting" text="New staff requests will appear here." />
        ) : (
          <ul className="divide-y divide-[#f0f0f0] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
            {pending.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium">{a.fullName}</p>
                  <p className="text-xs text-[#888]">{a.email} — requesting <span className="font-semibold">{a.requestedRole}</span></p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={async () => {
                    const res = await resolveWorkAccess(a.id, 'rejected');
                    if (res.ok) toast(`Rejected ${a.fullName}`, 'info');
                    else toast(res.error ?? 'Could not reject', 'error');
                  }}>Reject</Button>
                  <Button size="sm" onClick={async () => {
                    const res = await resolveWorkAccess(a.id, 'approved');
                    if (res.ok) toast(`${a.fullName} is now ${a.requestedRole}`);
                    else toast(res.error ?? 'Could not approve', 'error');
                  }}>Approve</Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mb-4 mt-12 text-2xl font-bold tracking-tight">
          Current staff <span className="text-[#999]">{staff.length}</span>
        </h2>
        <ul className="divide-y divide-[#f0f0f0] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
          {staff.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium">
                  {a.fullName} {a.id === account!.id && <span className="text-xs font-normal text-[#888]">(you)</span>}
                </p>
                <p className="text-xs text-[#888]">{a.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="blue">{a.role}</Badge>
                {a.id !== account!.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const res = await revokeStaff(a.id);
                      toast(res.ok ? `Revoked ${a.fullName}'s staff access` : res.error ?? 'Could not revoke', res.ok ? 'info' : 'error');
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {declined.length > 0 && (
          <>
            <h2 className="mb-4 mt-12 text-2xl font-bold tracking-tight">Declined</h2>
            <ul className="divide-y divide-[#f0f0f0] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
              {declined.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                  <span>{a.fullName} <span className="text-[#888]">· {a.email}</span></span>
                  <Badge tone="red">rejected</Badge>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
