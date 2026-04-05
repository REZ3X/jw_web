"use client";

/**
 * Dropdown menu component.
 * Opens on click, closes on outside click or Escape.
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Dropdown({ trigger, children, align = "right", className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            "absolute top-full mt-2 min-w-[180px] bg-surface border border-surface-border rounded-xl shadow-xl z-50 py-1.5 animate-slide-down",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Dropdown menu item */
export function DropdownItem({ children, className, danger, ...props }) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors cursor-pointer",
        danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          : "text-foreground hover:bg-surface-hover",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
