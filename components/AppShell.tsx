'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-provider';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

const PUBLIC_PATHS = ['/login', '/register'];

// Owns two things: redirecting based on auth state, and deciding whether
// the app chrome (header/footer) shows at all. Login and register pages
// render full-bleed, the way Diya's auth screens do — no nav around them.
export function AppShell({ children }: { children: React.ReactNode }) {
  const { account, hydrated } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!hydrated) return;
    if (!account && !isPublic) router.replace('/login');
    if (account && isPublic) router.replace('/');
  }, [hydrated, account, isPublic, pathname, router]);

  // Avoid flashing protected content (or the login form) for a frame while
  // localStorage is still being read, or while a redirect is in flight.
  if (!hydrated) return null;
  if (!account && !isPublic) return null;
  if (account && isPublic) return null;

  if (isPublic) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
