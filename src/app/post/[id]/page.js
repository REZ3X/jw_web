"use client";

/**
 * Post Detail Page — X/Twitter-style single post view.
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │ LeftSidebar │      Post Detail Column     │  RightSidebar   │
 *  │  (layout)   │  ─ Back button + header     │  ─ Trending     │
 *  │             │  ─ Author card              │  ─ Footer       │
 *  │             │  ─ Full post content        │                 │
 *  │             │  ─ Engagement stats         │                 │
 *  │             │  ─ Action bar               │                 │
 *  │             │  ─ Comment section          │                 │
 *  └──────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiArrowLeft, HiMapPin, HiLockClosed,
  HiChatBubbleOvalLeft, HiArrowUpTray,
  HiEllipsisHorizontal, HiTrash, HiPencilSquare
} from "react-icons/hi2";
import { motion } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import VoteButtons from "@/components/post/VoteButtons";
import MediaGallery from "@/components/post/MediaGallery";
import CommentSection from "@/components/comment/CommentSection";
import TrendingSidebar from "@/components/layout/TrendingSidebar";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import { clientFetch } from "@/lib/api";
import { timeAgo, parseCaption, getDepartment, getStatus, cn, formatCount } from "@/lib/utils";
import { GOV_ROLES } from "@/lib/constants";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

function PostDetailContent({ id }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await clientFetch(`/api/posts/${id}`);
        setPost(res?.data || res);
      } catch (err) {
        setError(err.message || "Post not found");
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await clientFetch(`/api/posts/${post.id}`, { method: "DELETE" });
      toast.success("Post deleted");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${id}`;
    navigator.clipboard?.writeText(url);
    toast.success("Link copied to clipboard");
  };

  if (loading) {
    return (
      <div className="feed-layout">
        <div className="feed-column space-y-4">
          {/* Back header skeleton */}
          <div className="h-10 rounded-xl animate-shimmer" />
          {/* Post skeleton */}
          <div className="rounded-xl bg-bg-card border border-border-default p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl animate-shimmer" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded animate-shimmer" />
                <div className="h-3 w-24 rounded animate-shimmer" />
              </div>
            </div>
            <div className="h-20 rounded-xl animate-shimmer" />
            <div className="h-48 rounded-xl animate-shimmer" />
            <div className="h-12 rounded-xl animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="feed-layout">
        <div className="feed-column">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-all cursor-pointer"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-text-primary">Post</h1>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-default p-8 text-center">
            <p className="text-text-muted mb-4">{error || "Post not found"}</p>
            <Link href="/" className="text-sm font-semibold text-jw-accent hover:text-jw-mint transition-colors">
              Go back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dept = getDepartment(post.department);
  const status = getStatus(post.status);
  const caption = parseCaption(post.caption);
  const isGov = GOV_ROLES.includes(post.user_role);
  const isOwner = user?.id === post.user_id;
  const score = (post.upvote_count || 0) - (post.downvote_count || 0);

  // Format full date
  const fullDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="feed-layout">
      {/* ═══ Main column ═══ */}
      <div className="feed-column">

        {/* ─── Sticky header ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4 sticky top-0 z-10 py-2 -mt-2
            bg-bg-default/80 backdrop-blur-lg"
        >
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-all cursor-pointer"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-text-primary">Post</h1>
            <p className="text-[11px] text-text-dim">{formatCount(post.comment_count || 0)} comments</p>
          </div>
        </motion.div>

        {/* ─── Post content card ─────────────────── */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-xl bg-bg-card border border-border-default overflow-hidden"
        >
          <div className="p-4 sm:p-5">

            {/* ── Author header ── */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <Link href={`/profile/${post.username}`} className="shrink-0">
                  <Avatar
                    src={post.user_avatar}
                    name={post.user_name}
                    size="lg"
                    isGovernment={isGov}
                  />
                </Link>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={`/profile/${post.username}`}
                      className="text-[15px] font-bold text-text-primary hover:text-jw-mint transition-colors"
                    >
                      {post.user_name}
                    </Link>
                    {isGov && (
                      <Badge className="bg-jw-accent/15 text-jw-mint border border-jw-accent/30 text-[10px]">
                        Official
                      </Badge>
                    )}
                    {post.is_private && <HiLockClosed className="w-3.5 h-3.5 text-text-dim" />}
                  </div>
                  <p className="text-xs text-text-muted">
                    @{post.username}
                  </p>
                </div>
              </div>

              {/* Menu */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={status.color} dot={status.dotColor}>{status.label}</Badge>
                {isOwner && (
                  <Dropdown
                    trigger={<HiEllipsisHorizontal className="w-5 h-5 text-text-dim hover:text-text-secondary transition-colors cursor-pointer" />}
                  >
                    <DropdownItem danger onClick={handleDelete}>
                      <HiTrash className="w-4 h-4" /> Delete
                    </DropdownItem>
                  </Dropdown>
                )}
              </div>
            </div>

            {/* ── Caption ── */}
            <div className="mb-4">
              <p className="text-[16px] leading-[1.65] whitespace-pre-wrap text-text-primary/90">
                {caption.map((seg, i) =>
                  seg.type === "tag" ? (
                    <Link key={i} href={`/explore?tag=${seg.value}`} className="tag-link">
                      #{seg.value}
                    </Link>
                  ) : (
                    <span key={i}>{seg.value}</span>
                  )
                )}
              </p>
            </div>

            {/* ── Media ── */}
            {post.media && post.media.length > 0 && (
              <div className="mb-4 -mx-1">
                <MediaGallery media={post.media} post={post} />
              </div>
            )}

            {/* ── Tags ── */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/explore?tag=${tag}`}
                    className="text-xs px-2.5 py-1 rounded-lg bg-jw-accent/8 text-jw-accent hover:bg-jw-accent/15 transition-colors border border-jw-accent/15 font-medium"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* ── Timestamp + Location + Department ── */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-dim pb-4 border-b border-border-subtle">
              <time>{fullDate}</time>
              {post.location && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <HiMapPin className="w-3 h-3 text-jw-accent/70" /> {post.location}
                  </span>
                </>
              )}
              <span>·</span>
              <Badge className={dept.color}>{dept.label}</Badge>
              {post.is_edited && (
                <>
                  <span>·</span>
                  <span className="text-text-dim">Edited</span>
                </>
              )}
            </div>

            {/* ── Engagement stats bar ── */}
            <div className="flex items-center gap-4 py-3 border-b border-border-subtle text-xs">
              <div className="flex items-center gap-1">
                <span className="font-bold text-text-primary tabular-nums">{formatCount(post.upvote_count || 0)}</span>
                <span className="text-text-dim">Upvotes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-text-primary tabular-nums">{formatCount(post.downvote_count || 0)}</span>
                <span className="text-text-dim">Downvotes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-text-primary tabular-nums">{formatCount(post.comment_count || 0)}</span>
                <span className="text-text-dim">Comments</span>
              </div>
            </div>

            {/* ── Action bar: Vote + Comment + Share ── */}
            <div className="flex items-center justify-around py-2 border-b border-border-subtle">
              <VoteButtons
                type="post"
                id={post.id}
                upvotes={post.upvote_count}
                downvotes={post.downvote_count}
                myVote={post.my_vote}
              />
              <button
                onClick={() => document.getElementById("comment-input")?.focus()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                  text-text-muted hover:text-jw-accent hover:bg-jw-accent/5
                  transition-all duration-200 text-xs font-medium cursor-pointer"
              >
                <HiChatBubbleOvalLeft className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">Comment</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                  text-text-muted hover:text-jw-accent hover:bg-jw-accent/5
                  transition-all duration-200 text-xs font-medium cursor-pointer"
              >
                <HiArrowUpTray className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* ── Comments section ── */}
          <div className="p-4 sm:p-5 pt-0 sm:pt-0">
            <CommentSection postId={post.id} postOwnerId={post.user_id} />
          </div>
        </motion.article>
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
            <Link href="/" className="hover:text-text-muted transition-colors">Home</Link>
            <Link href="/explore" className="hover:text-text-muted transition-colors">Explore</Link>
            <Link href="/chat" className="hover:text-text-muted transition-colors">AI Chat</Link>
          </div>
          <p className="text-[10px] text-text-dim/60 mt-2">
            © 2026 JogjaWaskita. All rights reserved.
          </p>
        </motion.div>
      </aside>
    </div>
  );
}

export default function PostPage({ params }) {
  const [id, setId] = useState(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  if (!id) {
    return (
      <div className="feed-layout">
        <div className="feed-column space-y-4">
          <div className="h-10 rounded-xl animate-shimmer" />
          <PostCardSkeleton />
        </div>
      </div>
    );
  }

  return <PostDetailContent id={id} />;
}
