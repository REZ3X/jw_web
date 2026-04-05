"use client";

/**
 * PostModal — full post view as a modal overlay.
 * Shows the full post details + comment section inline.
 */

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { X, MapPin, Lock } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import VoteButtons from "./VoteButtons";
import MediaGallery from "./MediaGallery";
import CommentSection from "@/components/comment/CommentSection";
import { timeAgo, parseCaption, getDepartment, getStatus } from "@/lib/utils";
import { GOV_ROLES } from "@/lib/constants";

export default function PostModal({ post, onClose }) {
  const handleEsc = useCallback(
    (e) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    window.history.pushState(null, "", `/?post=${post.id}`);
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
      window.history.pushState(null, "", "/");
    };
  }, [handleEsc, post.id]);

  const dept = getDepartment(post.department);
  const status = getStatus(post.status);
  const caption = parseCaption(post.caption);
  const isGov = GOV_ROLES.includes(post.user_role);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[3vh] px-4 pb-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div className="relative w-full max-w-3xl bg-surface rounded-2xl shadow-2xl border border-surface-border overflow-hidden animate-scale-in max-h-[94vh] flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-surface/80 text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <Link href={`/profile/${post.username}`}>
                <Avatar src={post.user_avatar} name={post.user_name} size="lg" isGovernment={isGov} />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${post.username}`} className="font-semibold hover:text-jw-primary transition-colors">
                    {post.user_name}
                  </Link>
                  {isGov && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Official</Badge>
                  )}
                  {post.is_private && <Lock className="w-4 h-4 text-muted-light" />}
                </div>
                <p className="text-sm text-muted">
                  @{post.username} · {timeAgo(post.created_at)}
                  {post.is_edited && " · edited"}
                </p>
              </div>
            </div>

            {/* Caption */}
            <div className="mb-4">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
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
            <div className="mb-4">
              <MediaGallery media={post.media} />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.location && (
                <span className="inline-flex items-center gap-1 text-sm text-muted">
                  <MapPin className="w-4 h-4" /> {post.location}
                </span>
              )}
              <Badge className={dept.color}>{dept.label}</Badge>
              <Badge className={status.color} dot={status.dotColor}>{status.label}</Badge>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/explore?tag=${tag}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-jw-primary/10 text-jw-primary hover:bg-jw-primary/20 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Vote */}
            <div className="pb-4 border-b border-surface-border">
              <VoteButtons
                type="post"
                id={post.id}
                upvotes={post.upvote_count}
                downvotes={post.downvote_count}
                myVote={post.my_vote}
              />
            </div>

            {/* Comments */}
            <div className="mt-4">
              <CommentSection postId={post.id} postOwnerId={post.user_id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
