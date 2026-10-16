'use client';

import { useState } from 'react';
import { Check, Gauge, Plus, X } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { Meter, Reading } from '@/lib/types';
import { canReviewReadings } from '@/lib/permissions';
import { abonentOfContract } from '@/lib/selectors';
import { daysBetween, formatDate, formatNumber } from '@/lib/format';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Forbidden } from '@/components/Forbidden';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { ReadingForm } from '@/components/ReadingForm';
import { StaffNav } from '@/components/StaffNav';
import { useToast } from '@/components/ToastProvider';

export default function ReadingsReviewPage() {
  const { account, allAccounts } = useSession();
  const { data, reviewReading } = useData();
  const toast = useToast();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<{ id: string; message: string } | null>(null);
  const [entering, setEntering] = useState(false);

  if (!canReviewReadings(account) || !account) return <Forbidden text="Reviewing readings needs a controller, operator or admin role." />;

  const nameOf = (id: string | null) => (id ? allAccounts.find((a) => a.id === id)?.fullName ?? 'Unknown' : 'Automatic');
  const meterById = (id: string) => data.meters.find((m) => m.id === id)!;
  const pending = data.readings.filter((r) => r.status === 'pending').sort((a, b) => a.date.localeCompare(b.date));
  const reviewed = data.readings
    .filter((r) => r.status !== 'pending' && r.reviewedBy)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);
  const activeMeters = data.meters.filter((m) => m.status === 'active');

  // Context for a reviewer: the last verified reading, the change since,
  // and how that compares to this meter's usual daily rate.
  function context(r: Reading) {
    const history = data.readings
      .filter((x) => x.meterId === r.meterId && x.status === 'verified' && x.date < r.date)
      .sort((a, b) => a.date.localeCompare(b.date));
    const prev = history[history.length - 1];
    if (!prev) return null;
    const delta = r.day - prev.day;
    const days = Math.max(1, daysBetween(prev.date, r.date));
    const first = history[0];
    const spanDays = Math.max(1, daysBetween(first.date, prev.date));
    const usualRate = history.length > 1 ? (prev.day - first.day) / spanDays : null;
    const ratio = usualRate && usualRate > 0 ? delta / days / usualRate : null;
    return { prev, delta, days, ratio };
  }

  function decide(r: Reading, decision: 'verified' | 'rejected') {
    const res = reviewReading(r.id, decision, account!.id, decision === 'rejected' ? note : undefined);
    if (!res.ok) return setError({ id: r.id, message: res.error ?? 'Could not save.' });
    setError(null);
    setRejecting(null);
    setNote('');
    toast(decision === 'verified' ? 'Reading verified' : 'Reading rejected — the customer will see your note', decision === 'verified' ? 'success' : 'info');
  }

  const describe = (m: Meter) => {
    const ab = abonentOfContract(data, m.contractId);
    return `${m.serialNumber} — ${ab?.fullName ?? ''}`;
  };

  return (
    <main>
      <PageHeader
        title="Review readings"
        subtitle="Only verified readings are used when a bill is generated"
        actions={<Button variant="outline" size="sm" onClick={() => setEntering(true)}><Plus className="h-4 w-4" /> Enter a reading</Button>}
      >
        <StaffNav />
      </PageHeader>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">
          Waiting for review <span className="text-[#999]">{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <EmptyState icon={Gauge} title="The queue is clear" text="Submitted readings will show up here for review." />
        ) : (
          <div className="space-y-4">
            {pending.map((r) => {
              const m = meterById(r.meterId);
              const ab = abonentOfContract(data, m.contractId);
              const ctx = context(r);
              const isRejecting = rejecting === r.id;
              return (
                <Card key={r.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{ab?.fullName}</p>
                      <p className="text-sm text-[#666]">Meter {m.serialNumber} · {formatDate(r.date)} · submitted by {nameOf(r.enteredBy)}</p>
                    </div>
                    <Badge tone="amber">pending</Badge>
                  </div>

                  <div className="mt-4 grid gap-3 rounded-xl bg-[#f7f8fa] p-4 text-sm sm:grid-cols-4">
                    <div><p className="text-xs text-[#888]">{m.type === 'multi' ? 'Day' : 'Reading'}</p><p className="text-lg font-semibold">{formatNumber(r.day, 1)}</p></div>
                    {m.type === 'multi' && <div><p className="text-xs text-[#888]">Night</p><p className="text-lg font-semibold">{r.night != null ? formatNumber(r.night, 1) : '—'}</p></div>}
                    {m.type === 'multi' && <div><p className="text-xs text-[#888]">Peak</p><p className="text-lg font-semibold">{r.peak != null ? formatNumber(r.peak, 1) : '—'}</p></div>}
                    <div className={m.type === 'multi' ? '' : 'sm:col-span-3'}>
                      <p className="text-xs text-[#888]">Since last verified</p>
                      {ctx ? (
                        <p className="font-semibold">
                          +{formatNumber(ctx.delta, 1)} kWh <span className="font-normal text-[#888]">in {ctx.days} days</span>
                        </p>
                      ) : (
                        <p className="text-[#666]">No earlier reading</p>
                      )}
                    </div>
                  </div>

                  {ctx?.ratio != null && ctx.ratio > 2 && (
                    <p className="mt-3 rounded-xl bg-[#fff8e6] px-4 py-2.5 text-sm text-[#8a4b04]">
                      Unusually high — about {ctx.ratio.toFixed(1)}× this meter&apos;s usual daily use.
                    </p>
                  )}
                  {ctx?.ratio != null && ctx.ratio < 0.25 && (
                    <p className="mt-3 rounded-xl bg-[#fff8e6] px-4 py-2.5 text-sm text-[#8a4b04]">
                      Unusually low — about {(ctx.ratio * 100).toFixed(0)}% of this meter&apos;s usual daily use.
                    </p>
                  )}

                  {isRejecting ? (
                    <div className="mt-4 space-y-3">
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-[#444]">Reason (shown to the customer)</span>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={2}
                          className="w-full rounded-xl border border-[#ddd] px-4 py-3 text-sm outline-none focus:border-black"
                        />
                      </label>
                      <div className="flex gap-2">
                        <Button variant="danger" size="sm" onClick={() => decide(r, 'rejected')}>Reject reading</Button>
                        <Button variant="ghost" size="sm" onClick={() => { setRejecting(null); setNote(''); setError(null); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => decide(r, 'verified')}><Check className="h-4 w-4" /> Verify</Button>
                      <Button variant="outline" size="sm" onClick={() => { setRejecting(r.id); setNote(''); setError(null); }}><X className="h-4 w-4" /> Reject</Button>
                    </div>
                  )}
                  {error?.id === r.id && <p role="alert" className="mt-3 rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#a02828]">{error.message}</p>}
                </Card>
              );
            })}
          </div>
        )}

        {reviewed.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-bold tracking-tight">Recently reviewed</h2>
            <ul className="divide-y divide-[#f0f0f0] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
              {reviewed.map((r) => {
                const m = meterById(r.meterId);
                return (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm">
                    <span>
                      <span className="font-medium">{m.serialNumber}</span> · {formatDate(r.date)} · {formatNumber(r.day, 0)} kWh
                      {r.note && <span className="text-[#888]"> — “{r.note}”</span>}
                    </span>
                    <span className="flex items-center gap-3 text-xs text-[#888]">
                      by {nameOf(r.reviewedBy ?? null)}
                      <Badge tone={r.status === 'verified' ? 'green' : 'red'}>{r.status}</Badge>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <Modal open={entering} onClose={() => setEntering(false)} title="Enter a reading">
        <p className="mb-4 text-sm text-[#666]">Readings entered by staff are verified immediately.</p>
        <ReadingForm meters={activeMeters} enteredBy={account.id} autoVerify describe={describe} onDone={() => setEntering(false)} />
      </Modal>
    </main>
  );
}
