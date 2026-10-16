'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { Button } from './Button';
import { Card } from './Card';
import { FormField } from './FormField';
import { useToast } from './ToastProvider';

// Attaches the signed-in account to an existing abonent by matching the
// account number and one of that abonent's contract numbers — the way a
// utility confirms you're really the customer.
export function LinkContractCard({ title = 'Link your contract' }: { title?: string }) {
  const { linkAbonent } = useSession();
  const toast = useToast();
  const [accountNumber, setAccountNumber] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The database checks the numbers (and that the contract isn't already
  // linked to someone else) — the browser never sees other customers' data.
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await linkAbonent(accountNumber, contractNumber);
    setLoading(false);
    if (!res.ok) return setError(res.error ?? "We couldn't match those details.");
    toast('Contract linked');
  }

  return (
    <Card>
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
          <Link2 className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-[#666]">
            Enter the account number and contract number from your electricity agreement to see your bills, meters and payments.
          </p>
          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField
              label="Account number"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => { setAccountNumber(e.target.value); setError(null); }}
              required
            />
            <FormField
              label="Contract number"
              value={contractNumber}
              onChange={(e) => { setContractNumber(e.target.value); setError(null); }}
              required
            />
            {error && <p className="rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#a02828] sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <Button type="submit" loading={loading}>Link contract</Button>
              <p className="mt-3 text-xs text-[#888]">Demo: try account 100001 with contract C-2024-001.</p>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}
