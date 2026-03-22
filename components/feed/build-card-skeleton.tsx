import { Skeleton } from '@/components/ui/skeleton';

// ---------------------------------------------------------------------------
// BuildCardSkeleton
// ---------------------------------------------------------------------------

/**
 * A loading placeholder that mirrors the exact layout of BuildCard.
 *
 * Used in feed grids to prevent layout shift while builds are loading.
 * Each skeleton element matches the dimensions of its BuildCard counterpart.
 */
export function BuildCardSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-border">
      {/* Thumbnail — h-40 matching BuildCard */}
      <Skeleton className="h-40 w-full rounded-none" />

      {/* Content */}
      <div className="p-5">
        {/* Badge row */}
        <div className="mb-3 flex items-center gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="mb-2 h-5 w-4/5" />

        {/* Description — two lines */}
        <div className="mb-4 space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
    </div>
  );
}
