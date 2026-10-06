import Link from 'next/link';
import { Zap } from 'lucide-react';

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Account',
    links: [
      { href: '/bills', label: 'My bills' },
      { href: '/profile', label: 'Profile settings' },
    ],
  },
  {
    title: 'Staff',
    links: [
      { href: '/dashboard', label: 'Staff dashboard' },
      { href: '/dashboard/requests', label: 'Access requests' },
    ],
  },
  {
    title: 'Help',
    links: [{ href: '/faq', label: 'FAQ' }],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-[#1a1a1a] text-white">
      <div className="mx-auto max-w-6xl px-8 py-16">
        <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 text-lg font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                <Zap className="h-4 w-4" fill="currentColor" strokeWidth={0} />
              </span>
              Volt
            </div>
            <p className="mt-3 max-w-xs text-sm text-[#aaa]">
              Electricity billing. Running on mock data; nothing here is billed for real.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-sm font-semibold">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-[#aaa] hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-[#333] pt-6 text-xs text-[#777]">
          Volt is a demo built for coursework — not a real utility, and no real payments are taken.
        </p>
      </div>
    </footer>
  );
}
