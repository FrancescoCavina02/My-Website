import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";

/**
 * Note Content Skeleton
 *
 * Mimics the layout of a full note with header, content sections, and children links.
 * Provides a realistic loading placeholder for note content.
 *
 * Usage:
 *   <NoteSkeleton />
 */
export default function NoteSkeleton() {
  return (
    <div className="card">
      {/* Note Header */}
      <div className="mb-6 pb-4 border-b border-white/10">
        <Skeleton variant="text" className="h-8 w-2/3 mb-2" />
        <Skeleton variant="text" className="h-4 w-32" />
      </div>

      {/* Note Content - Multiple sections */}
      <div className="space-y-8">
        {/* Section 1 */}
        <div>
          <Skeleton variant="text" className="h-7 w-1/3 mb-4" />
          <SkeletonText lines={4} />
        </div>

        {/* Section 2 */}
        <div>
          <Skeleton variant="text" className="h-7 w-2/5 mb-4" />
          <SkeletonText lines={3} />
        </div>

        {/* Section 3 */}
        <div>
          <Skeleton variant="text" className="h-7 w-1/4 mb-4" />
          <SkeletonText lines={5} />
        </div>

        {/* Code block placeholder */}
        <div className="bg-[var(--color-space-700)] p-4 rounded-lg">
          <SkeletonText lines={3} />
        </div>

        {/* Section 4 */}
        <div>
          <Skeleton variant="text" className="h-7 w-1/3 mb-4" />
          <SkeletonText lines={4} />
        </div>
      </div>

      {/* Children/Chapters Section */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <Skeleton variant="text" className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-space-700)]"
            >
              <Skeleton variant="text" className="h-5 w-3/4" />
              <Skeleton variant="text" className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Quote Skeleton
 *
 * Mimics the layout of a quote card with quote text, attribution, and metadata.
 *
 * Usage:
 *   <QuoteSkeleton />
 */
export function QuoteSkeleton() {
  return (
    <div className="card text-center relative animate-pulse">
      {/* Quote Icon */}
      <div className="text-6xl text-[var(--color-accent-500)] opacity-30 absolute top-4 left-4">
        &ldquo;
      </div>

      {/* Quote Text */}
      <div className="pt-8 px-8 mb-6">
        <div className="space-y-3 max-w-2xl mx-auto">
          <Skeleton variant="text" className="h-7 w-full" />
          <Skeleton variant="text" className="h-7 w-5/6 mx-auto" />
          <Skeleton variant="text" className="h-7 w-4/5 mx-auto" />
        </div>
      </div>

      {/* Attribution */}
      <div className="border-t border-white/10 pt-4">
        <Skeleton variant="text" className="h-5 w-48 mx-auto mb-1" />
        <Skeleton variant="text" className="h-4 w-32 mx-auto mb-3" />
        <Skeleton variant="text" className="h-6 w-24 mx-auto rounded-full" />
      </div>

      {/* Copy button placeholder */}
      <div className="absolute top-4 right-4">
        <Skeleton variant="circular" className="w-9 h-9" />
      </div>
    </div>
  );
}
