"use client";

/**
 * Dev Admin Page — user management + platform overview.
 * Only accessible by users with the `dev` role.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, BarChart3, Shield, FileText, Search, ChevronRight, TrendingUp,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { getRole, cn, formatCount, buildQuery, formatDate } from "@/lib/utils";
import { ALL_ROLES } from "@/lib/constants";
import toast from "react-hot-toast";

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted">Manage users, view analytics, and system logs</p>
        </div>
        <Link
          href="/admin/logs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-border text-sm font-medium hover:bg-surface-hover transition-colors"
        >
          <FileText className="w-4 h-4" /> View Logs <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Overview stats */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-jw-primary" />
              <span className="text-xs text-muted font-medium">Total Users</span>
            </div>
            <p className="text-2xl font-bold">{formatCount(overview.platform?.total_users || 0)}</p>
          </div>
          <div className="bg-surface border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-jw-secondary" />
              <span className="text-xs text-muted font-medium">Total Reports</span>
            </div>
            <p className="text-2xl font-bold">{formatCount(overview.platform?.total_posts || 0)}</p>
          </div>
          <div className="bg-surface border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted font-medium">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-emerald-500">{formatCount(overview.platform?.closed_posts || 0)}</p>
          </div>
          <div className="bg-surface border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">{formatCount(overview.platform?.pending_posts || 0)}</p>
          </div>
        </div>
      )}

      {/* User management */}
      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-jw-primary" /> User Management
            </h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchUsers(e.target.value, roleFilter);
                  }}
                  placeholder="Search users…"
                  className="pl-9 pr-3 py-2 bg-surface-hover border border-surface-border rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-jw-primary/30"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  fetchUsers(searchQuery, e.target.value);
                }}
                className="text-sm bg-surface-hover border border-surface-border rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="">All Roles</option>
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>{getRole(r).label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted font-medium border-b border-surface-border">
                <th className="text-left px-6 py-3">User</th>
                <th className="text-left px-6 py-3">Email</th>
                <th className="text-left px-6 py-3">Role</th>
                <th className="text-left px-6 py-3">Verified</th>
                <th className="text-left px-6 py-3">Joined</th>
                <th className="text-left px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted">Loading…</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted">No users found</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar_url} name={u.name} size="sm" isGovernment={u.is_government} />
                        <div>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-muted">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-muted">{u.email}</td>
                    <td className="px-6 py-3">
                      <Badge className={getRole(u.role).color}>{getRole(u.role).label}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <span className={cn("text-xs font-medium", u.email_verified ? "text-emerald-500" : "text-amber-500")}>
                        {u.email_verified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-muted">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs bg-surface-hover border border-surface-border rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>{getRole(r).label}</option>
                        ))}
                      </select>
                    </td>
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
