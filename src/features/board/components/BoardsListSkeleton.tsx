import { Skeleton } from "@/components/ui/skeleton";

function BoardCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-1.5 w-full rounded-full" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

export function BoardsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <BoardCardSkeleton key={i} />
      ))}
    </div>
  );
}
