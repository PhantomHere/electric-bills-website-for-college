'use client';

// Diya's underlined segmented switcher: plain text siblings, a bold
// underline on the active one. No pills, no background fill.
export function Tabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-6 border-b border-[#E2E8F0]">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors ${
              active
                ? 'border-[#0B2545] text-[#0B2545]'
                : 'border-transparent text-[#64748B] hover:text-[#0B2545]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
