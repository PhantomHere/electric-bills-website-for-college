'use client';

import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { BillView, Payment, TariffZone } from '@/lib/types';
import { STATUS_META } from '@/lib/status-meta';
import { formatDate, formatDateTime, formatKwh, formatMoney, periodLabel } from '@/lib/format';
import { Badge } from './Badge';
import { Button } from './Button';
import { Collapse } from './Collapse';
import { EmptyState } from './EmptyState';

const ZONE_LABEL: Record<TariffZone, string> = {
  day: 'Day',
  night: 'Night',
  peak: 'Peak',
  single: 'Single rate',
};

const PAYMENT_TONE = { success: 'green', pending: 'amber', failed: 'red' } as const;
const METHOD_LABEL = { cash: 'Cash', card: 'Card', bank: 'Bank transfer', online: 'Online banking' };

function BillRow({
  bill,
  onPay,
  payLabel,
  onReceipt,
}: {
  bill: BillView;
  onPay?: (bill: BillView) => void;
  payLabel: string;
  onReceipt?: (payment: Payment) => void;
}) {
  const [open, setOpen] = useState(false);
  const status = STATUS_META[bill.status];
  const totalKwh = bill.consumptionDay + bill.consumptionNight + bill.consumptionPeak;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"
      >
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{periodLabel(bill.periodStart, bill.periodEnd)}</p>
          <p className={`mt-0.5 text-xs ${bill.pastDue ? 'font-medium text-[#DB3E3E]' : 'text-[#888]'}`}>
            {formatKwh(totalKwh)} · due {formatDate(bill.dueDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatMoney(bill.amount)}</p>
          {bill.paid > 0 && bill.remaining > 0 && (
            <p className="text-xs text-[#888]">{formatMoney(bill.remaining)} left</p>
          )}
        </div>
        <span className="hidden sm:block">
          <Badge tone={status.tone}>{status.label}</Badge>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#999] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <Collapse open={open}>
        <div className="space-y-5 border-t border-[#f0f0f0] px-4 py-5 sm:px-5">
          <div className="sm:hidden">
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#888]">
                  <th className="pb-2 font-medium">Zone</th>
                  <th className="pb-2 text-right font-medium">Used</th>
                  <th className="pb-2 text-right font-medium">Rate</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.lines.map((l) => (
                  <tr key={l.id} className="border-t border-[#f5f5f5]">
                    <td className="py-2">{ZONE_LABEL[l.zone]}</td>
                    <td className="py-2 text-right">{formatKwh(l.consumption)}</td>
                    <td className="py-2 text-right text-[#666]">{l.price.toFixed(2)} ₽</td>
                    <td className="py-2 text-right font-medium">{formatMoney(l.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t border-[#e8e8e8] font-semibold">
                  <td className="pt-2.5" colSpan={3}>Total</td>
                  <td className="pt-2.5 text-right">{formatMoney(bill.amount)}</td>
                </tr>
                {bill.paid > 0 && (
                  <tr className="text-[#087a3d]">
                    <td className="pt-1" colSpan={3}>Paid</td>
                    <td className="pt-1 text-right">−{formatMoney(bill.paid)}</td>
                  </tr>
                )}
                {bill.remaining > 0 && bill.paid > 0 && (
                  <tr className="font-semibold">
                    <td className="pt-1" colSpan={3}>Still owed</td>
                    <td className="pt-1 text-right">{formatMoney(bill.remaining)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {bill.payments.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#888]">Payments</p>
              <ul className="divide-y divide-[#f5f5f5] rounded-xl bg-[#f7f8fa] px-4">
                {bill.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                    <span className="text-[#555]">
                      {formatDateTime(p.date)} · {METHOD_LABEL[p.method]}
                    </span>
                    <span className="flex items-center gap-3">
                      <Badge tone={PAYMENT_TONE[p.status]}>{p.status}</Badge>
                      <span className="font-medium">{formatMoney(p.amount)}</span>
                      {onReceipt && p.status === 'success' && (
                        <button
                          onClick={() => onReceipt(p)}
                          className="text-xs font-semibold underline hover:no-underline"
                        >
                          Receipt
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onPay && bill.remaining > 0 && (
            <Button size="sm" onClick={() => onPay(bill)}>
              {payLabel} {formatMoney(bill.remaining)}
            </Button>
          )}
        </div>
      </Collapse>
    </div>
  );
}

export function BillsList({
  bills,
  onPay,
  payLabel = 'Pay',
  onReceipt,
  emptyTitle = 'No bills yet',
  emptyText,
}: {
  bills: BillView[];
  onPay?: (bill: BillView) => void;
  payLabel?: string;
  onReceipt?: (payment: Payment) => void;
  emptyTitle?: string;
  emptyText?: string;
}) {
  if (bills.length === 0) return <EmptyState icon={FileText} title={emptyTitle} text={emptyText} />;
  return (
    <div className="space-y-3">
      {bills.map((b) => (
        <BillRow key={b.id} bill={b} onPay={onPay} payLabel={payLabel} onReceipt={onReceipt} />
      ))}
    </div>
  );
}
