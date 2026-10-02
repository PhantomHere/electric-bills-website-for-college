'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-provider';
import { mockAccounts } from '@/lib/mock-data';
import { AuthShell } from '@/components/AuthShell';
import { FormField } from '@/components/FormField';

export default function LoginPage() {
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) setError(result.error ?? 'Could not log in.');
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back to your electricity account."
      panel={
        <>
          <h2 className="text-sm font-semibold">Demo accounts</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            No real backend yet, so any of these work with password{' '}
            <span className="font-mono font-medium text-[#0B2545]">demo123</span>.
          </p>
          <ul className="mt-4 space-y-2.5">
            {mockAccounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span>{a.fullName}</span>
                <span className="font-mono text-xs text-[#64748B]">{a.role}</span>
              </li>
            ))}
          </ul>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-[#C0392B]">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-[#0B2545] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1D4E89]"
        >
          Log in
        </button>
      </form>
      <p className="mt-6 text-sm text-[#64748B]">
        New here?{' '}
        <Link href="/register" className="font-semibold text-[#0B2545] underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
