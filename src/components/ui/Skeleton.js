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
    <div className="bg-surface border border-surface-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

/** Skeleton for a comment */
export function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-3">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
