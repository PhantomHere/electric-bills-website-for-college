import { ReactNode } from 'react';
import { Info } from 'lucide-react';

// Mirrors Diya's pale notice panel: an icon, a line of text, and an inline
// bold link doing the actual work. Kept to amber so it reads as "heads up"
// and never gets confused with the overdue-red used on bill statuses.
export function NoticeBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[#FEF6E7] px-5 py-4">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#B7791F]" />
      <p className="text-sm text-[#7B5A14]">{children}</p>
    </div>
  );
}
