"use client";

/**
 * HomeFeed — main community feed.
 *
 * X/Twitter-style layout:
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │ LeftSidebar (from layout) │   Feed Column    │  RightSidebar    │
 *  │         240px (lg+)       │  max-w-[600px]   │   300px (xl+)    │
 *  │  ─ Brand                  │  ─ Header bar    │  ─ Search        │
 *  │  ─ Nav links              │  ─ Create prompt │  ─ Trending      │
 *  │  ─ Tools                  │  ─ Post cards    │  ─ Active Users  │
 *  │  ─ Create CTA             │  ─ Infinite load │  ─ Footer        │
 *  │  ─ User card              │                  │                  │
 *  └──────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  HiPlus, HiDocumentText, HiPhoto,
  HiAdjustmentsHorizontal, HiXMark,
  HiClock, HiArrowTrendingUp, HiChatBubbleLeftRight,
  HiCheck
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import PostCard from "@/components/post/PostCard";
import RightSidebar from "@/components/layout/RightSidebar";
import Avatar from "@/components/ui/Avatar";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { DEPARTMENTS, POST_STATUS, POST_SORT_OPTIONS } from "@/lib/constants";
import { cn, buildQuery } from "@/lib/utils";
import toast from "react-hot-toast";

/* ─── Sort icons ──────────────────────────────────────────────── */
const SORT_ICONS = {
  recent: HiClock,
  most_upvoted: HiArrowTrendingUp,
  most_discussed: HiChatBubbleLeftRight,
};

/* ─── Feed Settings Panel ─────────────────────────────────────── */

function FeedSettings({
  open, onClose,
  sort, onSortChange,
  department, onDepartmentChange,
  status, onStatusChange,
  onReset,
}) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Small delay so the click that opened it doesn't immediately close it
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const hasFilters = sort !== "recent" || department || status;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
            onClick={onClose}
          />

          {/* ── Desktop: compact dropdown (lg+) ── */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="
              hidden lg:block
              absolute right-0 top-full mt-2
              w-[260px] z-50
              bg-bg-card rounded-xl
              border border-border-default
              shadow-xl shadow-black/25
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
              <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                <HiAdjustmentsHorizontal className="w-3.5 h-3.5 text-jw-accent" />
                Feed Settings
              </span>
              {hasFilters && (
                <button
                  onClick={onReset}
                  className="text-[10px] font-semibold text-danger hover:text-danger/80 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="p-3 space-y-3">
              {/* Sort */}
              <div>
                <p className="text-[9px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Sort by</p>
                <div className="space-y-0.5">
                  {POST_SORT_OPTIONS.map((opt) => {
                    const Icon = SORT_ICONS[opt.value] || HiClock;
                    const active = sort === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onSortChange(opt.value)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer",
                          active
                            ? "bg-jw-accent/12 text-jw-mint"
                            : "text-text-muted hover:text-text-primary hover:bg-bg-card-hover"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 text-left">{opt.label}</span>
                        {active && <HiCheck className="w-3.5 h-3.5 text-jw-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Department */}
              <div>
                <p className="text-[9px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Department</p>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => onDepartmentChange("")}
                    className={cn(
                      "px-2 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 cursor-pointer border",
                      !department
                        ? "bg-jw-accent/12 text-jw-mint border-jw-accent/25"
                        : "text-text-muted border-border-default hover:border-border-accent hover:text-text-secondary"
                    )}
                  >
                    All
                  </button>
                  {Object.entries(DEPARTMENTS).map(([key, d]) => (
                    <button
                      key={key}
                      onClick={() => onDepartmentChange(key)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 cursor-pointer border",
                        department === key
                          ? "bg-jw-accent/12 text-jw-mint border-jw-accent/25"
                          : "text-text-muted border-border-default hover:border-border-accent hover:text-text-secondary"
                      )}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-[9px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Status</p>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => onStatusChange("")}
                    className={cn(
                      "px-2 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 cursor-pointer border",
                      !status
                        ? "bg-jw-accent/12 text-jw-mint border-jw-accent/25"
                        : "text-text-muted border-border-default hover:border-border-accent hover:text-text-secondary"
                    )}
                  >
                    Any
                  </button>
                  {Object.entries(POST_STATUS).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => onStatusChange(key)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 cursor-pointer border",
                        status === key
                          ? "bg-jw-accent/12 text-jw-mint border-jw-accent/25"
                          : "text-text-muted border-border-default hover:border-border-accent hover:text-text-secondary"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dotColor)} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Mobile: bottom sheet (< lg) ── */}
          <motion.div
            ref={!panelRef.current ? panelRef : undefined}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className="
              lg:hidden fixed inset-x-0 bottom-0
              z-[61]
              bg-bg-card rounded-t-2xl
              border-t border-border-default
              shadow-2xl shadow-black/40
              max-h-[75vh] overflow-hidden flex flex-col
            "
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-border-default" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <HiAdjustmentsHorizontal className="w-4 h-4 text-jw-accent" />
                Feed Settings
              </h3>
              <div className="flex items-center gap-3">
                {hasFilters && (
                  <button
                    onClick={onReset}
                    className="text-[11px] font-semibold text-danger hover:text-danger/80 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-text-dim hover:text-text-primary hover:bg-bg-card-hover transition-all cursor-pointer"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Sort */}
              <div>
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2">Sort by</p>
                <div className="space-y-0.5">
                  {POST_SORT_OPTIONS.map((opt) => {
                    const Icon = SORT_ICONS[opt.value] || HiClock;
                    const active = sort === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onSortChange(opt.value)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
                          active
                            ? "bg-jw-accent/12 text-jw-mint"
                            : "text-text-muted hover:text-text-primary hover:bg-bg-card-hover"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1 text-left">{opt.label}</span>
                        {active && <HiCheck className="w-4 h-4 text-jw-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Department */}
              <div>
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2">Department</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onDepartmentChange("")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border",
                      !department
                        ? "bg-jw-accent/12 text-jw-mint border-jw-accent/25"
                        : "text-text-muted border-border-default hover:border-border-accent hover:text-text-secondary"
                    )}
                  >
                    All
                  </button>
                  {Object.entries(DEPARTMENTS).map(([key, d]) => (
                    <button
                      key={key}
                      onClick={() => onDepartmentChange(key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border",
                        department === key
                          ? "bg-jw-accent/12 text-jw-mint border-jw-accent/25"
                          : "text-text-muted border-border-default hover:border-border-accent hover:text-text-secondary"
                      )}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onStatusChange("")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border",
                      !status
                        ? "bg-jw-accent/12 text-jw-mint border-jw-accent/25"
                        : "text-text-muted border-border-default hover:border-border-accent hover:text-text-secondary"
                    )}
                  >
                    Any
                  </button>
                  {Object.entries(POST_STATUS).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => onStatusChange(key)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border",
                        status === key
                          ? "bg-jw-accent/12 text-jw-mint border-jw-accent/25"
                          : "text-text-muted border-border-default hover:border-border-accent hover:text-text-secondary"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dotColor)} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply button */}
            <div className="border-t border-border-subtle p-3">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl gradient-btn text-sm font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── HomeFeed ────────────────────────────────────────────────── */

export default function HomeFeed({ initialPosts, isNewUser }) {
  const { user, loaded } = useAuthStore();
  const [posts, setPosts] = useState(initialPosts || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("recent");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const observerRef = useRef(null);

  const activeFilterCount = [
    sort !== "recent" ? 1 : 0,
    department ? 1 : 0,
    status ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Listen for "jw:post-created" from the global CreateReportModal
  useEffect(() => {
    const handler = (e) => {
      const newPost = e.detail;
      if (newPost) setPosts((prev) => [newPost, ...prev]);
    };
    window.addEventListener("jw:post-created", handler);
    return () => window.removeEventListener("jw:post-created", handler);
  }, []);

  const fetchPosts = useCallback(
    async (p = 1, append = false) => {
      setLoading(true);
      try {
        const qs = buildQuery({ sort, department, status, page: p, per_page: 15 });
        const res = await clientFetch(`/api/posts${qs}`);
        const newPosts = res?.data?.posts || [];
        setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
        setHasMore(newPosts.length >= 15);
      } catch {
        setHasMore(false);
      }
      setLoading(false);
    },
    [sort, department, status]
  );

  useEffect(() => { setPage(1); fetchPosts(1); }, [fetchPosts]);

  useEffect(() => {
    if (isNewUser) {
      toast.success("Welcome to JogjaWaskita! Check your inbox to verify your email.", {
        duration: 8000, position: "top-center",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isNewUser]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchPosts(next, true);
        }
      },
      { threshold: 0.5 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchPosts]);

  const openCreateModal = () => {
    window.dispatchEvent(new CustomEvent("jw:open-create-post"));
  };

  const resetFilters = () => {
    setSort("recent");
    setDepartment("");
    setStatus("");
  };

  // Current sort label for header display
  const currentSortLabel = POST_SORT_OPTIONS.find((o) => o.value === sort)?.label || "Most Recent";
  const currentDeptLabel = department ? DEPARTMENTS[department]?.short : null;
  const currentStatusLabel = status ? POST_STATUS[status]?.label : null;

  return (
    <div className="feed-layout">
      {/* ═══ Feed column ═══ */}
      <div className="feed-column">

        {/* ─── Feed header ─────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 relative">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base font-bold text-text-primary">Home</h1>
            {/* Active filter badges */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {sort !== "recent" && (
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-jw-accent/10 text-jw-mint border border-jw-accent/20">
                    {currentSortLabel}
                  </span>
                )}
                {currentDeptLabel && (
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-jw-accent/10 text-jw-mint border border-jw-accent/20">
                    {currentDeptLabel}
                  </span>
                )}
                {currentStatusLabel && (
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-jw-accent/10 text-jw-mint border border-jw-accent/20">
                    {currentStatusLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Settings toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "relative p-2 rounded-xl transition-all duration-200 cursor-pointer shrink-0",
              showSettings
                ? "bg-jw-accent/15 text-jw-mint"
                : "text-text-muted hover:text-text-primary hover:bg-bg-card-hover"
            )}
            title="Feed settings"
          >
            <HiAdjustmentsHorizontal className="w-5 h-5" />
            {/* Filter count badge */}
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-jw-accent text-[9px] font-bold text-white flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Settings panel (popover on desktop, sheet on mobile) */}
          <FeedSettings
            open={showSettings}
            onClose={() => setShowSettings(false)}
            sort={sort}
            onSortChange={setSort}
            department={department}
            onDepartmentChange={setDepartment}
            status={status}
            onStatusChange={setStatus}
            onReset={resetFilters}
          />
        </div>

        {/* ─── Create-post prompt ────────────────────── */}
        {loaded && user && !user.is_government && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <button
              onClick={openCreateModal}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                bg-bg-card border border-border-default
                hover:border-jw-accent/40 hover:bg-bg-card-hover
                transition-all duration-200 cursor-pointer group"
            >
              <Avatar src={user.avatar_url} name={user.name} size="sm" />
              <span className="flex-1 text-left text-sm text-text-muted group-hover:text-text-secondary transition-colors">
                What&apos;s happening in your community?
              </span>
              <HiPhoto className="w-5 h-5 text-text-dim group-hover:text-jw-accent transition-colors" />
            </button>
          </motion.div>
        )}

        {/* ─── Posts ─────────────────────────────────── */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, delay: i < 6 ? i * 0.035 : 0 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3 mt-3">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <EmptyState
            icon={HiDocumentText}
            title="No reports yet"
            description="Be the first to report a community issue"
          />
        )}

        {/* End of feed */}
        {!loading && !hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-text-dim py-10 select-none">
            — You&apos;ve seen it all —
          </p>
        )}

        <div ref={observerRef} className="h-10" />
      </div>

      {/* ═══ Right Sidebar (xl+ only) ═══ */}
      <RightSidebar />

      {/* ─── Mobile FAB ────────────────────────────── */}
      {loaded && user && !user.is_government && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={openCreateModal}
          className="fixed bottom-6 right-6 z-30 xl:hidden
            w-14 h-14 rounded-2xl gradient-btn
            shadow-lg shadow-jw-accent/20
            flex items-center justify-center cursor-pointer
            animate-glow-pulse"
          title="Create Report"
        >
          <HiPlus className="w-6 h-6 text-white" />
        </motion.button>
      )}


    </div>
  );
}
