import { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-[#e8e8e8] p-6 ${muted ? 'bg-[#f7f8fa]' : 'bg-white'} ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold">{children}</h2>
      {action}
    </div>
  );
}
