'use client';

import { useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { contractsOf } from '@/lib/selectors';
import { formatDate } from '@/lib/format';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card, CardTitle } from '@/components/Card';
import { FormField } from '@/components/FormField';
import { LinkContractCard } from '@/components/LinkContractCard';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { useToast } from '@/components/ToastProvider';
import { WorkHereButton } from '@/components/WorkHereButton';

export default function ProfilePage() {
  const { account, logout, updateName, changePassword } = useSession();
  const { data, resetDemoData } = useData();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const [confirmReset, setConfirmReset] = useState(false);
  if (!account) return null;

  const abonent = account.abonentId ? data.abonents.find((a) => a.id === account.abonentId) : undefined;
  const contracts = account.abonentId ? contractsOf(data, account.abonentId) : [];

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    const res = await updateName(name);
    if (!res.ok) return setNameError(res.error ?? 'Could not save.');
    setEditing(false);
    toast('Name updated');
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true);
    const res = await changePassword(current, next);
    setPwLoading(false);
    if (!res.ok) return setPwError(res.error ?? 'Could not change the password.');
    setCurrent('');
    setNext('');
    setPwError(null);
    toast('Password changed');
  }

  function reset() {
    resetDemoData();
    setConfirmReset(false);
    toast('Bills, readings and payments reset to the seed data', 'info');
  }

  return (
    <main>
      <PageHeader title="Profile settings" subtitle="Your details, security and access" />
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle
              action={
                !editing && (
                  <button
                    onClick={() => { setName(account.fullName); setNameError(null); setEditing(true); }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#555] hover:text-black"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )
              }
            >
              Account
            </CardTitle>
            {editing ? (
              <form onSubmit={saveName} className="space-y-3">
                <FormField label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={nameError} required />
                <div className="flex gap-2">
                  <Button type="submit" size="sm"><Check className="h-4 w-4" /> Save</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <dl className="space-y-3.5 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-[#666]">Name</dt><dd className="font-medium">{account.fullName}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#666]">Email</dt><dd>{account.email}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#666]">Role</dt><dd><Badge tone={account.role === 'customer' ? 'gray' : 'blue'}>{account.role}</Badge></dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#666]">Member since</dt><dd>{formatDate(account.createdAt)}</dd></div>
              </dl>
            )}
          </Card>

          <Card muted>
            <CardTitle>Staff access</CardTitle>
            <p className="mb-4 text-sm text-[#666]">
              Controllers review readings, operators generate bills and record payments, admins manage access, viewers
              can look but not change anything.
            </p>
            <WorkHereButton />
          </Card>

          {abonent ? (
            <Card className="lg:col-span-2">
              <CardTitle>Linked contract</CardTitle>
              <p className="text-sm text-[#666]">
                <span className="font-semibold text-[#1a1a1a]">{abonent.fullName}</span> · account {abonent.accountNumber} ·{' '}
                {abonent.type === 'legal' ? 'Business' : 'Residential'}
              </p>
              <ul className="mt-4 divide-y divide-[#f0f0f0] rounded-xl bg-[#f7f8fa] px-4">
                {contracts.map((c) => (
                  <li key={c.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                    <span className="font-medium">{c.contractNumber}</span>
                    <span className="text-[#666]">{c.address}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <div className="lg:col-span-2">
              <LinkContractCard />
            </div>
          )}

          <Card className="lg:col-span-2">
            <CardTitle>Change password</CardTitle>
            <form onSubmit={savePassword} className="grid gap-4 sm:grid-cols-2">
              <FormField label="Current password" type="password" autoComplete="current-password" value={current} onChange={(e) => { setCurrent(e.target.value); setPwError(null); }} required />
              <FormField label="New password" type="password" autoComplete="new-password" hint="At least 6 characters" value={next} onChange={(e) => { setNext(e.target.value); setPwError(null); }} required />
              {pwError && <p role="alert" className="rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#a02828] sm:col-span-2">{pwError}</p>}
              <div className="sm:col-span-2"><Button type="submit" loading={pwLoading}>Update password</Button></div>
            </form>
          </Card>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Button variant="outline" onClick={logout}>Log out</Button>
          {account.role === 'admin' && (
            <button onClick={() => setConfirmReset(true)} className="text-sm font-semibold text-[#666] underline hover:text-[#DB3E3E]">
              Reset demo data
            </button>
          )}
        </div>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset demo data?">
        <p className="text-sm text-[#666]">
          This restores bills, readings and payments on this device to the original seed data. Accounts now live in
          Supabase and are not affected.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
          <Button variant="danger" onClick={reset}>Reset everything</Button>
        </div>
      </Modal>
    </main>
  );
}
