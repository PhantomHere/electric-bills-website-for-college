'use client';

import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, useId } from 'react';

const control =
  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-black disabled:bg-[#f7f8fa] disabled:text-[#888]';

// White, outlined, border goes black on focus. `error` turns the border
// red and wires up aria-invalid; `right` is a slot for e.g. a show/hide button.
export function FormField({
  label,
  hint,
  error,
  right,
  className = '',
  ...props
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  right?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#444]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={!!error}
          {...props}
          className={`${control} ${error ? 'border-[#DB3E3E]' : 'border-[#ddd]'} ${right ? 'pr-12' : ''}`}
        />
        {right && <div className="absolute inset-y-0 right-2 flex items-center">{right}</div>}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-[#DB3E3E]">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-[#888]">{hint}</p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  className = '',
  children,
  ...props
}: { label: string; hint?: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#444]">
        {label}
      </label>
      <select id={id} {...props} className={`${control} border-[#ddd]`}>
        {children}
      </select>
      {hint && <p className="mt-1.5 text-xs text-[#888]">{hint}</p>}
    </div>
  );
}
