import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

const valueTone = {
  default: 'text-[#1a1a1a]',
  danger: 'text-[#DB3E3E]',
  success: 'text-[#087a3d]',
};

export function StatCard({
  label,
  value,
  sub,
  tone = 'default',
  icon: Icon,
  action,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: keyof typeof valueTone;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between text-sm text-[#666]">
        <span>{label}</span>
        {Icon && <Icon className="h-4 w-4 text-[#999]" />}
      </div>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${valueTone[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-sm text-[#666]">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
