"use client";

/**
 * Button component with variants.
 */

import { cn } from "@/lib/utils";
import { ImSpinner8 } from "react-icons/im";

const VARIANTS = {
  primary:
    "gradient-btn font-semibold",
  secondary:
    "bg-bg-card border border-border-default text-text-primary hover:bg-bg-card-hover hover:border-border-accent font-semibold",
  outline:
    "border border-border-default text-text-secondary hover:border-jw-accent hover:text-jw-mint bg-transparent font-semibold",
  ghost:
    "text-text-muted hover:text-text-primary hover:bg-bg-card-hover font-medium",
  danger:
    "bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 font-semibold",
};

const SIZES = {
  xs:  "text-xs px-2 py-1 rounded-md gap-1",
  sm:  "text-xs px-3 py-1.5 rounded-lg gap-1.5",
  md:  "text-sm px-4 py-2 rounded-xl gap-2",
  lg:  "text-sm px-6 py-2.5 rounded-xl gap-2",
};

export default function Button({
  children, variant = "primary", size = "md",
  loading, disabled, className, type = "button", ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <ImSpinner8 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
