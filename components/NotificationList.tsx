import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Clock, Info } from 'lucide-react';
import { Notice } from '@/lib/notifications';

const STYLE = {
  danger: { icon: AlertTriangle, wrap: 'bg-[#fde8e8] text-[#c02f2f]' },
  warning: { icon: Clock, wrap: 'bg-[#fff8e6] text-[#a85b05]' },
  info: { icon: Info, wrap: 'bg-[#eff6ff] text-[#1d5fd1]' },
};

export function NotificationList({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-[#e6f9ef] px-4 py-3.5 text-sm text-[#087a3d]">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        You&apos;re all caught up — nothing needs your attention.
      </div>
    );
  }
  return (
    <ul className="space-y-2.5">
      {notices.map((n) => {
        const s = STYLE[n.tone];
        return (
          <li key={n.id}>
            <Link
              href={n.href}
              className="group flex items-start gap-3 rounded-xl border border-[#f0f0f0] p-3.5 transition-colors hover:border-[#ccc]"
            >
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.wrap}`}>
                <s.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{n.title}</span>
                <span className="block text-sm text-[#666]">{n.body}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
