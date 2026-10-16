import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/lib/session-provider';
import { DataProvider } from '@/lib/data-provider';
import { ToastProvider } from '@/components/ToastProvider';
import { AppShell } from '@/components/AppShell';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Volt — electricity billing', template: '%s · Volt' },
  description: 'Electricity bills, meter readings and payments in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white font-sans text-[#1a1a1a] antialiased">
        <SessionProvider>
          <DataProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </DataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
