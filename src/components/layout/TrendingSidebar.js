"use client";

/**
 * TrendingSidebar — trending tags only.
 * Compact, clean, sits in the right gutter on desktop.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiArrowTrendingUp, HiHashtag, HiArrowRight } from "react-icons/hi2";
import { motion } from "framer-motion";
import { clientFetch } from "@/lib/api";
import { formatCount } from "@/lib/utils";

export default function TrendingSidebar() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientFetch("/api/analytics/trending-tags")
      .then((res) => setTags(res?.data?.trending_tags || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-bg-card border border-border-default animate-shimmer h-56" />
    );
  }

  if (tags.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <h3 className="flex items-center gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
          <HiArrowTrendingUp className="w-3.5 h-3.5 text-jw-accent" />
          Trending
        </h3>
      </div>

      {/* Tag list */}
      <div className="divide-y divide-border-subtle">
        {tags.slice(0, 5).map((tag, idx) => (
          <Link
            key={tag.tag}
            href={`/explore?tag=${encodeURIComponent(tag.tag)}`}
            className="flex items-center justify-between px-4 py-2.5
              hover:bg-bg-card-hover transition-colors duration-150 group"
          >
            <div className="min-w-0">
              <p className="text-[10px] text-text-dim font-medium uppercase tracking-wider">
                #{idx + 1} Trending
              </p>
              <p className="text-sm font-semibold text-text-primary group-hover:text-jw-mint transition-colors truncate">
                <HiHashtag className="w-3 h-3 text-jw-accent inline mr-0.5" />
                {tag.tag}
              </p>
            </div>
            <span className="text-[11px] text-text-dim tabular-nums shrink-0 ml-3">
              {formatCount(tag.count)} posts
            </span>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <Link
        href="/explore"
        className="flex items-center justify-center gap-1 px-4 py-2.5
          text-xs font-semibold text-jw-accent hover:text-jw-mint
          border-t border-border-subtle transition-colors"
      >
        Explore all <HiArrowRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}
