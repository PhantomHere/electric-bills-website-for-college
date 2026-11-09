'use client';

import { useState } from 'react';
import { Gauge } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { Meter, ReadingStatus } from '@/lib/types';
import { contractsOf, latestVerified, metersOf, readingsOf } from '@/lib/selectors';
import { daysBetween, formatDate, formatNumber, todayISO } from '@/lib/format';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LinkContractCard } from '@/components/LinkContractCard';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { ReadingForm } from '@/components/ReadingForm';

const STATUS_TONE: Record<ReadingStatus, 'green' | 'amber' | 'red'> = { verified: 'green', pending: 'amber', rejected: 'red' };
const METER_TONE = { active: 'green', faulty: 'red', replaced: 'gray' } as const;

export default function MetersPage() {
  const { account } = useSession();
  const { data } = useData();
  const [readingFor, setReadingFor] = useState<Meter | null>(null);
  const [showAll, setShowAll] = useState(false);
  if (!account) return null;

  if (!account.abonentId) {
    return (
      <main>
        <PageHeader title="Meters & readings" subtitle="Submit readings and follow their review" />
        <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
          <LinkContractCard />
        </div>
      </main>
    );
  }

  const contracts = contractsOf(data, account.abonentId);
  const meters = metersOf(data, contracts.map((c) => c.id));
  const history = meters
    .flatMap((m) => readingsOf(data, m.id).map((r) => ({ r, m })))
    .sort((a, b) => b.r.date.localeCompare(a.r.date));
  const shown = showAll ? history : history.slice(0, 8);
  const today = todayISO();
  const addressOf = (m: Meter) => contracts.find((c) => c.id === m.contractId)?.address ?? '';

  return (
    <main>
      <PageHeader title="Meters & readings" subtitle="Submit readings and follow their review" />
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        {meters.length === 0 ? (
          <EmptyState icon={Gauge} title="No meters on your contract" text="Once a meter is installed it will appear here." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {meters.map((m) => {
              const last = latestVerified(data, m.id);
              const toVerify = daysBetween(today, m.nextVerification);
              return (
                <Card key={m.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{m.serialNumber}</p>
                      <p className="text-sm text-[#666]">{addressOf(m)}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Badge tone="gray">{m.type === 'multi' ? 'Multi-zone' : 'Single-zone'}</Badge>
                      <Badge tone={METER_TONE[m.status]}>{m.status}</Badge>
                    </div>
                  </div>

                  <dl className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-[#f7f8fa] p-4 text-sm">
                    {last ? (
                      <>
                        <div>
                          <dt className="text-xs text-[#888]">{m.type === 'multi' ? 'Day' : 'Reading'}</dt>
                          <dd className="font-semibold">{formatNumber(last.day, 0)}</dd>
                        </div>
                        {m.type === 'multi' && (
                          <>
                            <div>
                              <dt className="text-xs text-[#888]">Night</dt>
                              <dd className="font-semibold">{last.night != null ? formatNumber(last.night, 0) : '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-[#888]">Peak</dt>
                              <dd className="font-semibold">{last.peak != null ? formatNumber(last.peak, 0) : '—'}</dd>
                            </div>
                          </>
                        )}
                        <div className="col-span-3">
                          <dt className="text-xs text-[#888]">Last verified reading</dt>
                          <dd className="text-[#555]">{formatDate(last.date)}</dd>
                        </div>
                      </>
                    ) : (
                      <p className="col-span-3 text-[#666]">No verified readings yet.</p>
                    )}
                  </dl>

                  <p className={`mt-4 text-xs ${toVerify <= 90 ? 'font-medium text-[#a85b05]' : 'text-[#888]'}`}>
                    Next verification {formatDate(m.nextVerification)}
                    {toVerify <= 90 && toVerify >= 0 ? ` — in ${toVerify} days` : toVerify < 0 ? ' — overdue' : ''}
                  </p>

                  {m.status === 'active' ? (
                    <Button className="mt-5 w-full" onClick={() => setReadingFor(m)}>
                      Submit a reading
                    </Button>
                  ) : (
                    <p className="mt-5 rounded-xl bg-[#fff8e6] px-4 py-3 text-sm text-[#8a4b04]">
                      This meter is {m.status}, so readings can&apos;t be submitted.
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Reading history</h2>
          {history.length === 0 ? (
            <EmptyState icon={Gauge} title="No readings yet" text="Submit your first reading above." />
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#eee] text-left text-xs uppercase tracking-wide text-[#888]">
                      <th className="px-4 py-3 font-medium">Date</th>
                      {meters.length > 1 && <th className="px-4 py-3 font-medium">Meter</th>}
                      <th className="px-4 py-3 text-right font-medium">Day / single</th>
                      <th className="px-4 py-3 text-right font-medium">Night</th>
                      <th className="px-4 py-3 text-right font-medium">Peak</th>
                      <th className="px-4 py-3 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map(({ r, m }) => (
                      <tr key={r.id} className="border-b border-[#f5f5f5] last:border-0">
                        <td className="px-4 py-3">
                          {formatDate(r.date)}
                          {r.source !== 'manual' && <span className="ml-2 text-xs text-[#999]">{r.source}</span>}
                        </td>
                        {meters.length > 1 && <td className="px-4 py-3 text-[#666]">{m.serialNumber}</td>}
                        <td className="px-4 py-3 text-right">{formatNumber(r.day, 0)}</td>
                        <td className="px-4 py-3 text-right text-[#666]">{r.night != null ? formatNumber(r.night, 0) : '—'}</td>
                        <td className="px-4 py-3 text-right text-[#666]">{r.peak != null ? formatNumber(r.peak, 0) : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                          {r.status === 'rejected' && r.note && <p className="mt-1 text-xs text-[#c02f2f]">{r.note}</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {history.length > 8 && (
                <button onClick={() => setShowAll((s) => !s)} className="mt-3 text-sm font-semibold underline hover:no-underline">
                  {showAll ? 'Show fewer' : `Show all ${history.length} readings`}
                </button>
              )}
            </>
          )}
        </section>
      </div>

      <Modal open={!!readingFor} onClose={() => setReadingFor(null)} title="Submit a reading">
        {readingFor && (
          <ReadingForm meters={[readingFor]} autoVerify={false} onDone={() => setReadingFor(null)} />
        )}
      </Modal>
    </main>
  );
}
