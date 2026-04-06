"use client";

/**
 * Explore Page — search + discover with full filters.
 * Twitter/X-style trending sidebar with tag cloud.
 */

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, Hash, TrendingUp, X, Users, FileText as FileTextIcon } from "lucide-react";
import PostCard from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { clientFetch } from "@/lib/api";
import { POST_SORT_OPTIONS, DEPARTMENTS, POST_STATUS } from "@/lib/constants";
import { cn, buildQuery, formatCount, getRole } from "@/lib/utils";
import { FileText } from "lucide-react";
import { useAuthStore } from "@/lib/store";

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  const [tab, setTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "");
  const [department, setDepartment] = useState(searchParams.get("department") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [sort, setSort] = useState("most_upvoted");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    clientFetch("/api/analytics/trending-tags")
      .then((res) => setTrendingTags(res?.data?.trending_tags || []))
      .catch(() => {});
  }, []);

  const fetchPosts = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    try {
      const qs = buildQuery({
        search: searchQuery,
        tag: activeTag,
        department,
        status,
        sort,
        page: p,
        per_page: 15,
      });
      const res = await clientFetch(`/api/posts${qs}`);
      const newPosts = res?.data?.posts || [];
      setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
      setHasMore(newPosts.length >= 15);
    } catch {
      setHasMore(false);
    }
    setLoading(false);
  }, [searchQuery, activeTag, department, status, sort]);

  useEffect(() => {
    setPage(1);
    fetchPosts(1);
  }, [fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (tab === "users") {
      searchUsersQuery();
    } else {
      fetchPosts(1);
    }
  };

  const searchUsersQuery = useCallback(async () => {
    if (!searchQuery.trim()) { setUsers([]); return; }
    setUsersLoading(true);
    try {
      const res = await clientFetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      setUsers(res?.data || []);
    } catch {
      setUsers([]);
    }
    setUsersLoading(false);
  }, [searchQuery]);

  const handleTagClick = (tag) => {
    setActiveTag(activeTag === tag ? "" : tag);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTag("");
    setDepartment("");
    setStatus("");
    setSort("most_upvoted");
  };

  const hasActiveFilters = searchQuery || activeTag || department || status;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex gap-6">
        {/* Main */}
        <div className="flex-1 max-w-2xl">
          <h1 className="text-2xl font-bold mb-1">Explore</h1>
          <p className="text-sm text-muted mb-6">Discover reports, users, and community insights</p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface-hover rounded-xl mb-4">
            <button
              onClick={() => setTab("posts")}
              className={cn(
                "flex items-center gap-2 flex-1 justify-center py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                tab === "posts" ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
              )}
            >
              <FileTextIcon className="w-4 h-4" /> Reports
            </button>
            <button
              onClick={() => { setTab("users"); if (searchQuery.trim()) searchUsersQuery(); }}
              className={cn(
                "flex items-center gap-2 flex-1 justify-center py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                tab === "users" ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
              )}
            >
              <Users className="w-4 h-4" /> People
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tab === "users" ? "Search people by name or username…" : "Search reports by keyword, location, tag…"}
              className="w-full pl-12 pr-4 py-3.5 bg-surface border-2 border-surface-border rounded-2xl text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-jw-primary/30 focus:border-jw-primary/50 transition-all"
            />
          </form>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs bg-surface-hover border border-surface-border rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              {POST_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="text-xs bg-surface-hover border border-surface-border rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {Object.entries(DEPARTMENTS).map(([key, d]) => (
                <option key={key} value={key}>{d.label}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs bg-surface-hover border border-surface-border rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="">All Status</option>
              {Object.entries(POST_STATUS).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 px-2 cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Active tag filter */}
          {activeTag && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-jw-primary/5 rounded-xl">
              <Hash className="w-4 h-4 text-jw-primary" />
              <span className="text-sm font-medium text-jw-primary">#{activeTag}</span>
              <button
                onClick={() => setActiveTag("")}
                className="ml-auto text-jw-primary hover:text-jw-primary-dark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Users tab content */}
          {tab === "users" && (
            <div className="space-y-3">
              {usersLoading && (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-20 rounded-2xl bg-surface-hover animate-shimmer" />
                  ))}
                </div>
              )}
              {!usersLoading && users.length === 0 && searchQuery.trim() && (
                <EmptyState icon={Users} title="No users found" description="Try a different name or username" />
              )}
              {!usersLoading && users.length === 0 && !searchQuery.trim() && (
                <EmptyState icon={Users} title="Search for people" description="Type a name or username above to find community members" />
              )}
              {users.map((u) => {
                const isOwn = currentUser?.id === u.id;
                const href = isOwn ? `/profile/${u.username}` : `/profile/${u.username}`;
                const role = getRole(u.role);
                return (
                  <a
                    key={u.id}
                    href={href}
                    className="flex items-center gap-4 p-4 bg-surface border border-surface-border rounded-2xl hover:border-jw-primary/30 hover:bg-jw-primary/5 transition-all group"
                  >
                    <Avatar src={u.avatar_url} name={u.name} size="md" isGovernment={u.is_government} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm group-hover:text-jw-primary transition-colors">
                          {u.name}
                          {isOwn && <span className="ml-1 text-xs font-normal text-muted">(You)</span>}
                        </p>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", role.color)}>{role.label}</span>
                      </div>
                      <p className="text-xs text-muted">@{u.username}</p>
                      {u.bio && <p className="text-xs text-muted-light mt-0.5 truncate">{u.bio}</p>}
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Posts tab content */}
          {tab === "posts" && (
            <>
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {loading && (
                <div className="space-y-4 mt-4">
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </div>
              )}

              {!loading && posts.length === 0 && (
                <EmptyState
                  icon={FileText}
                  title="No results found"
                  description="Try adjusting your search or filters"
                />
              )}

              {hasMore && !loading && posts.length > 0 && (
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchPosts(next, true);
                  }}
                  className="w-full py-3 text-sm text-jw-primary font-medium hover:bg-jw-primary/5 rounded-xl transition-colors mt-4 cursor-pointer"
                >
                  Load more
                </button>
              )}
            </>
          )}
        </div>

        {/* Sidebar: trending tags */}
        <aside className="hidden lg:block w-80 shrink-0 sticky top-20 self-start">
          <div className="bg-surface border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-jw-primary" />
              <h3 className="font-semibold text-sm">Trending Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag.tag}
                  onClick={() => handleTagClick(tag.tag)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    activeTag === tag.tag
                      ? "bg-jw-primary text-white"
                      : "bg-surface-hover text-muted hover:text-foreground hover:bg-jw-primary/10"
                  )}
                >
                  #{tag.tag}
                  <span className="ml-1 opacity-60">{formatCount(tag.count)}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-6"><PostCardSkeleton /></div>}>
      <ExploreContent />
    </Suspense>
  );
}
