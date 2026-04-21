import Skeleton from "@/components/ui/Skeleton";

/**
 * Card Skeleton Component
 *
 * Mimics the layout of the Card component used for categories and books.
 * Provides a loading placeholder that matches the actual content structure.
 *
 * Usage:
 *   <CardSkeleton /> - Single card skeleton
 *   <CardSkeleton.Grid count={6} /> - Grid of card skeletons
 */
export default function CardSkeleton() {
  return (
    <div className="card p-6">
      {/* Icon + Title area */}
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton variant="text" className="h-6 w-3/4 mb-2" />
          <Skeleton variant="text" className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

/**
 * Card Skeleton Grid
 *
 * Displays multiple card skeletons in a responsive grid layout.
 */
CardSkeleton.Grid = function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Book Card Skeleton - Simpler layout without icon
 */
export function BookCardSkeleton() {
  return (
    <div className="card p-5">
      <Skeleton variant="text" className="h-5 w-3/4 mb-1" />
      <Skeleton variant="text" className="h-4 w-1/3" />
    </div>
  );
}

/**
 * Book Card Skeleton Grid
 */
BookCardSkeleton.Grid = function BookCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Search Result Card Skeleton
 */
export function SearchCardSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex items-start gap-2 mb-2">
        <Skeleton variant="text" className="h-5 w-20" />
        <Skeleton variant="text" className="h-5 w-24" />
      </div>
      <Skeleton variant="text" className="h-5 w-full mb-1" />
      <Skeleton variant="text" className="h-4 w-20" />
    </div>
  );
}

/**
 * Search Result Skeleton Grid
 */
SearchCardSkeleton.Grid = function SearchCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SearchCardSkeleton key={i} />
      ))}
    </div>
  );
};
