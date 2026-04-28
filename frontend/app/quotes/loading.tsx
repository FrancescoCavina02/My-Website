import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <section className="section">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-44 mx-auto" variant="text" />
          <Skeleton className="h-5 w-2/3 mx-auto" variant="text" />
          <Skeleton className="h-[280px] w-full" />
        </div>
      </section>
    </div>
  );
}
