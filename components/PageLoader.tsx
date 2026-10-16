import { Zap } from 'lucide-react';

// Shown for a beat while the stored session and data are read from the
// browser — instead of a blank white screen.
export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-black text-white">
        <Zap className="h-5 w-5" fill="currentColor" strokeWidth={0} />
      </span>
    </div>
  );
}
