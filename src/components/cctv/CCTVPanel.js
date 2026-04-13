"use client";

/**
 * CCTVPanel — Sidebar/bottom panel listing all CCTV cameras.
 *
 * Desktop: right sidebar with search & scrollable category filter.
 * Mobile: expandable bottom sheet (minimize/maximize) with full search+filter.
 */

import { useState, useMemo, useRef } from "react";
import { HiMapPin, HiSignal, HiMagnifyingGlass, HiChevronUp, HiChevronDown, HiXMark, HiSun, HiMoon } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CCTV_CATEGORIES } from "@/lib/cctv-data";

/* ── Shared: camera list item ──────────────────────────────────────── */
function CameraItem({ cam, selectedId, onSelect, index }) {
  return (
    <motion.button
      key={cam.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.5), duration: 0.3 }}
      onClick={() => onSelect(cam)}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group",
        selectedId === cam.id
          ? "bg-jw-accent/12 border border-jw-accent/25"
          : "hover:bg-bg-card-hover border border-transparent"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-1.5 w-2 h-2 rounded-full shrink-0 bg-danger animate-pulse" />
        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-[13px] font-semibold truncate transition-colors",
            selectedId === cam.id ? "text-jw-mint" : "text-text-primary"
          )}>
            {cam.name}
          </p>
          <p className="text-[10px] text-text-dim flex items-center gap-1 mt-0.5">
            <HiMapPin className="w-2.5 h-2.5 text-jw-accent/60 shrink-0" />
            <span className="truncate">{cam.district || cam.categoryLabel}</span>
          </p>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Shared: category filter chips ─────────────────────────────────── */
function CategoryChips({ categories, categoryFilter, setCategoryFilter }) {
  const scrollRef = useRef(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-0.5 px-0.5"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <button
        onClick={() => setCategoryFilter("all")}
        className={cn(
          "shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer",
          categoryFilter === "all"
            ? "bg-jw-accent/15 text-jw-mint border border-jw-accent/25"
            : "text-text-dim hover:text-text-muted bg-bg-inset border border-transparent"
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => setCategoryFilter(cat.value)}
          className={cn(
            "shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap cursor-pointer",
            categoryFilter === cat.value
              ? "bg-jw-accent/15 text-jw-mint border border-jw-accent/25"
              : "text-text-dim hover:text-text-muted bg-bg-inset border border-transparent"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */

export default function CCTVPanel({ cameras, selectedId, onSelect, lightMap, setLightMap }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const filtered = useMemo(() => {
    let result = cameras;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((c) => c.category === categoryFilter);
    }
    return result;
  }, [cameras, search, categoryFilter]);

  const categories = useMemo(() => {
    const cats = [...new Set(cameras.map((c) => c.category))];
    return cats
      .map((c) => ({
        value: c,
        label: CCTV_CATEGORIES[c] || `Kategori ${c}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [cameras]);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
       *  DESKTOP SIDEBAR
       * ═══════════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-[320px] xl:w-[340px] shrink-0 h-full
        border-l border-border-default bg-bg-primary/95 backdrop-blur-xl overflow-hidden z-10">

        {/* Header */}
        <div className="px-4 py-3.5 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-text-primary mb-0.5">CCTV Cameras</h2>
              <p className="text-[11px] text-text-dim">{cameras.length} cameras • {filtered.length} shown</p>
            </div>
            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setLightMap?.(!lightMap)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer",
                lightMap
                  ? "bg-amber-500/10 border border-amber-400/20 text-amber-400"
                  : "bg-bg-card-hover border border-border-default text-text-muted hover:text-text-primary"
              )}
              title={lightMap ? "Switch to dark map" : "Switch to light map"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {lightMap ? (
                  <motion.span
                    key="moon"
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiMoon className="w-3.5 h-3.5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="sun"
                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiSun className="w-3.5 h-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="text-[10px] font-semibold">
                {lightMap ? "Dark" : "Light"}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative group">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim
              group-focus-within:text-jw-accent transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search camera..."
              className="w-full pl-8.5 pr-3 py-2 bg-bg-input border border-border-default rounded-lg text-xs
                text-text-primary placeholder:text-text-dim
                focus:outline-none focus:ring-1 focus:ring-jw-accent/30 focus:border-jw-accent/30
                transition-all duration-200"
            />
          </div>
        </div>

        {/* Category filter — scrollable */}
        <div className="px-3 pb-2">
          <CategoryChips
            categories={categories}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
          />
        </div>

        {/* Camera list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-text-dim text-center py-8">No cameras found</p>
          ) : (
            filtered.map((cam, i) => (
              <CameraItem key={cam.id} cam={cam} selectedId={selectedId} onSelect={onSelect} index={i} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border-subtle">
          <div className="flex items-center gap-1.5 text-[10px] text-text-dim">
            <HiSignal className="w-3.5 h-3.5 text-jw-accent/60" />
            <span>Source: cctv.jogjakota.go.id</span>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════
       *  MOBILE BOTTOM SHEET
       * ═══════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 z-20 pointer-events-none">

        {/* Backdrop when expanded */}
        <AnimatePresence>
          {mobileExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-10 pointer-events-auto"
              onClick={() => setMobileExpanded(false)}
            />
          )}
        </AnimatePresence>

        {/* The sheet itself — uses translateY for GPU-accelerated animation */}
        <motion.div
          initial={false}
          animate={{ y: mobileExpanded ? 0 : "calc(100% - 215px)" }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="relative z-20 bg-bg-primary/98 backdrop-blur-xl border-t border-border-default
            rounded-t-2xl shadow-2xl shadow-black/30 flex flex-col will-change-transform pointer-events-auto"
          style={{ height: "70vh" }}
        >
          {/* ── Drag handle + header ── */}
          <button
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="w-full px-4 pt-2.5 pb-2 cursor-pointer flex flex-col items-center"
          >
            {/* Drag bar */}
            <div className="w-10 h-1 rounded-full bg-text-dim/30 mb-2" />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <HiSignal className="w-3.5 h-3.5 text-jw-accent" />
                <span className="text-[12px] font-bold text-text-primary">
                  {cameras.length} CCTV Active
                </span>
                <span className="text-[10px] text-text-dim">
                  • {filtered.length} shown
                </span>
              </div>
              <div className="p-1.5 rounded-lg text-text-dim">
                {mobileExpanded
                  ? <HiChevronDown className="w-4 h-4" />
                  : <HiChevronUp className="w-4 h-4" />
                }
              </div>
            </div>
          </button>

          {/* ── Minimized: horizontal scroll strip ── */}
          <div className={cn(
            "px-3 pb-3 transition-opacity duration-200",
            mobileExpanded ? "opacity-0 h-0 overflow-hidden pointer-events-none" : "opacity-100"
          )}>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {cameras.slice(0, 20).map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => onSelect(cam)}
                  className={cn(
                    "shrink-0 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer min-w-[160px] max-w-[200px]",
                    selectedId === cam.id
                      ? "bg-jw-accent/15 border border-jw-accent/30"
                      : "bg-bg-card border border-border-default hover:border-jw-accent/20"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-danger animate-pulse" />
                    <p className="text-xs font-semibold text-text-primary truncate">{cam.name}</p>
                  </div>
                  <p className="text-[10px] text-text-dim truncate">{cam.district || cam.categoryLabel}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Expanded: full search + filter + list ── */}
          <div className={cn(
            "flex-1 flex flex-col overflow-hidden transition-opacity duration-250",
            mobileExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {/* Search */}
            <div className="px-3 pb-2">
              <div className="relative group">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim
                  group-focus-within:text-jw-accent transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search camera..."
                  className="w-full pl-8.5 pr-3 py-2 bg-bg-input border border-border-default rounded-lg text-xs
                    text-text-primary placeholder:text-text-dim
                    focus:outline-none focus:ring-1 focus:ring-jw-accent/30 focus:border-jw-accent/30
                    transition-all duration-200"
                />
              </div>
            </div>

            {/* Category filter chips — scrollable */}
            <div className="px-3 pb-2">
              <CategoryChips
                categories={categories}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
              />
            </div>

            {/* Camera list — scrollable */}
            <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-text-dim text-center py-8">No cameras found</p>
              ) : (
                filtered.map((cam, i) => (
                  <CameraItem
                    key={cam.id}
                    cam={cam}
                    selectedId={selectedId}
                    onSelect={(c) => {
                      onSelect(c);
                      setMobileExpanded(false);
                    }}
                    index={i}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border-subtle">
              <div className="flex items-center gap-1.5 text-[10px] text-text-dim">
                <HiSignal className="w-3.5 h-3.5 text-jw-accent/60" />
                <span>Source: cctv.jogjakota.go.id</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
