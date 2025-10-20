"use client";

import Skeleton from "@/components/ui/Skeleton";

export default function RecommendationsSkeleton() {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      {/* 타이틀 */}
      <div className="mb-3">
        <Skeleton className="h-5 w-28" />
      </div>

      {/* 아이템 3개 정도 */}
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
