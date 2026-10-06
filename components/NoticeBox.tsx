import { ReactNode } from 'react';
import { Info } from 'lucide-react';

export function NoticeBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[#fff8e6] px-5 py-4">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#d97706]" />
      <p className="text-sm text-[#92610b]">{children}</p>
    </div>
  );
}
