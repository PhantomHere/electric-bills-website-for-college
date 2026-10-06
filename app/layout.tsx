import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/lib/session-provider';
import { AppShell } from '@/components/AppShell';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Volt — electricity billing',
  description: 'Electricity billing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white font-sans text-[#1a1a1a] antialiased">
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
