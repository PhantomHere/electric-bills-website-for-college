'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { AuthShell } from '@/components/AuthShell';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/Button';

export default function RegisterPage() {
  const { register } = useSession();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords don\u2019t match.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await register(fullName, email, password);
    setLoading(false);
    if (!res.ok) return setError(res.error ?? 'Could not create the account.');
    if (res.value?.needsConfirmation) {
      setInfo('Account created. Check your inbox and confirm your email, then log in.');
    }
  }

  const toggle = (
    <button
      type="button"
      onClick={() => setShow((s) => !s)}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="flex h-8 w-8 items-center justify-center rounded-full text-[#888] hover:text-black"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <AuthShell
      title="Create account"
      subtitle="Set up access to view and manage your electricity bills."
      panel={
        <>
          <h2 className="text-sm font-semibold">What happens next</h2>
          <ol className="mt-3 space-y-3 text-sm text-[#666]">
            <li><span className="font-semibold text-[#1a1a1a]">1. Link your contract</span> — enter the account and contract numbers from your agreement to see your bills.</li>
            <li><span className="font-semibold text-[#1a1a1a]">2. Submit readings</span> — send your meter values each month.</li>
            <li><span className="font-semibold text-[#1a1a1a]">3. Optional: staff access</span> — if you work for the utility, request a role from Profile settings; an admin reviews it.</li>
          </ol>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Full name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <FormField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <FormField
          label="Password"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          hint="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          right={toggle}
          required
        />
        <FormField
          label="Confirm password"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && <p role="alert" className="rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#a02828]">{error}</p>}
        {info && <p role="status" className="rounded-xl bg-[#e6f9ef] px-4 py-3 text-sm text-[#0b7a3b]">{info}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-sm text-[#666]">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#1a1a1a] underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
