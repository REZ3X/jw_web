"use client";

/**
 * Logs Viewer — auth and activity logs with filters (dev only).
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Activity, Search, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { cn, formatDateTime, buildQuery } from "@/lib/utils";
import toast from "react-hot-toast";

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/admin")}
          className="p-1.5 rounded-lg text-muted hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">System Logs</h1>
          <p className="text-sm text-muted">Authentication and activity audit trail</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => { setTab("auth"); setActionFilter(""); setFeatureFilter(""); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer",
            tab === "auth" ? "bg-jw-primary/10 text-jw-primary" : "text-muted hover:bg-surface-hover"
          )}
        >
          <Shield className="w-4 h-4" /> Auth Logs
        </button>
        <button
          onClick={() => { setTab("activity"); setActionFilter(""); setFeatureFilter(""); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer",
            tab === "activity" ? "bg-jw-secondary/10 text-jw-secondary" : "text-muted hover:bg-surface-hover"
          )}
        >
          <Activity className="w-4 h-4" /> Activity Logs
        </button>
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={fetchLogs}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Log table */}
      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted font-medium border-b border-surface-border">
                <th className="text-left px-6 py-3">Time</th>
                <th className="text-left px-6 py-3">User</th>
                <th className="text-left px-6 py-3">Action</th>
                {tab === "activity" && <th className="text-left px-6 py-3">Feature</th>}
                {tab === "activity" && <th className="text-left px-6 py-3">Entity</th>}
                {tab === "auth" && <th className="text-left px-6 py-3">Status</th>}
                <th className="text-left px-6 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                <tr>
                  <td colSpan={tab === "activity" ? 6 : 5} className="px-6 py-8 text-center text-sm text-muted">Loading…</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={tab === "activity" ? 6 : 5} className="px-6 py-8 text-center text-sm text-muted">No logs found</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-hover/50 transition-colors text-sm">
                    <td className="px-6 py-3 text-xs text-muted whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="px-6 py-3 text-xs text-muted">{log.user_id?.slice(0, 8)}…</td>
                    <td className="px-6 py-3">
                      <Badge className="bg-surface-hover text-foreground">{log.action}</Badge>
                    </td>
                    {tab === "activity" && (
                      <td className="px-6 py-3 text-xs text-muted">{log.feature}</td>
                    )}
                    {tab === "activity" && (
                      <td className="px-6 py-3 text-xs text-muted">{log.entity_type}</td>
                    )}
                    {tab === "auth" && (
                      <td className="px-6 py-3">
                        <span className={cn("text-xs font-medium", log.success ? "text-emerald-500" : "text-red-500")}>
                          {log.success ? "Success" : "Failed"}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-3 text-xs text-muted-light">{log.ip_address || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
