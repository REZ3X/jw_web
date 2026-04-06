"use client";

/**
 * HomeFeed — client-side interactive feed with infinite scroll,
 * create post modal, and trending sidebar.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Filter, ChevronDown } from "lucide-react";
import PostCard from "@/components/post/PostCard";
import PostForm from "@/components/post/PostForm";
import TrendingSidebar from "@/components/layout/TrendingSidebar";
import Modal from "@/components/ui/Modal";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { POST_SORT_OPTIONS, DEPARTMENTS } from "@/lib/constants";
import { cn, buildQuery } from "@/lib/utils";
import { FileText } from "lucide-react";

import toast from "react-hot-toast";

export default function HomeFeed({ initialPosts, isNewUser }) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState(initialPosts || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("recent");
  const [department, setDepartment] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef(null);

  const fetchPosts = useCallback(
    async (p = 1, append = false) => {
      setLoading(true);
      try {
        const qs = buildQuery({ sort, department, page: p, per_page: 15 });
        const res = await clientFetch(`/api/posts${qs}`);
        const newPosts = res?.data?.posts || [];
        setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
        setHasMore(newPosts.length >= 15);
      } catch {
        setHasMore(false);
      }
      setLoading(false);
    },
    [sort, department]
  );

  useEffect(() => {
    setPage(1);
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    if (isNewUser) {
      toast.success("Welcome to JogjaWaskita! Please check your inbox to verify your email.", {
        duration: 8000,
        position: "top-center"
      });
      // Clean up the URL
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

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex gap-6">
        {/* Main feed */}
        <div className="flex-1 max-w-2xl">
          {/* Feed header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Community Feed</h1>
              <p className="text-sm text-muted mt-0.5">Latest civic reports from the community</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                  showFilters
                    ? "bg-jw-primary/10 text-jw-primary"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>

          {/* Filters bar */}
          {showFilters && (
            <div className="bg-surface border border-surface-border rounded-2xl p-4 mb-4 animate-slide-down">
              <div className="flex flex-wrap gap-3">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-medium">Sort</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="text-sm bg-surface-hover border border-surface-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-jw-primary/30"
                  >
                    {POST_SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-medium">Department</span>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="text-sm bg-surface-hover border border-surface-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-jw-primary/30"
                  >
                    <option value="">All Departments</option>
                    {Object.entries(DEPARTMENTS).map(([key, d]) => (
                      <option key={key} value={key}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Posts */}
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Loading / Load more */}
          {loading && (
            <div className="space-y-4 mt-4">
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          )}

          {/* Empty state */}
          {!loading && posts.length === 0 && (
            <EmptyState
              icon={FileText}
              title="No reports yet"
              description="Be the first to report a community issue"
            />
          )}

          {/* Infinite scroll trigger */}
          <div ref={observerRef} className="h-10" />
        </div>

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block w-80 shrink-0 sticky top-20 self-start">
          <TrendingSidebar />
        </aside>
      </div>

      {user && !user.is_government && (
        <button
          onClick={() => {
            if (!user.email_verified) {
              toast.error("Please verify your email to create a report.");
              return;
            }
            setShowCreateModal(true);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-r from-jw-primary to-jw-secondary text-white shadow-xl shadow-jw-primary/30 flex items-center justify-center hover:shadow-jw-primary/50 hover:scale-105 active:scale-95 transition-all z-30 cursor-pointer"
          title="Create Report"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Create post modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Submit a Report"
        size="lg"
      >
        <div className="p-6">
          <PostForm
            onClose={() => setShowCreateModal(false)}
            onCreated={handlePostCreated}
          />
        </div>
      </Modal>
    </div>
  );
}
