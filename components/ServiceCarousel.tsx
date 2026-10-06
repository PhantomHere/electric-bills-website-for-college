import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

export interface ServiceCard {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

// The reference's "popular services" row: a horizontally scrolling set
// of cards with a hover lift, not a grid.
export function ServiceCarousel({ items }: { items: ServiceCard[] }) {
  return (
    <div className="flex snap-x gap-5 overflow-x-auto pb-2">
      {items.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="w-64 shrink-0 snap-start rounded-2xl border border-[#e8e8e8] p-6 transition-all hover:-translate-y-0.5 hover:border-black hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
            <s.icon className="h-5 w-5" />
          </span>
          <p className="mt-4 font-semibold">{s.label}</p>
          <p className="mt-1 text-sm text-[#666]">{s.description}</p>
        </Link>
      ))}
    </div>
  );
}
