import { Bill } from '@/lib/types';
import { STATUS_META } from '@/lib/status-meta';

// Define a safe lookup for the tones provided by your STATUS_META data structure
const toneClasses: Record<string, string> = {
  green: "bg-green-50 text-green-700 border-green-200/60",
  amber: "bg-amber-50 text-amber-700 border-amber-200/60",
  red:   "bg-red-50 text-red-700 border-red-200/60",
  blue:  "bg-blue-50 text-blue-700 border-blue-200/60",
  gray:  "bg-gray-50 text-gray-600 border-gray-200",
};

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
            // 1. Force the lookup key matching what exists on your config object
            const statusConfig = STATUS_META[b.status as keyof typeof STATUS_META];
            
            // 2. Safely grab Tailwind classes matching your theme configurations
            const visualBadgeClass = toneClasses[statusConfig?.tone] || toneClasses.gray;

            return (
              <tr key={b.id} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-3.5">{b.periodStart} – {b.periodEnd}</td>
                <td className="px-4 py-3.5 text-right font-semibold">{b.amount.toFixed(2)} ₽</td>
                <td className="px-4 py-3.5 text-right text-[#666]">{b.dueDate}</td>
                <td className="px-4 py-3.5 text-right">
                  {/* 3. Replaced missing status.chip and status.text with safe mappings */}
                  <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${visualBadgeClass}`}>
                    {statusConfig?.label || b.status}
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
