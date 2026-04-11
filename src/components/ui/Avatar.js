"use client";

/**
 * Avatar component with optional government badge.
 * Uses rounded-square shape (rounded corners, not fully circular).
 */

import Image from "next/image";
import { cn } from "@/lib/utils";
import { HiShieldCheck } from "react-icons/hi2";

const SIZES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-24 h-24 text-2xl",
};

/** Size-dependent border radius for squircle look */
const RADIUS = {
  xs: "rounded-md",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  "2xl": "rounded-3xl",
};

export default function Avatar({ src, name, size = "md", isGovernment = false, className }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          SIZES[size],
          RADIUS[size] || "rounded-xl",
          "overflow-hidden flex items-center justify-center font-bold",
          src
            ? "ring-1 ring-border-subtle"
            : "bg-jw-secondary text-jw-mint/80 ring-1 ring-jw-accent/20"
        )}
      >
        {src ? (
          <Image src={src} alt={name || "Avatar"} fill className="object-cover" sizes="96px" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {isGovernment && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-jw-accent rounded-full flex items-center justify-center ring-2 ring-bg-primary"
          title="Official Government Account"
        >
          <HiShieldCheck className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </div>
  );
}
