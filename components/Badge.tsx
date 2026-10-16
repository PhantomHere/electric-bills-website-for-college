import { ReactNode } from 'react';

// Soft-tint pills. Text colors are a notch darker than the pastel
// reference so they stay readable on the tinted backgrounds.
const tones = {
  green: 'bg-[#e6f9ef] text-[#087a3d]',
  amber: 'bg-[#fff8e6] text-[#a85b05]',
  red: 'bg-[#fde8e8] text-[#c02f2f]',
  blue: 'bg-[#eff6ff] text-[#1d5fd1]',
  gray: 'bg-[#f2f2f2] text-[#555]',
};

export type Tone = keyof typeof tones;

export function Badge({ tone = 'gray', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
