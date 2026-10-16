import { ReactNode } from 'react';

// The pastel gradient band at the top of every inner page.
export function PageHeader({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className="px-6 pb-10 pt-12 sm:px-8"
      style={{
        background: 'linear-gradient(135deg, #a8e6cf 0%, #88d3ce 30%, #7eb8da 60%, #9b8fd9 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">{title}</h1>
            {subtitle && <p className="mt-1 text-[#333]">{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
