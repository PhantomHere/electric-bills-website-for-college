import Link from 'next/link';
import { ServiceCard } from './ServiceCarousel';

export function CategoryGrid({ items }: { items: ServiceCard[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="rounded-2xl border border-[#e8e8e8] p-6 transition-all hover:-translate-y-0.5 hover:border-black hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
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
