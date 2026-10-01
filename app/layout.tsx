import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import { SessionProvider } from '@/lib/session-provider';
import './globals.css';

// UI text and headings
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
});

// Anything that's a figure off a meter or a bill — account numbers, serials,
// amounts — reads as mono, so a glance tells you "this is a reading" vs
// "this is a label."
const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Energy Account',
  description: 'Electricity billing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
      <body className="bg-white font-sans text-[#0B2545] antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
