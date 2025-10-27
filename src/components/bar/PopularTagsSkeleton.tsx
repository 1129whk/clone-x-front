"use client";

import Skeleton from "@/components/ui/Skeleton";

export default function PopularTagsSkeleton() {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="mb-3 h-5 w-28">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/4" />
      </div>
    </div>
  );
}
