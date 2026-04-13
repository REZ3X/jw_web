/**
 * Badge — small status/label pill.
 */

import { cn } from "@/lib/utils";

export default function Badge({ children, className, dot }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap",
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
      )}
      {children}
    </span>
  );
}
