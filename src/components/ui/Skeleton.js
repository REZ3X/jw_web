"use client";

/**
 * Skeleton loading placeholders with shimmer animation.
 */

import { cn } from "@/lib/utils";

export function Skeleton({ className }) {
  return <div className={cn("rounded-lg animate-shimmer", className)} />;
}

/** Pre-built skeleton for a post card */
export function PostCardSkeleton() {
  return (
    <div className="rounded-xl bg-bg-card border border-border-default p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center gap-2.5">
        <Skeleton className="w-8 h-8 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-7 w-20 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}

/** Skeleton for a comment */
export function CommentSkeleton() {
  return (
    <div className="flex gap-2.5 py-3">
      <Skeleton className="w-7 h-7 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/5" />
      </div>
    </div>
  );
}
