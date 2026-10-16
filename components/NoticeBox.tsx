import { ReactNode } from 'react';
import { Info } from 'lucide-react';

const tones = {
  amber: { box: 'bg-[#fff8e6]', icon: 'text-[#d97706]', text: 'text-[#8a4b04]' },
  red: { box: 'bg-[#fde8e8]', icon: 'text-[#DB3E3E]', text: 'text-[#a02828]' },
  blue: { box: 'bg-[#eff6ff]', icon: 'text-[#3B82F6]', text: 'text-[#1d4ea8]' },
};

export function NoticeBox({ children, tone = 'amber' }: { children: ReactNode; tone?: keyof typeof tones }) {
  const t = tones[tone];
  return (
    <div className={`flex items-start gap-3 rounded-2xl px-5 py-4 ${t.box}`}>
      <Info className={`mt-0.5 h-4 w-4 shrink-0 ${t.icon}`} />
      <p className={`text-sm ${t.text}`}>{children}</p>
    </div>
  );
}
