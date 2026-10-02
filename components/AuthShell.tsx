import Link from 'next/link';
import { Zap } from 'lucide-react';
import { ReactNode } from 'react';

// Shared chrome for /login and /register — the minimal top bar plus
// two-column split (form / info panel) that Diya uses for its auth flows,
// instead of the full site header and nav.
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
    <div className="min-h-screen">
      <header className="border-b border-[#E2E8F0] px-6 py-4">
        <Link href="/" className="flex w-fit items-center gap-2 font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B2545] text-white">
            <Zap className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          </span>
          Volt
        </Link>
      </header>

      <div className="mx-auto grid max-w-4xl gap-10 px-6 py-12 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">{title}</h1>
          <p className="mt-2 text-[#64748B]">{subtitle}</p>
          <div className="mt-8 max-w-sm">{children}</div>
        </div>
        <aside className="h-fit rounded-2xl bg-[#F2F6FB] p-6">{panel}</aside>
      </div>
    </div>
  );
}
