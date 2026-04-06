"use client";

/**
 * TrendingSidebar — shows trending tags and quick platform stats.
 * Displayed on the right side of the home feed on desktop.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, BarChart3, Hash, Users, FileText, ArrowRight } from "lucide-react";
import { cn, formatCount } from "@/lib/utils";

export default function TrendingSidebar() {
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/trending-tags").then((r) => r.json()).catch(() => ({})),
      fetch("/api/analytics/stats").then((r) => r.json()).catch(() => ({})),
    ]).then(([tagRes, statRes]) => {
      setTags(tagRes?.data?.trending_tags || []);
      setStats(statRes?.data || null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-surface border border-surface-border rounded-2xl p-5 animate-shimmer h-64" />
        <div className="bg-surface border border-surface-border rounded-2xl p-5 animate-shimmer h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trending Tags */}
      {tags.length > 0 && (
        <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-jw-primary" />
              <h3 className="font-semibold text-sm">Trending Topics</h3>
            </div>
          </div>
          <div className="divide-y divide-surface-border">
            {tags.slice(0, 8).map((tag, idx) => (
              <Link
                key={tag.tag}
                href={`/explore?tag=${encodeURIComponent(tag.tag)}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-surface-hover transition-colors group"
              >
                <div>
                  <p className="text-xs text-muted-light">Trending #{idx + 1}</p>
                  <p className="text-sm font-medium text-foreground group-hover:text-jw-primary transition-colors">
                    <Hash className="w-3.5 h-3.5 inline-block mr-0.5 text-jw-primary" />
                    {tag.tag}
                  </p>
                </div>
                <span className="text-xs text-muted">{formatCount(tag.count)} posts</span>
              </Link>
            ))}
          </div>
          <Link
            href="/explore"
            className="flex items-center justify-center gap-1.5 px-5 py-3 text-sm text-jw-primary font-medium hover:bg-surface-hover transition-colors"
          >
            Explore more <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="bg-surface border border-surface-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-jw-secondary" />
            <h3 className="font-semibold text-sm">Platform Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-hover rounded-xl p-3 text-center">
              <FileText className="w-4 h-4 text-jw-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{formatCount(stats.total_posts)}</p>
              <p className="text-xs text-muted">Reports</p>
            </div>
            <div className="bg-surface-hover rounded-xl p-3 text-center">
              <Users className="w-4 h-4 text-jw-secondary mx-auto mb-1" />
              <p className="text-lg font-bold">{formatCount(stats.total_users)}</p>
              <p className="text-xs text-muted">Citizens</p>
            </div>
            <div className="bg-surface-hover rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-emerald-500">{formatCount(stats.closed_posts)}</p>
              <p className="text-xs text-muted">Resolved</p>
            </div>
            <div className="bg-surface-hover rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-amber-500">{formatCount(stats.pending_posts)}</p>
              <p className="text-xs text-muted">Pending</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
