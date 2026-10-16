import { Bill } from '@/lib/types';
import { STATUS_META } from '@/lib/status-meta';

export function BillsTable({ bills }: { bills: Bill[] }) {
  if (bills.length === 0) {
    return <p className="py-4 text-sm text-[#666]">No bills for this period yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e8e8]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#eee] text-left">
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#888]">Period</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-[#888]">Amount</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-[#888]">Due</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-[#888]">Status</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => {
            const status = STATUS_META[b.status];
            return (
              <tr key={b.id} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-3.5">{b.periodStart} – {b.periodEnd}</td>
                <td className="px-4 py-3.5 text-right font-semibold">{b.amount.toFixed(2)} ₽</td>
                <td className="px-4 py-3.5 text-right text-[#666]">{b.dueDate}</td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${status.chip} ${status.text}`}>
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
