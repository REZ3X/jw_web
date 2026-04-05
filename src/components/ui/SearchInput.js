"use client";

/**
 * Search input with icon and optional clear button.
 */

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchInput({ value, onChange, placeholder = "Search…", className, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className={cn("relative", className)}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 bg-surface-hover border border-surface-border rounded-xl text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-jw-primary/30 focus:border-jw-primary transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
