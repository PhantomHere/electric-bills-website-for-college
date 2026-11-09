'use client';

import { useState } from 'react';
import { Meter } from '@/lib/types';
import { useData } from '@/lib/data-provider';
import { formatDate, formatNumber, todayISO } from '@/lib/format';
import { Button } from './Button';
import { FormField, SelectField } from './FormField';
import { useToast } from './ToastProvider';

function parseNum(s: string): number | null {
  const t = s.trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return Number.isNaN(n) ? NaN : n;
}

// Submits a meter reading. Customers' readings wait for a controller to
// review them; staff entering a reading are verified immediately.
export function ReadingForm({
  meters,
  autoVerify,
  describe,
  onDone,
}: {
  meters: Meter[];
  autoVerify: boolean;
  describe?: (m: Meter) => string;
  onDone: () => void;
}) {
  const { data, submitReading } = useData();
  const toast = useToast();
  const [meterId, setMeterId] = useState(meters[0]?.id ?? '');
  const [date, setDate] = useState(todayISO());
  const [day, setDay] = useState('');
  const [night, setNight] = useState('');
  const [peak, setPeak] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const meter = meters.find((m) => m.id === meterId);
  if (!meter) return <p className="text-sm text-[#666]">No active meters to read.</p>;

  const last = data.readings
    .filter((r) => r.meterId === meter.id && r.status !== 'rejected')
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const multi = meter.type === 'multi';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const dayN = parseNum(day);
    const nightN = parseNum(night);
    const peakN = parseNum(peak);
    if (dayN === null || Number.isNaN(dayN) || Number.isNaN(nightN) || Number.isNaN(peakN)) {
      setError('Enter the readings as plain numbers.');
      return;
    }
    setLoading(true);
    // The database decides the status: staff readings are verified straight
    // away, a customer's waits for review.
    const res = await submitReading({
      meterId: meter!.id,
      date,
      day: dayN,
      night: multi ? nightN : null,
      peak: multi ? peakN : null,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? 'Could not save the reading.');
      return;
    }
    toast(autoVerify ? 'Reading recorded and verified' : 'Reading submitted — a controller will review it');
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {meters.length > 1 && (
        <SelectField label="Meter" value={meterId} onChange={(e) => { setMeterId(e.target.value); setError(null); }}>
          {meters.map((m) => (
            <option key={m.id} value={m.id}>
              {describe ? describe(m) : m.serialNumber}
            </option>
          ))}
        </SelectField>
      )}

      <FormField
        label="Reading date"
        type="date"
        value={date}
        min={meter.installDate}
        max={todayISO()}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <div className={multi ? 'grid gap-4 sm:grid-cols-3' : ''}>
        <FormField
          label={multi ? 'Day (kWh)' : 'Meter reading (kWh)'}
          inputMode="decimal"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          hint={last ? `Last: ${formatNumber(last.day, 1)} on ${formatDate(last.date)}` : undefined}
          required
        />
        {multi && (
          <>
            <FormField
              label="Night (kWh)"
              inputMode="decimal"
              value={night}
              onChange={(e) => setNight(e.target.value)}
              hint={last?.night != null ? `Last: ${formatNumber(last.night, 1)}` : undefined}
              required
            />
            <FormField
              label="Peak (kWh)"
              inputMode="decimal"
              value={peak}
              onChange={(e) => setPeak(e.target.value)}
              hint={last?.peak != null ? `Last: ${formatNumber(last.peak, 1)}` : 'Optional'}
              required={last?.peak != null}
            />
          </>
        )}
      </div>

      {error && <p className="rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#a02828]">{error}</p>}

      <Button type="submit" className="w-full" loading={loading}>
        {autoVerify ? 'Record reading' : 'Submit reading'}
      </Button>
    </form>
  );
}
