'use client';

// Segmented control: a gray track, active option on a white pill with a
// soft shadow — matches the reference's .tabs/.tab pattern.
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
    <div className="inline-flex gap-1 rounded-xl bg-[#f2f2f2] p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#666] hover:text-[#1a1a1a]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
