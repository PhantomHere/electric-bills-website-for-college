import { Bill } from '@/lib/types';
import { STATUS_META } from '@/lib/status-meta';

export function BillsTable({ bills }: { bills: Bill[] }) {
  if (bills.length === 0) {
    return <p className="py-4 text-sm text-[#64748B]">No bills for this period yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F2F6FB] text-left text-xs text-[#64748B]">
            <th className="px-4 py-2.5 font-medium">Period</th>
            <th className="px-4 py-2.5 text-right font-medium">Amount</th>
            <th className="px-4 py-2.5 text-right font-medium">Due</th>
            <th className="px-4 py-2.5 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => {
            const status = STATUS_META[b.status];
            return (
              <tr key={b.id} className="border-t border-[#E2E8F0]">
                <td className="px-4 py-3">{b.periodStart} – {b.periodEnd}</td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">{b.amount.toFixed(2)} ₽</td>
                <td className="px-4 py-3 text-right font-mono text-[13px] text-[#64748B]">{b.dueDate}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${status.chip} ${status.text}`}>
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
