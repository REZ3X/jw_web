"use client";

/**
 * PostCard — single post in the feed.
 *
 * Displays user info, caption with parsed tags, media gallery,
 * vote buttons, comment count, and department/status badges.
 * Clicking the caption or comment icon opens the PostModal.
 */

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, MapPin, Lock, MoreHorizontal, Trash2, Pencil, Pin } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import VoteButtons from "./VoteButtons";
import MediaGallery from "./MediaGallery";
import PostModal from "./PostModal";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import { useAuthStore } from "@/lib/store";
import { timeAgo, parseCaption, getDepartment, getStatus, cn, formatCount } from "@/lib/utils";
import { clientFetch } from "@/lib/api";
import toast from "react-hot-toast";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  const dept = getDepartment(post.department);
  const status = getStatus(post.status);
  const isOwner = user?.id === post.user_id;
  const caption = parseCaption(post.caption);

  const handleDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await clientFetch(`/api/posts/${post.id}`, { method: "DELETE" });
      setDeleted(true);
      onDelete?.(post.id);
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <>
      <article className="bg-surface border border-surface-border rounded-2xl overflow-hidden hover:border-surface-border/80 transition-all animate-slide-up">
        <div className="p-5">
          {/* Header: user info + badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${post.username}`}>
                <Avatar
                  src={post.user_avatar}
                  name={post.user_name}
                  size="md"
                  isGovernment={["city_major_gov", "fire_department", "health_department", "environment_department", "police_department"].includes(post.user_role)}
                />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${post.username}`} className="text-sm font-semibold hover:text-jw-primary transition-colors">
                    {post.user_name}
                  </Link>
                  {post.is_private && (
                    <Lock className="w-3.5 h-3.5 text-muted-light" title="Private post" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>@{post.username}</span>
                  <span>·</span>
                  <span>{timeAgo(post.created_at)}</span>
                  {post.is_edited && <span className="text-muted-light">(edited)</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={status.color} dot={status.dotColor}>{status.label}</Badge>
              {isOwner && (
                <Dropdown trigger={<MoreHorizontal className="w-5 h-5 text-muted hover:text-foreground transition-colors" />}>
                  <DropdownItem onClick={() => setModalOpen(true)}>
                    <Pencil className="w-4 h-4" /> Edit
                  </DropdownItem>
                  <DropdownItem danger onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </DropdownItem>
                </Dropdown>
              )}
            </div>
          </div>

          {/* Caption */}
          <button
            onClick={() => setModalOpen(true)}
            className="text-left w-full mb-3 cursor-pointer"
          >
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {caption.map((seg, i) =>
                seg.type === "tag" ? (
                  <Link
                    key={i}
                    href={`/explore?tag=${seg.value}`}
                    className="tag-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    #{seg.value}
                  </Link>
                ) : (
                  <span key={i}>{seg.value}</span>
                )
              )}
            </p>
          </button>

          {/* Media */}
          <div className="mb-3">
            <MediaGallery media={post.media} />
          </div>

          {/* Meta: location + department */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {post.location && (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <MapPin className="w-3.5 h-3.5" />
                {post.location}
              </span>
            )}
            <Badge className={dept.color}>{dept.short}</Badge>
          </div>

          {/* Actions: vote + comments */}
          <div className="flex items-center gap-3 pt-2 border-t border-surface-border/50">
            <VoteButtons
              type="post"
              id={post.id}
              upvotes={post.upvote_count}
              downvotes={post.downvote_count}
              myVote={post.my_vote}
            />
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-muted hover:text-jw-primary hover:bg-jw-primary/5 transition-colors text-sm cursor-pointer"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              <span className="font-medium">{formatCount(post.comment_count)}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Post modal overlay */}
      {modalOpen && (
        <PostModal post={post} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
