'use client';

import { useEffect, useState } from 'react';
import { Banknote, Check, CreditCard, Globe, Landmark } from 'lucide-react';
import { BillView, Payment, PaymentMethod } from '@/lib/types';
import { useData } from '@/lib/data-provider';
import { formatMoney, periodLabel } from '@/lib/format';
import { Modal } from './Modal';
import { Button } from './Button';
import { FormField } from './FormField';
import { Receipt } from './Receipt';
import { useToast } from './ToastProvider';

const CUSTOMER_METHODS = [
  { value: 'card', label: 'Bank card', icon: CreditCard },
  { value: 'online', label: 'Online banking', icon: Globe },
  { value: 'bank', label: 'Bank transfer', icon: Landmark },
] as const;
const STAFF_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'bank', label: 'Bank transfer', icon: Landmark },
] as const;

// Records a payment against a bill. This is a real state change — the bill's
// status, balance and history all update — but no card details are collected
// and no money moves; the page says so.
export function PayModal({
  bill,
  staffMode = false,
  onClose,
}: {
  bill: BillView | null;
  staffMode?: boolean;
  onClose: () => void;
}) {
  const { recordPayment } = useData();
  const toast = useToast();
  const methods = staffMode ? STAFF_METHODS : CUSTOMER_METHODS;
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Payment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bill) return;
    setAmount(bill.remaining.toFixed(2));
    setMethod(staffMode ? 'cash' : 'card');
    setError(null);
    setDone(null);
    setShowReceipt(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bill?.id, staffMode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!bill) return;
    setLoading(true);
    const res = await recordPayment(bill.id, Number(amount.replace(',', '.')), method);
    setLoading(false);
    if (!res.ok || !res.value) {
      setError(res.error ?? 'Could not record the payment.');
      return;
    }
    setError(null);
    setDone(res.value);
    toast(`${staffMode ? 'Payment recorded' : 'Payment received'} — ${formatMoney(res.value.amount)}`);
  }

  const title = done ? (showReceipt ? 'Receipt' : 'Payment complete') : staffMode ? 'Record a payment' : 'Pay your bill';

  return (
    <Modal open={!!bill} onClose={onClose} title={title}>
      {bill && !done && (
        <form onSubmit={submit} className="space-y-5">
          <div className="rounded-2xl bg-[#f7f8fa] p-4">
            <p className="text-sm text-[#666]">{periodLabel(bill.periodStart, bill.periodEnd)}</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight">{formatMoney(bill.remaining)}</p>
            <p className="text-xs text-[#888]">still owed of {formatMoney(bill.amount)}</p>
          </div>

          <div>
            <FormField
              label="Amount (₽)"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              max={bill.remaining}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={error}
              required
            />
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => setAmount(bill.remaining.toFixed(2))} className="rounded-full bg-[#f2f2f2] px-3 py-1 text-xs font-medium hover:bg-[#e8e8e8]">
                Full amount
              </button>
              <button type="button" onClick={() => setAmount((bill.remaining / 2).toFixed(2))} className="rounded-full bg-[#f2f2f2] px-3 py-1 text-xs font-medium hover:bg-[#e8e8e8]">
                Half
              </button>
            </div>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-[#444]">Method</legend>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => {
                const active = method === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMethod(m.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all ${
                      active ? 'border-black bg-black text-white' : 'border-[#ddd] hover:border-[#999]'
                    }`}
                  >
                    <m.icon className="h-4 w-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <p className="rounded-xl bg-[#fff8e6] px-4 py-3 text-xs text-[#8a4b04]">
            Demo — no card details are collected and no money moves. The payment is recorded against the bill so you can see how balances and statuses update.
          </p>

          <Button type="submit" className="w-full" loading={loading}>
            {staffMode ? 'Record payment' : 'Pay'} {formatMoney(Number(amount.replace(',', '.')) || 0)}
          </Button>
        </form>
      )}

      {done && !showReceipt && (
        <div className="text-center">
          <span className="animate-pop mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f9ef] text-[#087a3d]">
            <Check className="h-7 w-7" strokeWidth={3} />
          </span>
          <p className="mt-4 text-3xl font-bold tracking-tight">{formatMoney(done.amount)}</p>
          <p className="mt-1 text-sm text-[#666]">
            {done.transactionId ? `Transaction ${done.transactionId}` : 'Cash payment recorded'}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={() => setShowReceipt(true)}>View receipt</Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}

      {done && showReceipt && <Receipt payment={done} />}
    </Modal>
  );
}
