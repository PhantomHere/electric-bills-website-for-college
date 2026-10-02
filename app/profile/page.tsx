'use client';

import { useSession } from '@/lib/session-provider';
import { WorkHereButton } from '@/components/WorkHereButton';

export default function ProfilePage() {
  const { account, logout } = useSession();
  if (!account) return null; // AppShell redirects before this would ever show

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Profile settings</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-[#E2E8F0] p-6">
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#64748B]">Name</dt>
              <dd className="font-medium">{account.fullName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#64748B]">Email</dt>
              <dd className="font-mono text-[13px]">{account.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#64748B]">Role</dt>
              <dd className="font-medium">{account.role}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-[#F2F6FB] p-6">
          <h2 className="text-sm font-semibold">Staff access</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Staff accounts can read or manage abonents, meters and bills, depending on role.
          </p>
          <div className="mt-4">
            <WorkHereButton />
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="mt-8 text-sm font-semibold text-[#64748B] hover:text-[#C0392B]"
      >
        Log out
      </button>
    </main>
  );
}
