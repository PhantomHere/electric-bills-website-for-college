'use client';

import { Printer, Zap } from 'lucide-react';
import { Payment } from '@/lib/types';
import { useData } from '@/lib/data-provider';
import { formatDateTime, formatMoney, periodLabel } from '@/lib/format';
import { Button } from './Button';

const METHOD_LABEL = { cash: 'Cash', card: 'Card', bank: 'Bank transfer', online: 'Online banking' };

// The receipt body. `print-area` is the only thing visible when printing
// (see globals.css), so "Print" produces a clean one-page receipt.
export function Receipt({ payment }: { payment: Payment }) {
  const { data } = useData();
  const bill = data.bills.find((b) => b.id === payment.billId);
  const contract = data.contracts.find((c) => c.id === payment.contractId);
  const abonent = contract && data.abonents.find((a) => a.id === contract.abonentId);

  const rows: [string, string][] = [
    ['Date', formatDateTime(payment.date)],
    ['Billing period', bill ? periodLabel(bill.periodStart, bill.periodEnd) : '—'],
    ['Payer', abonent?.fullName ?? '—'],
    ['Account number', abonent?.accountNumber ?? '—'],
    ['Contract', contract ? `${contract.contractNumber} — ${contract.address}` : '—'],
    ['Method', METHOD_LABEL[payment.method]],
    ['Transaction', payment.transactionId ?? 'Cash — no transaction ID'],
  ];

  return (
    <div>
      <div className="print-area">
        <div className="flex items-center gap-2.5 text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
            <Zap className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          </span>
          Volt
        </div>
        <p className="mt-5 text-sm text-[#666]">Payment receipt</p>
        <p className="text-3xl font-bold tracking-tight">{formatMoney(payment.amount)}</p>
        <dl className="mt-5 divide-y divide-[#f0f0f0] border-y border-[#f0f0f0] text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-2.5">
              <dt className="text-[#666]">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-[#888]">
          Demo receipt — generated from mock data, not a real transaction.
        </p>
      </div>
      <Button variant="outline" size="sm" className="mt-5" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print receipt
      </Button>
    </div>
  );
}
