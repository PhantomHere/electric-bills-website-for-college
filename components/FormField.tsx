import { InputHTMLAttributes } from 'react';

// Diya's filled-field look: label above, light gray fill, no visible
// border box — used by both login and register.
export function FormField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-[#64748B]">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl bg-[#F2F6FB] px-4 py-3 text-sm text-[#0B2545] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
      />
    </label>
  );
}
