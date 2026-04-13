"use client";

/**
 * Dropdown menu with framer-motion.
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Dropdown({ trigger, children, align = "right", className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute top-full mt-1.5 min-w-[180px] z-50 py-1",
              "rounded-xl bg-bg-elevated border border-border-default shadow-xl shadow-black/40",
              align === "right" ? "right-0" : "left-0"
            )}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ children, className, danger, ...props }) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-2 px-3.5 py-2 text-sm text-left transition-colors duration-150 cursor-pointer",
        danger
          ? "text-danger hover:bg-danger/10"
          : "text-text-primary hover:bg-bg-card-hover hover:text-jw-mint",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
