import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#ddd] px-6 py-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f2f2] text-[#666]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm text-[#666]">{text}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
