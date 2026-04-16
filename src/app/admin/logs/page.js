"use client";

/**
 * Logs Viewer — auth and activity logs with filters (dev only).
 *
 * Uses the unified feed-layout for consistency.
 * Mobile-friendly: card-based log entries on small screens, table on lg+.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HiArrowLeft, HiShieldCheck, HiChartBar,
  HiMagnifyingGlass, HiArrowPath, HiServerStack,
  HiClock, HiGlobeAlt, HiCheckCircle, HiXCircle,
  HiUser, HiFingerPrint
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { cn, formatDateTime, buildQuery } from "@/lib/utils";
import toast from "react-hot-toast";

/* ─── Log Card (Mobile) ───────────────────────────────────────── */

function LogCardMobile({ log, tab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl bg-bg-card border border-border-default p-4 space-y-2"
    >
      {/* Top: Time + Status */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-dim font-medium flex items-center gap-1">
          <HiClock className="w-3 h-3" />
          {formatDateTime(log.created_at)}
        </span>
        {tab === "auth" && (
          <span className={cn(
            "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded",
            log.success ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
          )}>
            {log.success
              ? <><HiCheckCircle className="w-3 h-3" /> Sukses</>
              : <><HiXCircle className="w-3 h-3" /> Gagal</>
            }
          </span>
        )}
      </div>

      {/* Action badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className="bg-jw-accent/10 text-jw-accent border border-jw-accent/20">{log.action}</Badge>
        {tab === "activity" && log.feature && (
          <Badge className="bg-bg-elevated text-text-secondary">{log.feature}</Badge>
        )}
      </div>

      {/* Details */}
      <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
        <span className="text-[10px] text-text-dim flex items-center gap-1">
          <HiUser className="w-3 h-3" />
          {log.user_id?.slice(0, 8)}…
        </span>
        {tab === "activity" && log.entity_type && (
          <span className="text-[10px] text-text-dim">{log.entity_type}</span>
        )}
        <span className="text-[10px] text-text-dim flex items-center gap-1">
          <HiGlobeAlt className="w-3 h-3" />
          {log.ip_address || "—"}
        </span>
      </div>
    </motion.div>
  );
}

export default function LogsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState("auth");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [featureFilter, setFeatureFilter] = useState("");

  useEffect(() => {
    if (!user || user.role !== "dev") {
      router.push("/");
      return;
    }
    fetchLogs();
  }, [user, tab, actionFilter, featureFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { per_page: 50 };
      if (actionFilter) params.action = actionFilter;
      if (featureFilter) params.feature = featureFilter;
      const qs = buildQuery(params);
      const endpoint = tab === "auth" ? "auth" : "activity";
      const res = await clientFetch(`/api/logs/${endpoint}${qs}`);
      setLogs(res.data || []);
    } catch {
      toast.error("Failed to load logs");
    }
    setLoading(false);
  };

  if (!user || user.role !== "dev") return null;

  return (
    <div className="feed-layout">
      {/* ═══ Feed column ═══ */}
      <div className="feed-column">

        {/* ─── Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => router.push("/admin")}
            className="p-2 rounded-xl text-text-dim hover:bg-bg-card-hover hover:text-text-primary transition-all duration-200 cursor-pointer"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-jw-accent/12 flex items-center justify-center shrink-0">
              <HiServerStack className="w-5 h-5 text-jw-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">System Logs</h1>
              <p className="text-xs text-text-muted">Jejak audit autentikasi dan aktivitas</p>
            </div>
          </div>
        </motion.div>

        {/* ─── Tabs ─────────────────────────────────────── */}
        <div className="flex items-center bg-bg-card rounded-xl border border-border-default overflow-hidden mb-4">
          <button
            onClick={() => { setTab("auth"); setActionFilter(""); setFeatureFilter(""); }}
            className={cn(
              "flex items-center justify-center gap-1.5 flex-1 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer relative",
              tab === "auth"
                ? "text-jw-mint"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-card-hover"
            )}
          >
            <HiFingerPrint className="w-4 h-4" /> Auth
            {tab === "auth" && (
              <motion.div
                layoutId="logs-tab-underline"
                className="absolute bottom-0 left-[15%] right-[15%] h-[3px] rounded-full bg-jw-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => { setTab("activity"); setActionFilter(""); setFeatureFilter(""); }}
            className={cn(
              "flex items-center justify-center gap-1.5 flex-1 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer relative",
              tab === "activity"
                ? "text-jw-mint"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-card-hover"
            )}
          >
            <HiChartBar className="w-4 h-4" /> Activity
            {tab === "activity" && (
              <motion.div
                layoutId="logs-tab-underline"
                className="absolute bottom-0 left-[15%] right-[15%] h-[3px] rounded-full bg-jw-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* ─── Refresh button ─────────────────────────── */}
        <div className="flex justify-end mb-4">
          <Button size="sm" variant="ghost" onClick={fetchLogs}>
            <HiArrowPath className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
          </Button>
        </div>

        {/* ─── Mobile: Card-based log list (< lg) ─────── */}
        <div className="lg:hidden space-y-2">
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[100px] rounded-xl animate-shimmer" />
            ))
          ) : logs.length === 0 ? (
            <EmptyState
              icon={HiServerStack}
              title="Tidak ada log"
              description="Belum ada log yang tercatat"
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {logs.map((log) => (
                <LogCardMobile key={log.id} log={log} tab={tab} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* ─── Desktop: Table (lg+) ──────────────────── */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-text-dim font-bold border-b border-border-subtle uppercase tracking-widest">
                    <th className="text-left px-5 py-3">Waktu</th>
                    <th className="text-left px-5 py-3">Pengguna</th>
                    <th className="text-left px-5 py-3">Aksi</th>
                    {tab === "activity" && <th className="text-left px-5 py-3">Fitur</th>}
                    {tab === "activity" && <th className="text-left px-5 py-3">Entitas</th>}
                    {tab === "auth" && <th className="text-left px-5 py-3">Status</th>}
                    <th className="text-left px-5 py-3">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {loading ? (
                    <tr>
                      <td colSpan={tab === "activity" ? 6 : 5} className="px-5 py-12 text-center text-sm text-text-muted">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-jw-accent/30 border-t-jw-accent animate-spin" />
                          Loading…
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={tab === "activity" ? 6 : 5} className="px-5 py-12 text-center text-sm text-text-muted">
                        Tidak ada log
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, i) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i < 15 ? i * 0.02 : 0 }}
                        className="hover:bg-bg-card-hover/40 transition-colors text-sm"
                      >
                        <td className="px-5 py-3 text-xs text-text-dim whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                        <td className="px-5 py-3 text-xs text-text-muted">{log.user_id?.slice(0, 8)}…</td>
                        <td className="px-5 py-3">
                          <Badge className="bg-jw-accent/10 text-jw-accent border border-jw-accent/20">{log.action}</Badge>
                        </td>
                        {tab === "activity" && (
                          <td className="px-5 py-3 text-xs text-text-muted">{log.feature}</td>
                        )}
                        {tab === "activity" && (
                          <td className="px-5 py-3 text-xs text-text-muted">{log.entity_type}</td>
                        )}
                        {tab === "auth" && (
                          <td className="px-5 py-3">
                            <span className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded",
                              log.success ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
                            )}>
                              {log.success
                                ? <><HiCheckCircle className="w-3 h-3" /> Sukses</>
                                : <><HiXCircle className="w-3 h-3" /> Gagal</>
                              }
                            </span>
                          </td>
                        )}
                        <td className="px-5 py-3 text-xs text-text-dim">{log.ip_address || "—"}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══ Right Sidebar (xl+ only) — Info ═══ */}
      <aside className="hidden xl:flex flex-col w-[300px] shrink-0 sticky top-5 self-start space-y-4">
        {/* Log info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
            <HiServerStack className="w-4 h-4 text-jw-accent" />
            <h3 className="text-sm font-bold text-text-primary">Info Log</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Total Ditampilkan</span>
              <span className="text-xs font-bold text-jw-accent">{logs.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Tab Aktif</span>
              <Badge className="bg-jw-accent/10 text-jw-accent border border-jw-accent/20 capitalize">
                {tab}
              </Badge>
            </div>
            {tab === "auth" && logs.length > 0 && (
              <>
                <div className="h-px bg-border-subtle" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Sukses</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {logs.filter((l) => l.success).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Gagal</span>
                  <span className="text-xs font-bold text-red-400">
                    {logs.filter((l) => !l.success).length}
                  </span>
                </div>
              </>
            )}
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
            © 2026 JogjaWaskita. System Logs.
          </p>
        </motion.div>
      </aside>
    </div>
  );
}
