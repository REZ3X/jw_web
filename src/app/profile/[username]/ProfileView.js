"use client";

/**
 * ProfileView — X/Twitter-style profile page.
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │ LeftSidebar │     Profile Column (600px)    │  RightSidebar  │
 *  │  (layout)   │  ─ Back header               │  ─ Trending    │
 *  │             │  ─ Cover banner + avatar      │  ─ Footer      │
 *  │             │  ─ Name, bio, meta, stats     │                │
 *  │             │  ─ Tabs (Posts / Responses)   │                │
 *  │             │  ─ Post feed                  │                │
 *  └──────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiCalendar, HiCog6Tooth, HiDocumentText,
  HiChatBubbleLeftRight, HiArrowLeft, HiHashtag,
  HiShieldCheck, HiEnvelope
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import PostCard from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import TrendingSidebar from "@/components/layout/TrendingSidebar";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { getRole, cn, formatDate, formatCount, buildQuery } from "@/lib/utils";
import { GOV_ROLES } from "@/lib/constants";

export default function ProfileView({ profile }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwn = user?.id === profile.id;
  const isGov = GOV_ROLES.includes(profile.role);
  const role = getRole(profile.role);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQuery({ per_page: 20 });
      const res = await clientFetch(`/api/users/${profile.username}/posts${qs}`);
      setPosts(res?.data?.posts || res?.data || []);
    } catch {}
    setLoading(false);
  }, [profile.username]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Stats
  const postCount = profile.post_count || posts.length || 0;
  const joinDate = formatDate(profile.created_at);

  return (
    <div className="feed-layout">
      {/* ═══ Main column ═══ */}
      <div className="feed-column">

        {/* ─── Sticky header ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-0 sticky top-0 z-20 py-2 -mt-2
            bg-bg-default/80 backdrop-blur-lg"
        >
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-all cursor-pointer"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-text-primary">{profile.name}</h1>
            <p className="text-[11px] text-text-dim">
              {formatCount(postCount)} {isGov ? "respon" : "laporan"}
            </p>
          </div>
        </motion.div>

        {/* ─── Profile card ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
        >
          {/* Cover banner */}
          <div className="relative h-28 sm:h-36">
            <div className="absolute inset-0 bg-gradient-to-br from-jw-accent/25 via-jw-secondary/40 to-jw-accent/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card/60 to-transparent" />
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, rgba(77,218,172,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(77,218,172,0.2) 0%, transparent 40%)",
              }}
            />
          </div>

          {/* Profile info section */}
          <div className="px-4 sm:px-5 pb-4">
            {/* Avatar + Edit button row */}
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3">
              <Avatar
                src={profile.avatar_url}
                name={profile.name}
                size="2xl"
                isGovernment={isGov}
                className="ring-4 ring-bg-card"
              />
              {isOwn && (
                <Link
                  href="/profile/settings"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                    border border-border-default text-sm font-semibold
                    text-text-primary hover:bg-bg-card-hover hover:border-border-accent/40
                    transition-all duration-200 mt-10"
                >
                  <HiCog6Tooth className="w-4 h-4" /> Edit profil
                </Link>
              )}
            </div>

            {/* Name + Badge */}
            <div className="mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary">{profile.name}</h2>
                <Badge className={role.color}>{role.label}</Badge>
                {isGov && (
                  <HiShieldCheck className="w-4.5 h-4.5 text-jw-accent" title="Official Government Account" />
                )}
              </div>
              <p className="text-sm text-text-muted">@{profile.username}</p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-text-primary/85 leading-relaxed mt-2 whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-text-dim">
              <span className="inline-flex items-center gap-1">
                <HiCalendar className="w-3.5 h-3.5 text-text-dim" />
                Gabung {joinDate}
              </span>
              {profile.email && isOwn && (
                <span className="inline-flex items-center gap-1">
                  <HiEnvelope className="w-3.5 h-3.5 text-text-dim" />
                  {profile.email}
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-5 mt-3 text-sm">
              <div>
                <span className="font-bold text-text-primary tabular-nums">{formatCount(postCount)}</span>
                <span className="text-text-dim ml-1">{isGov ? "Respon" : "Laporan"}</span>
              </div>
            </div>
          </div>


        </motion.div>

        {/* ─── Posts feed ─────────────────────────── */}
        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="space-y-3">
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={isGov ? HiChatBubbleLeftRight : HiDocumentText}
              title={isGov ? "Belum ada respon" : "Belum ada laporan"}
              description={
                isGov
                  ? "Dinas ini belum ngerespon laporan apa-apa"
                  : isOwn
                    ? "Kamu belum bikin laporan nih"
                    : "User ini belum bikin laporan"
              }
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i < 6 ? i * 0.04 : 0 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ═══ Right Sidebar (xl+ only) ═══ */}
      <aside className="hidden xl:flex flex-col w-[300px] shrink-0 sticky top-[72px] self-start space-y-4 lg:top-5">
        <TrendingSidebar />

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="px-1"
        >
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-dim">
            <Link href="/" className="hover:text-text-muted transition-colors">Beranda</Link>
            <Link href="/explore" className="hover:text-text-muted transition-colors">Explore</Link>
            <Link href="/chat" className="hover:text-text-muted transition-colors">Tanya AI</Link>
          </div>
          <p className="text-[10px] text-text-dim/60 mt-2">
            © 2026 JogjaWaskita. Hak Cipta Dilindungi.
          </p>
        </motion.div>
      </aside>
    </div>
  );
}
