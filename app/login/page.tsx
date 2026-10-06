'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-provider';
import { mockAccounts } from '@/lib/mock-data';
import { AuthShell } from '@/components/AuthShell';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/Button';

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
          <p className="mt-1 text-sm text-[#666]">
            No real backend yet, so any of these work with password{' '}
            <span className="font-semibold text-[#1a1a1a]">demo123</span>.
          </p>
          <ul className="mt-4 space-y-2.5">
            {mockAccounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span>{a.fullName}</span>
                <span className="text-xs text-[#888]">{a.role}</span>
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
        {error && <p className="text-sm text-[#DB3E3E]">{error}</p>}
        <Button type="submit" className="w-full">
          Log in
        </Button>
      </form>
      <p className="mt-6 text-sm text-[#666]">
        New here?{' '}
        <Link href="/register" className="font-semibold text-[#1a1a1a] underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
