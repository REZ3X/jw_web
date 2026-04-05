"use client";

/**
 * Empty state component for when lists have no data.
 */

import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-light" />
      </div>
      {title && <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>}
      {description && <p className="text-sm text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
