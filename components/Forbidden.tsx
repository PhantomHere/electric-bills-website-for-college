import { Lock } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { LinkButton } from './Button';

export function Forbidden({ text = "Your role doesn't include this page." }: { text?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-8 py-20">
      <EmptyState
        icon={Lock}
        title="No access"
        text={text}
        action={<LinkButton href="/">Back to home</LinkButton>}
      />
    </div>
  );
}
