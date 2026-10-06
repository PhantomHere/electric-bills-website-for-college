'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords don\u2019t match.');
      return;
    }
    const result = register(fullName, email, password);
    if (!result.ok) setError(result.error ?? 'Could not create account.');
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Set up access to view and manage your electricity bills."
      panel={
        <>
          <h2 className="text-sm font-semibold">What you get right away</h2>
          <p className="mt-1 text-sm text-[#666]">
            New accounts start as a regular customer. If you work for the
            utility, you can request staff access afterwards from{' '}
            <span className="font-semibold text-[#1a1a1a]">Profile settings</span> — an admin
            reviews it before you see the staff dashboard.
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && <p className="text-sm text-[#DB3E3E]">{error}</p>}
        <Button type="submit" className="w-full">
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
