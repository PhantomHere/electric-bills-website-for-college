'use client';

import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { AbonentType, TariffZone } from '@/lib/types';
import { formatDate, todayISO } from '@/lib/format';
import { Badge } from '@/components/Badge';
import { PageHeader } from '@/components/PageHeader';

const ZONES: { zone: TariffZone; label: string; note: string }[] = [
  { zone: 'single', label: 'Single rate', note: 'For one-zone meters' },
  { zone: 'day', label: 'Day', note: 'Multi-zone meters' },
  { zone: 'night', label: 'Night', note: 'Multi-zone meters' },
  { zone: 'peak', label: 'Peak', note: 'Multi-zone meters, where measured' },
];

export default function TariffsPage() {
  const { account } = useSession();
  const { data } = useData();
  if (!account) return null;

  const today = todayISO();
  const current = data.tariffs.filter((t) => t.validFrom <= today && (t.validTo === null || t.validTo >= today));
  const archive = data.tariffs
    .filter((t) => t.validTo !== null && t.validTo < today)
    .sort((a, b) => b.validTo!.localeCompare(a.validTo!));
  const priceOf = (zone: TariffZone, type: AbonentType) => current.find((t) => t.zone === zone && t.abonentType === type);
  const myType = account.abonentId ? data.abonents.find((a) => a.id === account.abonentId)?.type : undefined;

  return (
    <main>
      <PageHeader title="Tariffs" subtitle="What a kilowatt-hour costs, by zone" />
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#eee] text-left text-xs uppercase tracking-wide text-[#888]">
                <th className="px-5 py-3 font-medium">Zone</th>
                <th className="px-5 py-3 text-right font-medium">
                  Residential {myType === 'individual' && <Badge tone="blue">Your rate</Badge>}
                </th>
                <th className="px-5 py-3 text-right font-medium">
                  Business {myType === 'legal' && <Badge tone="blue">Your rate</Badge>}
                </th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z) => (
                <tr key={z.zone} className="border-b border-[#f5f5f5] last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{z.label}</p>
                    <p className="text-xs text-[#888]">{z.note}</p>
                  </td>
                  {(['individual', 'legal'] as const).map((type) => {
                    const t = priceOf(z.zone, type);
                    return (
                      <td key={type} className={`px-5 py-4 text-right ${myType === type ? 'bg-[#f7f8fa]' : ''}`}>
                        {t ? (
                          <>
                            <span className="text-lg font-bold">{t.price.toFixed(2)} ₽</span>
                            <span className="text-xs text-[#888]"> / kWh</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[#888]">A bill uses the tariff in effect on the last day of its billing period.</p>

        {archive.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-bold tracking-tight">Previous tariffs</h2>
            <ul className="divide-y divide-[#f0f0f0] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
              {archive.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm">
                  <span>{t.name}</span>
                  <span className="text-[#666]">
                    {formatDate(t.validFrom)} – {formatDate(t.validTo!)} ·{' '}
                    <span className="font-medium text-[#1a1a1a]">{t.price.toFixed(2)} ₽</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
