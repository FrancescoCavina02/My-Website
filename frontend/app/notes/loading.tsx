import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <section className="section">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48 mx-auto" variant="text" />
          <Skeleton className="h-5 w-3/4 mx-auto" variant="text" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-36 w-full" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
