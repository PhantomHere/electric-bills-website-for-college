'use client';

// Segmented control: gray track, active option on a white pill.
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-[#f2f2f2] p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
              active ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#666] hover:text-[#1a1a1a]'
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`ml-1.5 text-xs ${active ? 'text-[#888]' : 'text-[#999]'}`}>{opt.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
