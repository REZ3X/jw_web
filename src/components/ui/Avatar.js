"use client";

/**
 * Avatar component with optional government badge overlay.
 * Renders user avatar with fallback initials and role badge for gov users.
 */

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

const SIZES = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
  "2xl": "w-24 h-24 text-3xl",
};

export default function Avatar({ src, name, size = "md", isGovernment = false, className }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          SIZES[size],
          "rounded-full overflow-hidden bg-gradient-to-br from-jw-primary/20 to-jw-secondary/20 flex items-center justify-center font-semibold text-jw-primary ring-2 ring-surface-border"
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={name || "Avatar"}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {/* Government badge overlay */}
      {isGovernment && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-surface"
          title="Official Government Account"
        >
          <Shield className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </div>
  );
}
