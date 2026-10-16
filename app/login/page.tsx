'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { DEMO_PASSWORD, SEED_ACCOUNTS } from '@/lib/seed';
import { AuthShell } from '@/components/AuthShell';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

export default function LoginPage() {
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function attempt(e: string, p: string) {
    setLoading(true);
    setError(null);
    const res = await login(e, p);
    setLoading(false);
    if (!res.ok) setError(res.error ?? 'Could not log in.');
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back to your electricity account."
      panel={
        <>
          <h2 className="text-sm font-semibold">Demo accounts</h2>
          <p className="mt-1 text-sm text-[#666]">
            These demo accounts all use the password{' '}
            <span className="font-semibold text-[#1a1a1a]">{DEMO_PASSWORD}</span>. Click one to sign in as them.
          </p>
          <ul className="mt-4 space-y-1.5">
            {SEED_ACCOUNTS.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => attempt(a.email, a.password)}
                  disabled={loading}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#f7f8fa] disabled:opacity-50"
                >
                  <span>{a.fullName}</span>
                  <Badge tone={a.role === 'customer' ? 'gray' : 'blue'}>{a.role}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          attempt(email, password);
        }}
        className="space-y-4"
      >
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
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          right={
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#888] hover:text-black"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
        />
        {error && <p role="alert" className="rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#a02828]">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
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
