'use client';

import { TriangleAlert } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-8 py-24">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        text="An unexpected error stopped this page from loading. Trying again usually fixes it."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </div>
  );
}
