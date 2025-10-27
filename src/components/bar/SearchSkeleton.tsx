"use client";

import Skeleton from "@/components/ui/Skeleton";

export default function SearchSkeleton() {
  return (
    <div className="sticky top-0 z-10">
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
}
