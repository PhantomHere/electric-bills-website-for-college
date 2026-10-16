import { SearchX } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { LinkButton } from '@/components/Button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-24">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        text="That page doesn’t exist, or it moved."
        action={<LinkButton href="/">Back to home</LinkButton>}
      />
    </div>
  );
}
