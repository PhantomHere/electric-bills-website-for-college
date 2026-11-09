'use client';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { canBill } from '@/lib/permissions';
import { DraftBill } from '@/lib/billing';
import { Result } from '@/lib/types';
import { abonentOfContract } from '@/lib/selectors';
import { formatDate, formatKwh, formatMoney, periodLabel } from '@/lib/format';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card, CardTitle } from '@/components/Card';
import { FormField, SelectField } from '@/components/FormField';
import { Forbidden } from '@/components/Forbidden';
import { PageHeader } from '@/components/PageHeader';
import { StaffNav } from '@/components/StaffNav';
import { useToast } from '@/components/ToastProvider';
import { STATUS_META } from '@/lib/status-meta';

const ZONE = { day: 'Day', night: 'Night', peak: 'Peak', single: 'Single rate' } as const;

export default function BillingPage() {
  const { account } = useSession();
  const { data, bills, previewBill, generateBill } = useData();
  const toast = useToast();

  const eligible = data.contracts.filter(
    (c) => c.status === 'active' && data.meters.some((m) => m.contractId === c.id && m.status === 'active')
  );
  const [contractId, setContractId] = useState(eligible[0]?.id ?? '');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Result<DraftBill> | null>(null);
  const [generating, setGenerating] = useState(false);

  // Suggest the next unbilled stretch: from the last bill's end (or the
  // first verified reading) to the latest verified reading.
  useEffect(() => {
    if (!contractId) return;
    const meter = data.meters.find((m) => m.contractId === contractId && m.status === 'active');
    const verified = data.readings.filter((r) => r.meterId === meter?.id && r.status === 'verified').map((r) => r.date).sort();
    const lastBillEnd = data.bills.filter((b) => b.contractId === contractId).map((b) => b.periodEnd).sort().pop();
    setStart(lastBillEnd ?? verified[0] ?? '');
    setEnd(verified[verified.length - 1] ?? '');
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  // The calculation happens in the database, so the preview is fetched
  // whenever the contract, the dates or the underlying data change.
  useEffect(() => {
    if (!canBill(account) || !contractId || !start || !end) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    previewBill(contractId, start, end).then((res) => {
      if (!cancelled) setPreview(res);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId, start, end, data.bills.length, data.readings.length]);

  if (!canBill(account)) return <Forbidden text="Generating bills needs an operator or admin role." />;

  const draft = preview?.ok ? preview.value : undefined;
  const abonent = contractId ? abonentOfContract(data, contractId) : undefined;
  const recent = bills.slice(0, 8);

  async function generate() {
    setGenerating(true);
    const res = await generateBill(contractId, start, end);
    setGenerating(false);
    if (!res.ok) return setError(res.error ?? 'Could not generate the bill.');
    setError(null);
    toast(`Bill generated — ${formatMoney(draft?.bill.amount ?? 0)}`);
    const meter = data.meters.find((m) => m.contractId === contractId && m.status === 'active');
    const latest = data.readings.filter((r) => r.meterId === meter?.id && r.status === 'verified').map((r) => r.date).sort().pop();
    setStart(end);
    setEnd(latest ?? end);
  }

  return (
    <main>
      <PageHeader title="Generate bills" subtitle="Create a bill from two verified readings">
        <StaffNav />
      </PageHeader>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardTitle>New bill</CardTitle>
            <div className="space-y-4">
              <SelectField label="Contract" value={contractId} onChange={(e) => setContractId(e.target.value)}>
                {eligible.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contractNumber} — {abonentOfContract(data, c.id)?.fullName}
                  </option>
                ))}
              </SelectField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Period start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                <FormField label="Period end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
              <p className="flex items-start gap-2 text-xs text-[#888]">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Dates are pre-filled with the next unbilled stretch. Consumption is the difference between the verified
                readings on or before each date.
              </p>
              {error && <p role="alert" className="rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#a02828]">{error}</p>}
              <Button className="w-full" disabled={!draft} loading={generating} onClick={generate}>Generate bill</Button>
            </div>
          </Card>

          <Card muted className="lg:col-span-3">
            <CardTitle>Preview</CardTitle>
            {!preview && <p className="text-sm text-[#666]">Choose a contract and a period to see the bill before it&apos;s issued.</p>}
            {preview && !preview.ok && (
              <p className="rounded-xl bg-[#fff8e6] px-4 py-3 text-sm text-[#8a4b04]">{preview.error}</p>
            )}
            {draft && (
              <div>
                <p className="text-sm text-[#666]">
                  {abonent?.fullName} · {periodLabel(draft.bill.periodStart, draft.bill.periodEnd)} · due {formatDate(draft.bill.dueDate)}
                </p>
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[#888]">
                      <th className="pb-2 font-medium">Zone</th>
                      <th className="pb-2 text-right font-medium">Used</th>
                      <th className="pb-2 text-right font-medium">Rate</th>
                      <th className="pb-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.lines.map((l) => (
                      <tr key={l.zone} className="border-t border-[#e8e8e8]">
                        <td className="py-2.5">{ZONE[l.zone]}</td>
                        <td className="py-2.5 text-right">{formatKwh(l.consumption)}</td>
                        <td className="py-2.5 text-right text-[#666]">{l.price.toFixed(2)} ₽</td>
                        <td className="py-2.5 text-right font-medium">{formatMoney(l.amount)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-black text-base font-bold">
                      <td className="pt-3" colSpan={3}>Total</td>
                      <td className="pt-3 text-right">{formatMoney(draft.bill.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Latest bills</h2>
          <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#eee] text-left text-xs uppercase tracking-wide text-[#888]">
                  <th className="px-4 py-3 font-medium">Abonent</th>
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-b border-[#f5f5f5] last:border-0">
                    <td className="px-4 py-3">{abonentOfContract(data, b.contractId)?.fullName}</td>
                    <td className="px-4 py-3 text-[#666]">{periodLabel(b.periodStart, b.periodEnd)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMoney(b.amount)}</td>
                    <td className="px-4 py-3 text-right"><Badge tone={STATUS_META[b.status].tone}>{STATUS_META[b.status].label}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
