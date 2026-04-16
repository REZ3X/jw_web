"use client";

/**
 * Government Dashboard — department stats, post queue, and actions.
 * Only accessible by government-role users.
 *
 * Uses the unified feed-layout for consistency with HomeFeed & Explore.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HiChartBar, HiClock, HiCheckCircle, HiExclamationCircle,
  HiArrowUpRight, HiDocumentText, HiArrowTrendingUp, HiChatBubbleLeftRight,
  HiAdjustmentsHorizontal, HiXMark, HiInboxStack, HiCheck
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
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

/* ─── Status Filter Icons ─────────────────────────────────────── */
const STATUS_ICONS = {
  "": HiInboxStack,
  pending: HiClock,
  in_progress: HiArrowUpRight,
  closed: HiCheckCircle,
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
    { icon: HiDocumentText, label: "Total Laporan", value: formatCount(stats.total_posts || 0), color: "text-jw-accent", bg: "bg-jw-accent/10", border: "border-jw-accent/15" },
    { icon: HiClock, label: "Menunggu", value: formatCount(stats.pending_posts || 0), color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/15" },
    { icon: HiArrowUpRight, label: "Diproses", value: formatCount(stats.in_progress_posts || 0), color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/15" },
    { icon: HiCheckCircle, label: "Selesai", value: formatCount(stats.closed_posts || 0), color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/15" },
  ] : [];

  const StatusFilterButtons = () => (
    ["", "pending", "in_progress", "closed"].map((s) => {
      const Icon = STATUS_ICONS[s];
      const active = statusFilter === s;
      return (
        <button
          key={s}
          onClick={() => setStatusFilter(s)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer border",
            active
              ? "bg-jw-accent/12 text-jw-mint border-jw-accent/25"
              : "text-text-muted border-border-default hover:border-border-accent hover:text-text-secondary"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {s ? getStatus(s).label : "Semua"}
        </button>
      );
    })
  );

  return (
    <div className="feed-layout">
      {/* ═══ Feed column ═══ */}
      <div className="feed-column">

        {/* ─── Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1.5">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              dept.color?.replace("text-", "bg-").replace(/\/\d+/, "/12") || "bg-jw-accent/12"
            )}>
              <HiChartBar className={cn("w-5 h-5", dept.dotColor ? dept.dotColor.replace("bg-", "text-") : "text-jw-accent")} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-text-primary leading-tight">
                Dashboard {dept.label}
              </h1>
              <p className="text-xs text-text-muted truncate">{dept.description}</p>
            </div>
          </div>
        </motion.div>

        {/* ─── Stats cards ────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className={cn(
                  "rounded-xl p-4 bg-bg-card border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/10",
                  card.border
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", card.bg)}>
                    <card.icon className={cn("w-3.5 h-3.5", card.color)} />
                  </div>
                  <span className="text-[10px] text-text-dim font-bold uppercase tracking-widest leading-tight">
                    {card.label}
                  </span>
                </div>
                <p className={cn("text-2xl font-bold tracking-tight", card.color)}>{card.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ─── Stats loading skeleton ─────────────────── */}
        {!stats && loading && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[88px] rounded-xl animate-shimmer" />
            ))}
          </div>
        )}

        {/* ─── Filter bar ─────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <HiInboxStack className="w-4 h-4 text-jw-accent" />
            Antrean Laporan
          </h2>

          {/* Active status badge */}
          {statusFilter && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setStatusFilter("")}
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-jw-accent/10 text-jw-mint border border-jw-accent/20 cursor-pointer hover:bg-jw-accent/15 transition-colors"
            >
              {getStatus(statusFilter).label}
              <HiXMark className="w-3 h-3" />
            </motion.button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
          <StatusFilterButtons />
        </div>

        {/* ─── Posts queue ─────────────────────────────── */}
        {loadingPosts ? (
          <div className="space-y-3">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={HiDocumentText}
            title="Tidak ada laporan"
            description="Tidak ada laporan yang sesuai dengan filter yang dipilih"
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.28, delay: i < 6 ? i * 0.035 : 0 }}
                  className="relative"
                >
                  <PostCard post={post} />
                  {/* Quick status actions */}
                  {post.status !== "closed" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="flex gap-2 mt-2 px-1"
                    >
                      {post.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(post.id, "in_progress")}
                        >
                          <HiArrowUpRight className="w-3.5 h-3.5" /> Proses
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleStatusUpdate(post.id, "closed")}
                      >
                        <HiCheckCircle className="w-3.5 h-3.5" /> Selesaikan
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* End-of-queue sentinel */}
        {!loadingPosts && posts.length > 0 && (
          <p className="text-center text-xs text-text-dim py-10 select-none">
            — Semua laporan sudah ditampilkan —
          </p>
        )}
      </div>

      {/* ═══ Right Sidebar (xl+ only) — Department Summary ═══ */}
      <aside className="hidden xl:flex flex-col w-[300px] shrink-0 sticky top-5 self-start space-y-4">
        {/* Department info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
            <HiChartBar className="w-4 h-4 text-jw-accent" />
            <h3 className="text-sm font-bold text-text-primary">Ringkasan</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Dinas</span>
              <Badge className={dept.color}>{dept.label}</Badge>
            </div>
            {stats && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Tingkat Selesai</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {stats.total_posts > 0
                      ? `${Math.round(((stats.closed_posts || 0) / stats.total_posts) * 100)}%`
                      : "—"}
                  </span>
                </div>
                {/* Resolution progress bar */}
                <div className="w-full h-1.5 rounded-full bg-bg-inset overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: stats.total_posts > 0
                        ? `${Math.round(((stats.closed_posts || 0) / stats.total_posts) * 100)}%`
                        : "0%"
                    }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-jw-accent to-emerald-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Perlu Tindakan</span>
                  <span className="text-xs font-bold text-amber-400">
                    {formatCount((stats.pending_posts || 0) + (stats.in_progress_posts || 0))}
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Quick legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary">Status Laporan</h3>
          </div>
          <div className="p-4 space-y-2.5">
            {Object.entries(POST_STATUS).map(([key, s]) => (
              <div key={key} className="flex items-center gap-2.5">
                <span className={cn("w-2 h-2 rounded-full shrink-0", s.dotColor)} />
                <span className="text-xs text-text-secondary flex-1">{s.label}</span>
                {stats && (
                  <span className="text-xs font-semibold text-text-muted">
                    {formatCount(
                      key === "pending" ? stats.pending_posts || 0
                      : key === "in_progress" ? stats.in_progress_posts || 0
                      : stats.closed_posts || 0
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="px-1"
        >
          <p className="text-[10px] text-text-dim/60">
            © 2026 JogjaWaskita. Dashboard Pemerintah.
          </p>
        </motion.div>
      </aside>
    </div>
  );
}
