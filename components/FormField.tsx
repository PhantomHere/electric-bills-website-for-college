import { InputHTMLAttributes } from 'react';

// Matches the reference's .form-input: white, outlined, border goes
// black on focus — not the filled-gray look from an earlier pass.
export function FormField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#444]">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-black"
      />
    </label>
  );
}
