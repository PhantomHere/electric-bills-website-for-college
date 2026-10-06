import Link from 'next/link';
import { Zap } from 'lucide-react';
import { ReactNode } from 'react';

// Shared chrome for /login and /register. The form sits in a white card
// with a border and soft shadow — the same visual weight as the
// reference's login modal, just inline on the page instead of overlaid.
export function AuthShell({
  title,
  subtitle,
  children,
  panel,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  panel: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="border-b border-[#eee] bg-white px-8 py-4">
        <Link href="/" className="flex w-fit items-center gap-2.5 text-lg font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Zap className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          </span>
          Volt
        </Link>
      </header>

      <div className="mx-auto grid max-w-4xl gap-8 px-6 py-16 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-[#e8e8e8] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-[#666]">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <aside className="h-fit rounded-3xl bg-white p-6 border border-[#e8e8e8]">{panel}</aside>
      </div>
    </div>
  );
}
