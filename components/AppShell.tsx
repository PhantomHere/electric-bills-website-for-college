'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-provider';
import { useData } from '@/lib/data-provider';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { PageLoader } from './PageLoader';

const PUBLIC_PATHS = ['/login', '/register'];

// Owns auth redirects and decides whether the app chrome shows. Login and
// register render without the header/footer. Each route change re-keys the
// content wrapper so pages ease in instead of snapping.
export function AppShell({ children }: { children: React.ReactNode }) {
  const { account, hydrated } = useSession();
  const { ready } = useData();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!hydrated) return;
    if (!account && !isPublic) router.replace('/login');
    if (account && isPublic) router.replace('/');
  }, [hydrated, account, isPublic, router]);

  // Avoid flashing protected content (or the login form) while storage is
  // still being read or a redirect is in flight.
  if (!hydrated || !ready) return <PageLoader />;
  if (!account && !isPublic) return <PageLoader />;
  if (account && isPublic) return <PageLoader />;

  if (isPublic) {
    return (
      <div key={pathname} className="animate-fade-up">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div key={pathname} className="animate-fade-up flex-1">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
