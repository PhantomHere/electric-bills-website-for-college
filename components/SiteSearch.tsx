'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { searchSite } from '@/lib/site-search';

// A real filter over a real (if small) index — typing narrows the list,
// clicking or pressing Enter actually navigates. Styled as the reference's
// floating white search pill with a black circular submit button.
export function SiteSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const results = searchSite(query);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery('');
    router.push(href);
  }

  return (
    <div ref={boxRef} className="relative mx-auto max-w-xl">
      <div className="flex items-center rounded-full bg-white pr-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) go(results[0].href);
          }}
          placeholder="Service or situation…"
          className="w-full bg-transparent px-6 py-4 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999]"
        />
        <button
          onClick={() => results[0] && go(results[0].href)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-lg">
          {results.map((r) => (
            <li key={r.href}>
              <button
                onClick={() => go(r.href)}
                className="flex w-full flex-col items-start px-5 py-3 text-left hover:bg-[#f7f8fa]"
              >
                <span className="text-sm font-medium">{r.label}</span>
                <span className="text-xs text-[#666]">{r.description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
