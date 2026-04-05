"use client";

/**
 * Reusable badge component for status, department, and role labels.
 */

import { cn } from "@/lib/utils";

export default function Badge({ children, className, dot, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />}
      {children}
    </span>
  );
}
