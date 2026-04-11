"use client";

/**
 * Explore Page — search & discover reports and people.
 *
 * Twitter/X-style layout:
 *  ┌────────────────────────────────────────────────────────────────┐
 *  │ LeftSidebar (layout) │   Explore Column   │  TrendingSidebar  │
 *  │      240px (lg+)     │   max-w-[600px]    │   300px (xl+)     │
 *  │                      │  ─ Search bar      │  ─ Trending list  │
 *  │                      │  ─ Tabs            │  ─ Footer links   │
 *  │                      │  ─ Trending Hero   │                   │
 *  │                      │  ─ Posts feed      │                   │
 *  └────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  HiMagnifyingGlass, HiHashtag,
  HiXMark, HiUsers, HiDocumentText,
  HiArrowTrendingUp, HiChevronRight, HiFire
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import PostCard from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import TrendingSidebar from "@/components/layout/TrendingSidebar";
import { clientFetch } from "@/lib/api";
import { cn, buildQuery, formatCount, getRole } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

/* ─── Trending Hero Section ─────────────────────────────────────── */

function TrendingHero({ tags, loading, onTagClick }) {
  if (loading) {
    return (
      <div className="rounded-xl bg-bg-card border border-border-default overflow-hidden mb-4 animate-shimmer h-[260px]" />
    );
  }

  if (tags.length === 0) return null;

  const top5 = tags.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl bg-bg-card border border-border-default overflow-hidden mb-4"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
        <HiArrowTrendingUp className="w-4 h-4 text-jw-accent" />
        <h2 className="text-sm font-bold text-text-primary">Trending in JogjaWaskita</h2>
      </div>

      {/* Tag list */}
      <div className="divide-y divide-border-subtle">
        {top5.map((tag, idx) => (
          <motion.button
            key={tag.tag}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => onTagClick(tag.tag)}
            className="w-full flex items-start justify-between px-4 py-3
              hover:bg-bg-card-hover transition-all duration-200 cursor-pointer group text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-text-dim font-medium uppercase tracking-widest mb-0.5">
                {idx + 1} · Trending
              </p>
              <p className="text-[15px] font-bold text-text-primary group-hover:text-jw-mint transition-colors">
                <HiHashtag className="w-3.5 h-3.5 text-jw-accent inline mr-0.5 -mt-0.5" />
                {tag.tag}
              </p>
              <p className="text-[11px] text-text-dim mt-0.5">
                {formatCount(tag.count)} {tag.count === 1 ? "post" : "posts"}
              </p>
            </div>
            <HiChevronRight className="w-4 h-4 text-text-dim group-hover:text-text-muted mt-3 shrink-0 transition-colors" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Section Divider ───────────────────────────────────────────── */

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      {Icon && <Icon className="w-4 h-4 text-jw-accent" />}
      <h3 className="text-sm font-bold text-text-primary">{children}</h3>
      <div className="flex-1 h-px bg-border-subtle" />
    </div>
  );
}

/* ─── Main Explore Content ──────────────────────────────────────── */

function ExploreContent() {
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuthStore();

  const [tab, setTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "");
  const [sort] = useState("most_upvoted");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    clientFetch("/api/analytics/trending-tags")
      .then((res) => setTrendingTags(res?.data?.trending_tags || []))
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, []);

  const fetchPosts = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    try {
      const qs = buildQuery({
        search: searchQuery, tag: activeTag,
        sort, page: p, per_page: 15,
      });
      const res = await clientFetch(`/api/posts${qs}`);
      const newPosts = res?.data?.posts || [];
      setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
      setHasMore(newPosts.length >= 15);
    } catch { setHasMore(false); }
    setLoading(false);
  }, [searchQuery, activeTag, sort]);

  useEffect(() => { setPage(1); fetchPosts(1); }, [fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (tab === "users") searchUsersQuery();
    else fetchPosts(1);
  };

  const searchUsersQuery = useCallback(async () => {
    if (!searchQuery.trim()) { setUsers([]); return; }
    setUsersLoading(true);
    try {
      const res = await clientFetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      setUsers(res?.data || []);
    } catch { setUsers([]); }
    setUsersLoading(false);
  }, [searchQuery]);

  const handleTagClick = (tag) => {
    setActiveTag(activeTag === tag ? "" : tag);
  };

  const clearTag = () => {
    setActiveTag("");
  };

  return (
    <div className="feed-layout">
      {/* ═══ Main column ═══ */}
      <div className="feed-column">

        {/* ─── Search bar ──────────────────────────── */}
        <form onSubmit={handleSearch} className="relative mb-4 group">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim group-focus-within:text-jw-accent transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tab === "users" ? "Search by name or username…" : "Search reports, tags, locations…"}
            className="w-full pl-12 pr-10 py-3 bg-bg-card border border-border-default rounded-xl text-sm
              text-text-primary placeholder:text-text-dim
              focus:outline-none focus:ring-2 focus:ring-jw-accent/30 focus:border-jw-accent/40
              transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-text-dim hover:text-text-primary transition-colors cursor-pointer"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* ─── Tabs: Reports / People ───────────────── */}
        <div className="flex items-center bg-bg-card rounded-xl border border-border-default overflow-hidden mb-4">
          <button
            onClick={() => setTab("posts")}
            className={cn(
              "flex items-center justify-center gap-1.5 flex-1 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer relative",
              tab === "posts"
                ? "text-jw-mint"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-card-hover"
            )}
          >
            <HiDocumentText className="w-4 h-4" /> Reports
            {tab === "posts" && (
              <motion.div
                layoutId="explore-tab-underline"
                className="absolute bottom-0 left-[15%] right-[15%] h-[3px] rounded-full bg-jw-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => { setTab("users"); if (searchQuery.trim()) searchUsersQuery(); }}
            className={cn(
              "flex items-center justify-center gap-1.5 flex-1 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer relative",
              tab === "users"
                ? "text-jw-mint"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-card-hover"
            )}
          >
            <HiUsers className="w-4 h-4" /> People
            {tab === "users" && (
              <motion.div
                layoutId="explore-tab-underline"
                className="absolute bottom-0 left-[15%] right-[15%] h-[3px] rounded-full bg-jw-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* ─── Active tag banner ─────────────────────── */}
        <AnimatePresence>
          {activeTag && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-jw-accent/8 rounded-xl border border-jw-accent/15">
                <HiHashtag className="w-4 h-4 text-jw-accent shrink-0" />
                <span className="text-sm font-bold text-jw-mint flex-1">#{activeTag}</span>
                <button
                  onClick={clearTag}
                  className="p-1 rounded-lg text-text-dim hover:text-text-primary hover:bg-bg-card-hover transition-all cursor-pointer"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════ */}
        {/* ─── People tab ──────────────────────────────── */}
        {tab === "users" && (
          <div className="space-y-2">
            {usersLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[72px] rounded-xl animate-shimmer" />
                ))}
              </div>
            )}

            {!usersLoading && users.length === 0 && searchQuery.trim() && (
              <EmptyState icon={HiUsers} title="No users found" description="Try a different name or username" />
            )}
            {!usersLoading && users.length === 0 && !searchQuery.trim() && (
              <EmptyState icon={HiUsers} title="Search for people" description="Type a name or username above" />
            )}

            {users.map((u) => {
              const isOwn = currentUser?.id === u.id;
              const role = getRole(u.role);
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Link
                    href={`/profile/${u.username}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl
                      bg-bg-card border border-border-default
                      hover:bg-bg-card-hover hover:border-border-accent/50
                      transition-all duration-200 group"
                  >
                    <Avatar src={u.avatar_url} name={u.name} size="md" isGovernment={u.is_government} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-text-primary group-hover:text-jw-mint transition-colors truncate">
                          {u.name}
                          {isOwn && <span className="text-xs font-normal text-text-dim ml-1">(you)</span>}
                        </p>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0", role.color)}>
                          {role.label}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted truncate">@{u.username}</p>
                      {u.bio && <p className="text-xs text-text-dim mt-0.5 truncate">{u.bio}</p>}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ─── Reports tab ──────────────────────────────── */}
        {tab === "posts" && (
          <>
            {/* Trending Hero — prominent trending tags section */}
            {!activeTag && !searchQuery && (
              <TrendingHero
                tags={trendingTags}
                loading={trendingLoading}
                onTagClick={handleTagClick}
              />
            )}

            {/* Posts section label */}
            <SectionLabel icon={HiFire}>
              {activeTag ? `Posts tagged #${activeTag}` : searchQuery ? "Search results" : "Top Posts"}
            </SectionLabel>

            {/* Post cards */}
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

            {loading && (
              <div className="space-y-3 mt-3">
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            )}

            {!loading && posts.length === 0 && (
              <EmptyState
                icon={HiDocumentText}
                title="No results"
                description={activeTag ? `No posts found with tag #${activeTag}` : "Try adjusting your search"}
              />
            )}

            {/* Load more */}
            {hasMore && !loading && posts.length > 0 && (
              <button
                onClick={() => { const n = page + 1; setPage(n); fetchPosts(n, true); }}
                className="w-full py-3 mt-4 text-sm text-jw-accent font-semibold hover:bg-jw-accent/5 rounded-xl transition-all duration-200 cursor-pointer"
              >
                Load more
              </button>
            )}

            {!loading && !hasMore && posts.length > 0 && (
              <p className="text-center text-xs text-text-dim py-10 select-none">
                — End of results —
              </p>
            )}
          </>
        )}
      </div>

      {/* ═══ Right Sidebar (xl+ only) — Trending ═══ */}
      <aside className="hidden xl:flex flex-col w-[300px] shrink-0 sticky top-[72px] self-start space-y-4 lg:top-5">
        <TrendingSidebar />

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="px-1"
        >
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-dim">
            <Link href="/" className="hover:text-text-muted transition-colors">Home</Link>
            <Link href="/chat" className="hover:text-text-muted transition-colors">AI Chat</Link>
          </div>
          <p className="text-[10px] text-text-dim/60 mt-2">
            © 2026 JogjaWaskita. All rights reserved.
          </p>
        </motion.div>
      </aside>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="feed-layout">
        <div className="feed-column space-y-3">
          <div className="h-12 rounded-xl animate-shimmer" />
          <div className="h-10 rounded-xl animate-shimmer" />
          <div className="h-[260px] rounded-xl animate-shimmer" />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
