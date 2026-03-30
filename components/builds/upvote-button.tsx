'use client';

import { useOptimistic, useTransition } from 'react';

import { toggleUpvoteAction } from '@/app/actions/upvotes';
import { UpvoteIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

type UpvoteButtonProps = {
  buildId: string;
  initialCount: number;
  initialUpvoted: boolean;
  isAuthenticated: boolean;
};

export function UpvoteButton({
  buildId,
  initialCount,
  initialUpvoted,
  isAuthenticated,
}: UpvoteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic(
    { upvoted: initialUpvoted, count: initialCount },
    (current) => ({
      upvoted: !current.upvoted,
      count: current.upvoted ? current.count - 1 : current.count + 1,
    })
  );

  function handleClick() {
    if (!isAuthenticated) return;

    startTransition(async () => {
      setOptimistic(null);
      await toggleUpvoteAction(buildId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isAuthenticated || isPending}
      aria-label={optimistic.upvoted ? 'Remove upvote' : 'Upvote this build'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-150',
        optimistic.upvoted
          ? 'border-amber-500/40 bg-amber-50 text-amber-700 hover:bg-amber-100'
          : 'border-border bg-muted text-muted-foreground hover:border-amber-500/40 hover:text-amber-700',
        !isAuthenticated && 'cursor-not-allowed opacity-50',
        isPending && 'pointer-events-none'
      )}
    >
      <UpvoteIcon
        size={14}
        className={cn(
          'transition-colors',
          optimistic.upvoted ? 'text-amber-600' : ''
        )}
      />
      <span className="tabular-nums">{optimistic.count}</span>
    </button>
  );
}
