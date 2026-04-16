"use client";

/**
 * Search input with icon and optional clear button.
 */

import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import { cn } from "@/lib/utils";

export default function SearchInput({ value, onChange, placeholder = "Cari...", className, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className={cn("relative group", className)}
    >
      <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-jw-accent transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 bg-bg-card border border-border-default rounded-xl text-sm
          text-text-primary placeholder:text-text-dim
          focus:outline-none focus:ring-2 focus:ring-jw-accent/30 focus:border-jw-accent/40
          transition-all duration-200"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-primary transition-colors cursor-pointer"
        >
          <HiXMark className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
