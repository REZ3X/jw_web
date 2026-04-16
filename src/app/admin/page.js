"use client";

/**
 * Dev Admin Page — user management + platform overview.
 * Only accessible by users with the `dev` role.
 *
 * Uses the unified feed-layout for consistency with HomeFeed & Explore.
 * Mobile-friendly: card-based user list on small screens, table on lg+.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiUsers, HiChartBar, HiShieldCheck, HiDocumentText,
  HiMagnifyingGlass, HiChevronRight, HiArrowTrendingUp,
  HiXMark, HiCog6Tooth, HiServerStack
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { getRole, cn, formatCount, buildQuery, formatDate } from "@/lib/utils";
import { ALL_ROLES } from "@/lib/constants";
import toast from "react-hot-toast";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  })
};

/* ─── User Card (Mobile) ──────────────────────────────────────── */

function UserCardMobile({ u, onRoleChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl bg-bg-card border border-border-default p-4 hover:border-border-accent/40 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <Link href={`/profile/${u.username}`}>
          <Avatar src={u.avatar_url} name={u.name} size="md" isGovernment={u.is_government} className="cursor-pointer" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/profile/${u.username}`}
              className="text-sm font-semibold text-text-primary hover:text-jw-mint transition-colors truncate"
            >
              {u.name}
            </Link>
            <Badge className={getRole(u.role).color}>{getRole(u.role).label}</Badge>
          </div>
          <p className="text-xs text-text-dim truncate">@{u.username}</p>
          <p className="text-[11px] text-text-dim mt-0.5">{u.email}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-3">
          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1",
            u.email_verified ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", u.email_verified ? "bg-emerald-400" : "bg-amber-400")} />
            {u.email_verified ? "Terverifikasi" : "Belum"}
          </span>
          <span className="text-[10px] text-text-dim">{formatDate(u.created_at)}</span>
        </div>
        <select
          value={u.role}
          onChange={(e) => onRoleChange(u.id, e.target.value)}
          className="text-[11px] bg-bg-inset border border-border-default rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-jw-accent/30 cursor-pointer text-text-secondary font-semibold"
        >
          {ALL_ROLES.map((r) => (
            <option key={r} value={r} className="bg-bg-card">{getRole(r).label}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}

/* ─── User Row (Desktop table) ────────────────────────────────── */

function UserTableRow({ u, onRoleChange, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index < 10 ? index * 0.03 : 0 }}
      className="hover:bg-bg-card-hover/40 transition-colors group"
    >
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${u.username}`}>
            <Avatar src={u.avatar_url} name={u.name} size="sm" isGovernment={u.is_government} className="cursor-pointer" />
          </Link>
          <div className="min-w-0">
            <Link
              href={`/profile/${u.username}`}
              className="text-sm font-medium text-text-primary hover:text-jw-mint transition-colors truncate block"
            >
              {u.name}
            </Link>
            <p className="text-[11px] text-text-dim">@{u.username}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3 text-xs text-text-muted">{u.email}</td>
      <td className="px-5 py-3">
        <Badge className={getRole(u.role).color}>{getRole(u.role).label}</Badge>
      </td>
      <td className="px-5 py-3">
        <span className={cn(
          "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded",
          u.email_verified ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", u.email_verified ? "bg-emerald-400" : "bg-amber-400")} />
          {u.email_verified ? "Ya" : "Tidak"}
        </span>
      </td>
      <td className="px-5 py-3 text-xs text-text-dim whitespace-nowrap">{formatDate(u.created_at)}</td>
      <td className="px-5 py-3">
        <select
          value={u.role}
          onChange={(e) => onRoleChange(u.id, e.target.value)}
          className="text-xs bg-bg-inset border border-border-default rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-jw-accent/30 cursor-pointer text-text-secondary font-medium opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        >
          {ALL_ROLES.map((r) => (
            <option key={r} value={r} className="bg-bg-card">{getRole(r).label}</option>
          ))}
        </select>
      </td>
    </motion.tr>
  );
}

/* ─── Main Admin Page ─────────────────────────────────────────── */

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [overview, setOverview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "dev") {
      router.push("/");
      return;
    }


    clientFetch("/api/dev/analytics/overview")
      .then((res) => setOverview(res.data))
      .catch(() => {});

    fetchUsers();
  }, [user, router]);

  const fetchUsers = async (search, role) => {
    setLoading(true);
    try {
      const qs = buildQuery({
        search: search || searchQuery,
        role: role !== undefined ? role : roleFilter,
        per_page: 50,
      });
      const res = await clientFetch(`/api/dev/users${qs}`);
      setUsers(res.data || []);
    } catch {}
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await clientFetch(`/api/dev/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`Role updated to ${getRole(newRole).label}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!user || user.role !== "dev") return null;

  const statCards = overview ? [
    { icon: HiUsers, label: "Total Pengguna", value: formatCount(overview.platform?.total_users || 0), color: "text-jw-accent", bg: "bg-jw-accent/10", border: "border-jw-accent/15" },
    { icon: HiDocumentText, label: "Total Laporan", value: formatCount(overview.platform?.total_posts || 0), color: "text-jw-mint", bg: "bg-jw-mint/10", border: "border-jw-mint/15" },
    { icon: HiChartBar, label: "Selesai", value: formatCount(overview.platform?.closed_posts || 0), color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/15" },
    { icon: HiArrowTrendingUp, label: "Menunggu", value: formatCount(overview.platform?.pending_posts || 0), color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/15" },
  ] : [];

  return (
    <div className="feed-layout">
      {/* ═══ Feed column ═══ */}
      <div className="feed-column">

        {/* ─── Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/12 flex items-center justify-center shrink-0">
              <HiShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">Admin Panel</h1>
              <p className="text-xs text-text-muted">Kelola pengguna, analitik, dan log sistem</p>
            </div>
          </div>
          <Link
            href="/admin/logs"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl
              bg-bg-card border border-border-default
              text-xs font-semibold text-text-secondary
              hover:bg-bg-card-hover hover:border-jw-accent/30 hover:text-jw-mint
              transition-all duration-200 group"
          >
            <HiServerStack className="w-3.5 h-3.5 group-hover:text-jw-accent transition-colors" />
            <span className="hidden sm:inline">Logs</span>
            <HiChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* ─── Stats cards ────────────────────────────── */}
        {overview && (
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

        {/* Stats loading skeleton */}
        {!overview && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[88px] rounded-xl animate-shimmer" />
            ))}
          </div>
        )}

        {/* ─── User Management Section ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Section header with search and filter */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <HiUsers className="w-4 h-4 text-jw-accent" />
              Manajemen Pengguna
              {!loading && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-bg-elevated text-text-dim">
                  {users.length}
                </span>
              )}
            </h2>
          </div>

          {/* Search + filter bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1 group">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-jw-accent transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchUsers(e.target.value, roleFilter);
                }}
                placeholder="Cari pengguna…"
                className="w-full pl-9 pr-3 py-2.5 bg-bg-card border border-border-default rounded-xl text-sm
                  text-text-primary placeholder:text-text-dim
                  focus:outline-none focus:ring-2 focus:ring-jw-accent/30 focus:border-jw-accent/40
                  transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); fetchUsers("", roleFilter); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                >
                  <HiXMark className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                fetchUsers(searchQuery, e.target.value);
              }}
              className="text-xs bg-bg-card border border-border-default rounded-xl px-3 py-2.5
                focus:outline-none focus:ring-2 focus:ring-jw-accent/30
                cursor-pointer text-text-secondary font-semibold"
            >
              <option value="" className="bg-bg-card">Semua Role</option>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r} className="bg-bg-card">{getRole(r).label}</option>
              ))}
            </select>
          </div>

          {/* ─── Mobile: Card-based list (< lg) ──────── */}
          <div className="lg:hidden space-y-2">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-[120px] rounded-xl animate-shimmer" />
              ))
            ) : users.length === 0 ? (
              <EmptyState
                icon={HiUsers}
                title="Pengguna tidak ditemukan"
                description="Coba ubah filter atau kata kunci pencarian"
              />
            ) : (
              <AnimatePresence mode="popLayout">
                {users.map((u) => (
                  <UserCardMobile key={u.id} u={u} onRoleChange={handleRoleChange} />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* ─── Desktop: Table (lg+) ────────────────── */}
          <div className="hidden lg:block rounded-xl bg-bg-card border border-border-default overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-text-dim font-bold border-b border-border-subtle uppercase tracking-widest">
                    <th className="text-left px-5 py-3">Pengguna</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Role</th>
                    <th className="text-left px-5 py-3">Verifikasi</th>
                    <th className="text-left px-5 py-3">Gabung</th>
                    <th className="text-left px-5 py-3">Ubah Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-text-muted">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-jw-accent/30 border-t-jw-accent animate-spin" />
                          Loading…
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-text-muted">
                        Pengguna tidak ditemukan
                      </td>
                    </tr>
                  ) : (
                    users.map((u, i) => (
                      <UserTableRow key={u.id} u={u} onRoleChange={handleRoleChange} index={i} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ Right Sidebar (xl+ only) — Platform Stats ═══ */}
      <aside className="hidden xl:flex flex-col w-[300px] shrink-0 sticky top-5 self-start space-y-4">
        {/* Platform overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
            <HiChartBar className="w-4 h-4 text-jw-accent" />
            <h3 className="text-sm font-bold text-text-primary">Platform</h3>
          </div>
          <div className="p-4 space-y-3">
            {overview ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Total Pengguna</span>
                  <span className="text-xs font-bold text-jw-accent">
                    {formatCount(overview.platform?.total_users || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Total Laporan</span>
                  <span className="text-xs font-bold text-jw-mint">
                    {formatCount(overview.platform?.total_posts || 0)}
                  </span>
                </div>
                <div className="h-px bg-border-subtle" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Tingkat Selesai</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {overview.platform?.total_posts > 0
                      ? `${Math.round(((overview.platform?.closed_posts || 0) / overview.platform.total_posts) * 100)}%`
                      : "—"}
                  </span>
                </div>
                {/* Resolution progress bar */}
                <div className="w-full h-1.5 rounded-full bg-bg-inset overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: overview.platform?.total_posts > 0
                        ? `${Math.round(((overview.platform?.closed_posts || 0) / overview.platform.total_posts) * 100)}%`
                        : "0%"
                    }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-jw-accent to-emerald-400"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 rounded animate-shimmer" />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary">Akses Cepat</h3>
          </div>
          <div className="divide-y divide-border-subtle">
            <Link
              href="/admin/logs"
              className="flex items-center gap-3 px-4 py-3 hover:bg-bg-card-hover transition-colors group"
            >
              <HiServerStack className="w-4 h-4 text-text-dim group-hover:text-jw-accent transition-colors" />
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors flex-1">
                System Logs
              </span>
              <HiChevronRight className="w-3.5 h-3.5 text-text-dim" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 hover:bg-bg-card-hover transition-colors group"
            >
              <HiCog6Tooth className="w-4 h-4 text-text-dim group-hover:text-jw-accent transition-colors" />
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors flex-1">
                Gov Dashboard
              </span>
              <HiChevronRight className="w-3.5 h-3.5 text-text-dim" />
            </Link>
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
            © 2026 JogjaWaskita. Admin Panel.
          </p>
        </motion.div>
      </aside>
    </div>
  );
}
