'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type Kind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  message: string;
  kind: Kind;
}

const ToastContext = createContext<{ toast: (message: string, kind?: Kind) => void } | null>(null);

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const ICON_TONE = { success: 'text-[#04C65D]', error: 'text-[#ff6b6b]', info: 'text-[#7eb8da]' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message: string, kind: Kind = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t.slice(-3), { id, message, kind }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div
              key={t.id}
              className="animate-toast pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl bg-[#1a1a1a] px-4 py-3 text-sm text-white shadow-xl"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${ICON_TONE[t.kind]}`} />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="-mr-1 text-[#999] transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.toast;
}
