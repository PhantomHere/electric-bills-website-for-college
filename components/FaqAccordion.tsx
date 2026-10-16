'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapse } from './Collapse';

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="divide-y divide-[#f0f0f0] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
      {items.map((item, i) => {
        const open = openIdx === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium transition-colors hover:bg-[#fafafa]"
            >
              {item.q}
              <ChevronDown className={`h-4 w-4 shrink-0 text-[#999] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            <Collapse open={open}>
              <p className="px-5 pb-5 text-sm leading-relaxed text-[#666]">{item.a}</p>
            </Collapse>
          </div>
        );
      })}
    </div>
  );
}
