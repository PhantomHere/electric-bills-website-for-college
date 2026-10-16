import { ReactNode } from 'react';

// Smooth height animation without measuring: animate the grid row between
// 0fr and 1fr. Hidden content is also removed from the tab order.
export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
    >
      <div className={`overflow-hidden transition-[visibility] duration-300 ${open ? 'visible' : 'invisible'}`}>
        {children}
      </div>
    </div>
  );
}
