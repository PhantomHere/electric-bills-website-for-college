// Everything here is derived from real records — an overdue bill, a reading
// a controller rejected, a meter coming up for verification — not canned text.

import { BillView, DataState } from './types';
import { daysBetween, formatDate, formatMoney, periodLabel } from './format';

export interface Notice {
  id: string;
  tone: 'danger' | 'warning' | 'info';
  title: string;
  body: string;
  href: string;
}

export function customerNotices(args: {
  bills: BillView[];
  data: DataState;
  contractIds: string[];
  today: string;
}): Notice[] {
  const { bills, data, contractIds, today } = args;
  const out: Notice[] = [];

  for (const b of bills) {
    if (b.remaining <= 0) continue;
    const label = periodLabel(b.periodStart, b.periodEnd);
    if (b.pastDue) {
      out.push({
        id: `od-${b.id}`,
        tone: 'danger',
        title: `${label} bill is overdue`,
        body: `${formatMoney(b.remaining)} was due on ${formatDate(b.dueDate)} (${daysBetween(b.dueDate, today)} days ago).`,
        href: '/bills',
      });
    } else {
      const left = daysBetween(today, b.dueDate);
      if (left <= 7) {
        out.push({
          id: `due-${b.id}`,
          tone: 'warning',
          title: left <= 0 ? `${label} bill is due today` : `${label} bill is due in ${left} day${left === 1 ? '' : 's'}`,
          body: `${formatMoney(b.remaining)} to pay by ${formatDate(b.dueDate)}.`,
          href: '/bills',
        });
      }
    }
    const failed = b.payments.find(
      (p) => p.status === 'failed' && daysBetween(p.date.slice(0, 10), today) <= 14
    );
    if (failed) {
      out.push({
        id: `fail-${failed.id}`,
        tone: 'warning',
        title: 'A recent payment attempt failed',
        body: `${formatMoney(failed.amount)} for ${label} on ${formatDate(failed.date.slice(0, 10))} didn't go through.`,
        href: '/bills',
      });
    }
  }

  for (const m of data.meters.filter((x) => contractIds.includes(x.contractId))) {
    const readings = data.readings.filter((r) => r.meterId === m.id);
    const live = readings.filter((r) => r.status !== 'rejected').sort((a, b) => b.date.localeCompare(a.date));

    const rejected = readings
      .filter((r) => r.status === 'rejected' && (!live[0] || r.date > live[0].date))
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (rejected) {
      out.push({
        id: `rej-${rejected.id}`,
        tone: 'danger',
        title: `Your ${formatDate(rejected.date)} reading was rejected`,
        body: rejected.note ? `Reason: ${rejected.note}` : 'Please submit it again.',
        href: '/meters',
      });
    }

    const pending = readings.filter((r) => r.status === 'pending');
    for (const p of pending) {
      out.push({
        id: `pend-${p.id}`,
        tone: 'info',
        title: `Reading from ${formatDate(p.date)} is awaiting review`,
        body: `Meter ${m.serialNumber} — a controller will confirm it before it's used for billing.`,
        href: '/meters',
      });
    }

    if (m.status === 'active') {
      const lastDate = live[0]?.date;
      if (!lastDate || daysBetween(lastDate, today) > 31) {
        out.push({
          id: `rem-${m.id}`,
          tone: 'info',
          title: 'Time to submit a meter reading',
          body: lastDate
            ? `Meter ${m.serialNumber} was last read on ${formatDate(lastDate)}.`
            : `Meter ${m.serialNumber} has no readings yet.`,
          href: '/meters',
        });
      }
      const until = daysBetween(today, m.nextVerification);
      if (until <= 90) {
        out.push({
          id: `ver-${m.id}`,
          tone: 'warning',
          title: until < 0 ? 'Meter verification is overdue' : 'Meter verification coming up',
          body: `Meter ${m.serialNumber} is due for verification on ${formatDate(m.nextVerification)}.`,
          href: '/meters',
        });
      }
    }
  }

  const order = { danger: 0, warning: 1, info: 2 };
  return out.sort((a, b) => order[a.tone] - order[b.tone]);
}
