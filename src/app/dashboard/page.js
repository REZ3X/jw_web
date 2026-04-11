"use client";

/**
 * Government Dashboard — department stats, post queue, and actions.
 * Only accessible by government-role users.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HiChartBar, HiClock, HiCheckCircle, HiExclamationCircle,
  HiArrowUpRight, HiDocumentText, HiArrowTrendingUp, HiChatBubbleLeftRight
} from "react-icons/hi2";
import { motion } from "framer-motion";
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  })
};

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

  const statCards = stats ? [
    { icon: HiDocumentText, label: "Total Reports", value: formatCount(stats.total_posts || 0), color: "text-jw-accent" },
    { icon: HiClock, label: "Pending", value: formatCount(stats.pending_posts || 0), color: "text-amber-400" },
    { icon: HiArrowUpRight, label: "In Progress", value: formatCount(stats.in_progress_posts || 0), color: "text-blue-400" },
    { icon: HiCheckCircle, label: "Resolved", value: formatCount(stats.closed_posts || 0), color: "text-emerald-400" },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className={cn("w-3 h-3 rounded-full", dept.dotColor)} />
          <h1 className="text-2xl font-bold gradient-text">{dept.label} Dashboard</h1>
        </div>
        <p className="text-sm text-muted">{dept.description}</p>
      </motion.div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={cn("w-4 h-4", card.color)} />
                <span className="text-xs text-muted font-semibold uppercase tracking-wider">{card.label}</span>
              </div>
              <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Posts queue */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-bold text-foreground">Report Queue</h2>
        <div className="flex gap-2">
          {["", "pending", "in_progress", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer",
                statusFilter === s
                  ? "bg-jw-accent/15 text-jw-highlight border border-jw-accent/20"
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
          icon={HiDocumentText}
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
                      <HiArrowUpRight className="w-3.5 h-3.5" /> Mark In Progress
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusUpdate(post.id, "closed")}
                  >
                    <HiCheckCircle className="w-3.5 h-3.5" /> Resolve
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
