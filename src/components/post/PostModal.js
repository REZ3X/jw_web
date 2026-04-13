"use client";

/**
 * PostModal — X/Twitter-style full post view as a modal overlay.
 * Shows full post details with engagement stats + comment section.
 */

import { useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  HiXMark, HiMapPin, HiLockClosed,
  HiChatBubbleOvalLeft, HiArrowUpTray
} from "react-icons/hi2";
import { motion } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import VoteButtons from "./VoteButtons";
import MediaGallery from "./MediaGallery";
import CommentSection from "@/components/comment/CommentSection";
import { timeAgo, parseCaption, getDepartment, getStatus, formatCount } from "@/lib/utils";
import { GOV_ROLES } from "@/lib/constants";
import toast from "react-hot-toast";

export default function PostModal({ post, onClose }) {
  // Stable ref for onClose to avoid re-running the effect when the parent re-renders
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleEsc = useCallback(
    (e) => { if (e.key === "Escape") onCloseRef.current(); },
    []
  );

  useEffect(() => {
    // Remember where we came from so we can restore on close
    const originalUrl = window.location.pathname + window.location.search;

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    // Signal Navbar to hide bars
    window.dispatchEvent(new CustomEvent("jw:overlay-open"));

    // Push /post/{id} — refreshing at this URL loads the real post page
    window.history.pushState({ postModal: true }, "", `/post/${post.id}`);

    // Browser back button → close modal
    const handlePopState = () => {
      onCloseRef.current();
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
      window.removeEventListener("popstate", handlePopState);
      // Signal Navbar to show bars
      window.dispatchEvent(new CustomEvent("jw:overlay-close"));
      // Restore the original URL without firing popstate (replaceState is silent)
      if (window.location.pathname === `/post/${post.id}`) {
        window.history.replaceState(null, "", originalUrl);
      }
    };
  }, [handleEsc, post.id]);

  const dept = getDepartment(post.department);
  const status = getStatus(post.status);
  const caption = parseCaption(post.caption);
  const isGov = GOV_ROLES.includes(post.user_role);

  const fullDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard?.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[2vh] sm:pt-[3vh] px-2 sm:px-4 pb-2 sm:pb-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-2xl bg-bg-card border border-border-default shadow-2xl shadow-black/50 overflow-hidden max-h-[96vh] sm:max-h-[94vh] flex flex-col"
      >
        {/* ── Sticky header ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border-subtle bg-bg-card/90 backdrop-blur-lg sticky top-0 z-10">
          <h2 className="text-sm font-bold text-text-primary">Post</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-dim hover:text-text-primary hover:bg-bg-card-hover transition-all duration-200 cursor-pointer"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1">
          <div className="p-4 sm:p-5">

            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <Link href={`/profile/${post.username}`} className="shrink-0">
                <Avatar src={post.user_avatar} name={post.user_name} size="lg" isGovernment={isGov} />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link href={`/profile/${post.username}`} className="text-[15px] font-bold text-text-primary hover:text-jw-mint transition-colors">
                    {post.user_name}
                  </Link>
                  {isGov && (
                    <Badge className="bg-jw-accent/15 text-jw-mint border border-jw-accent/30 text-[10px]">Official</Badge>
                  )}
                  {post.is_private && <HiLockClosed className="w-3.5 h-3.5 text-text-dim" />}
                </div>
                <p className="text-xs text-text-muted">@{post.username}</p>
              </div>
              <Badge className={status.color} dot={status.dotColor}>{status.label}</Badge>
            </div>

            {/* Caption */}
            <div className="mb-4">
              <p className="text-[15px] sm:text-base leading-[1.65] whitespace-pre-wrap text-text-primary/90">
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

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className="mb-4 -mx-1">
                <MediaGallery media={post.media} post={post} />
              </div>
            )}

            {/* Tags */}
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

            {/* Timestamp + Meta */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-dim pb-3 border-b border-border-subtle">
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
                  <span>Edited</span>
                </>
              )}
            </div>

            {/* Engagement stats */}
            <div className="flex items-center gap-4 py-2.5 border-b border-border-subtle text-xs">
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

            {/* Action bar */}
            <div className="flex items-center justify-around py-2 border-b border-border-subtle">
              <VoteButtons
                type="post"
                id={post.id}
                upvotes={post.upvote_count}
                downvotes={post.downvote_count}
                myVote={post.my_vote}
              />
              <button
                onClick={() => document.getElementById("modal-comment-input")?.focus()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                  text-text-muted hover:text-jw-accent hover:bg-jw-accent/5
                  transition-all duration-200 text-xs font-medium cursor-pointer"
              >
                <HiChatBubbleOvalLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Comment</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                  text-text-muted hover:text-jw-accent hover:bg-jw-accent/5
                  transition-all duration-200 text-xs font-medium cursor-pointer"
              >
                <HiArrowUpTray className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* Comments */}
            <div className="mt-4">
              <CommentSection postId={post.id} postOwnerId={post.user_id} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
