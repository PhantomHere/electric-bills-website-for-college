import { ReactNode } from 'react';

// The reference's pastel diagonal gradient band, used at the top of every
// inner page (not just the homepage hero) the way dashboard.html does it.
export function PageHeader({ title, subtitle }: { title: string; subtitle: ReactNode }) {
  return (
    <div
      className="px-8 pb-10 pt-12"
      style={{
        background:
          'linear-gradient(135deg, #a8e6cf 0%, #88d3ce 30%, #7eb8da 60%, #9b8fd9 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">{title}</h1>
        <p className="mt-1 text-[#333]">{subtitle}</p>
      </div>
    </div>
  );
}
