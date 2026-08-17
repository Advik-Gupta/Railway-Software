import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function MachineDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl min-w-0 px-6 py-10">
      <Skeleton className="h-7 w-64" />
      <Skeleton className="mt-2 h-4 w-40" />

      <Card className="mt-8 border-border bg-card/40 p-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-9 w-full max-w-[320px]" />
      </Card>

      <Card className="mt-6 border-border bg-card/40 p-5">
        <Skeleton className="h-5 w-24" />
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
