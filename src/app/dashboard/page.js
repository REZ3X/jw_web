"use client";

/**
 * Government Dashboard — department stats, post queue, and actions.
 * Only accessible by government-role users.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3, Clock, CheckCircle, AlertCircle, ArrowUpRight,
  FileText, TrendingUp, MessageSquare,
} from "lucide-react";
import PostCard from "@/components/post/PostCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { getDepartment, getStatus, cn, formatCount, buildQuery } from "@/lib/utils";
import { GOV_ROLES, POST_STATUS } from "@/lib/constants";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!GOV_ROLES.includes(user.role) && user.role !== "dev") {
      router.push("/");
      return;
    }

    clientFetch("/api/departments/dashboard")
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    setLoadingPosts(true);
    const qs = buildQuery({ status: statusFilter, per_page: 20 });
    clientFetch(`/api/departments/posts${qs}`)
      .then((res) => setPosts(res?.data?.posts || []))
      .catch(() => {})
      .finally(() => setLoadingPosts(false));
  }, [user, statusFilter]);

  /** Update post status */
  const handleStatusUpdate = async (postId, newStatus) => {
    try {
      await clientFetch(`/api/departments/posts/${postId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p))
      );
      toast.success(`Status updated to ${getStatus(newStatus).label}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!user) return null;

  const dept = getDepartment(user.role);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn("w-3 h-3 rounded-full", dept.dotColor)} />
          <h1 className="text-2xl font-bold">{dept.label} Dashboard</h1>
        </div>
        <p className="text-sm text-muted">{dept.description}</p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted" />
              <span className="text-xs text-muted font-medium">Total Reports</span>
            </div>
            <p className="text-2xl font-bold">{formatCount(stats.total_posts || 0)}</p>
          </div>
          <div className="bg-surface border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">{formatCount(stats.pending_posts || 0)}</p>
          </div>
          <div className="bg-surface border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{formatCount(stats.in_progress_posts || 0)}</p>
          </div>
          <div className="bg-surface border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted font-medium">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-emerald-500">{formatCount(stats.closed_posts || 0)}</p>
          </div>
        </div>
      )}

      {/* Posts queue */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Report Queue</h2>
        <div className="flex gap-2">
          {["", "pending", "in_progress", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                statusFilter === s
                  ? "bg-jw-primary/10 text-jw-primary"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              )}
            >
              {s ? getStatus(s).label : "All"}
            </button>
          ))}
        </div>
      </div>

      {loadingPosts ? (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports"
          description="No reports matching the selected filter"
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} />
              {/* Quick status actions */}
              {post.status !== "closed" && (
                <div className="flex gap-2 mt-2 px-5">
                  {post.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(post.id, "in_progress")}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Mark In Progress
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusUpdate(post.id, "closed")}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
