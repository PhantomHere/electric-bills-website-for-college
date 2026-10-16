'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useSession } from '@/lib/session-provider';
import { searchSite } from '@/lib/site-search';

// A real filter over the pages this account can open. Arrow keys move
// through results, Enter opens one, Escape closes the list.
export function SiteSearch() {
  const { account } = useSession();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const results = searchSite(query, account);

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

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active].href);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showList = open && query.trim() !== '';

  return (
    <div ref={boxRef} className="relative mx-auto max-w-xl text-left">
      <div className="flex items-center rounded-full bg-white pr-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showList}
          aria-controls="site-search-results"
          aria-label="Search the site"
          placeholder="Search bills, meters, tariffs…"
          className="w-full bg-transparent px-6 py-4 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999]"
        />
        <button
          onClick={() => results[active] && go(results[active].href)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform active:scale-95"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {showList && (
        <ul
          id="site-search-results"
          role="listbox"
          className="animate-pop absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-lg"
        >
          {results.length === 0 && <li className="px-5 py-4 text-sm text-[#666]">No pages match “{query}”.</li>}
          {results.map((r, i) => (
            <li key={r.href} role="option" aria-selected={i === active}>
              <button
                onClick={() => go(r.href)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full flex-col items-start px-5 py-3 text-left ${i === active ? 'bg-[#f7f8fa]' : ''}`}
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
