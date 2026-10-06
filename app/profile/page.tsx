'use client';

import { useSession } from '@/lib/session-provider';
import { WorkHereButton } from '@/components/WorkHereButton';
import { PageHeader } from '@/components/PageHeader';

export default function ProfilePage() {
  const { account, logout } = useSession();
  if (!account) return null; // AppShell redirects before this would ever show

  return (
    <main>
      <PageHeader title="Profile settings" subtitle="Contact details and staff access" />
      <div className="mx-auto max-w-6xl px-8 py-16">
        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-[#e8e8e8] p-6">
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#666]">Name</dt>
                <dd className="font-medium">{account.fullName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#666]">Email</dt>
                <dd>{account.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#666]">Role</dt>
                <dd className="font-medium">{account.role}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-[#f7f8fa] p-6">
            <h2 className="text-sm font-semibold">Staff access</h2>
            <p className="mt-1 text-sm text-[#666]">
              Staff accounts can read or manage abonents, meters and bills, depending on role.
            </p>
            <div className="mt-4">
              <WorkHereButton />
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-8 text-sm font-semibold text-[#666] hover:text-[#DB3E3E]"
        >
          Log out
        </button>
      </div>
    </main>
  );
}
