"use client";

/**
 * Modal overlay component.
 * Renders children in a centered overlay with backdrop blur.
 * Closes on backdrop click or Escape key.
 */

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Modal({ open, onClose, children, className, title, size = "lg" }) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const SIZES = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] px-4 pb-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div
        className={cn(
          "relative w-full bg-surface rounded-2xl shadow-2xl border border-surface-border overflow-hidden animate-scale-in max-h-[90vh] flex flex-col",
          SIZES[size],
          className
        )}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
