import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function UserDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-5 w-24 rounded-full" />
        </div>
      </div>
      <Skeleton className="mt-1.5 h-4 w-36" />

      {/* Details card */}
      <Card className="mt-8 border-border bg-card/40 p-5">
        <Skeleton className="h-4 w-16" />

        <div className="mt-4 space-y-4">
          <div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-1.5 h-9 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-12" />
            <Skeleton className="mt-1.5 h-9 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-1.5 h-9 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-10" />
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Skeleton className="h-9 w-32" />
        </div>
      </Card>

      {/* Danger zone card */}
      <Card className="mt-6 border-destructive/30 bg-destructive/5 p-5">
        <Skeleton className="h-4 w-24" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
        </div>
      </Card>
    </div>
  );
}
