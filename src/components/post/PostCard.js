"use client";

/**
 * PostCard — single report/post in the feed.
 *
 * Clean, minimal card design:
 *  - Thin border, no heavy backgrounds
 *  - Avatar · name · time on one line
 *  - Caption (with clickable #tags)
 *  - Media gallery
 *  - Footer: vote | comments | location · department · status
 */

import { useState } from "react";
import Link from "next/link";
import {
  HiChatBubbleOvalLeft, HiMapPin, HiLockClosed,
  HiEllipsisHorizontal, HiTrash, HiPencilSquare
} from "react-icons/hi2";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import VoteButtons from "./VoteButtons";
import MediaGallery from "./MediaGallery";
import PostModal from "./PostModal";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useAuthStore } from "@/lib/store";
import { timeAgo, parseCaption, getDepartment, getStatus, cn, formatCount } from "@/lib/utils";
import { GOV_ROLES } from "@/lib/constants";
import { clientFetch } from "@/lib/api";
import toast from "react-hot-toast";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (deleted) return null;

  const dept = getDepartment(post.department);
  const status = getStatus(post.status);
  const isOwner = user?.id === post.user_id;
  const caption = parseCaption(post.caption);
  const isGov = GOV_ROLES.includes(post.user_role);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await clientFetch(`/api/posts/${post.id}`, { method: "DELETE" });
      setDeleted(true);
      onDelete?.(post.id);
      toast.success("Post dihapus");
    } catch (err) {
      toast.error(err.message || "Gagal dihapus");
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <article
        className="rounded-xl bg-bg-card border border-border-default
          hover:border-border-accent/50 transition-colors duration-200"
      >
        <div className="p-4 sm:p-5">
          {/* ── Header ───────────────────────────── */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link href={`/profile/${post.username}`} className="shrink-0">
                <Avatar
                  src={post.user_avatar}
                  name={post.user_name}
                  size="sm"
                  isGovernment={isGov}
                />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link
                    href={`/profile/${post.username}`}
                    className="text-sm font-semibold text-text-primary hover:text-jw-mint transition-colors truncate"
                  >
                    {post.user_name}
                  </Link>
                  <span className="text-xs text-text-dim">·</span>
                  <span className="text-xs text-text-muted">{timeAgo(post.created_at)}</span>
                  {post.is_edited && <span className="text-xs text-text-dim">(edited)</span>}
                  {post.is_private && (
                    <HiLockClosed className="w-3 h-3 text-text-dim" title="Private" />
                  )}
                </div>
              </div>
            </div>

            {/* Right: status + menu */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge className={status.color} dot={status.dotColor}>
                {status.label}
              </Badge>
              {isOwner && (
                <Dropdown
                  trigger={
                    <HiEllipsisHorizontal className="w-5 h-5 text-text-dim hover:text-text-secondary transition-colors cursor-pointer" />
                  }
                >
                  <DropdownItem onClick={() => setModalOpen(true)}>
                    <HiPencilSquare className="w-4 h-4" /> Edit
                  </DropdownItem>
                  <DropdownItem danger onClick={() => setShowDeleteConfirm(true)}>
                    <HiTrash className="w-4 h-4" /> Hapus
                  </DropdownItem>
                </Dropdown>
              )}
            </div>
          </div>

          {/* ── Caption ──────────────────────────── */}
          <button
            onClick={() => setModalOpen(true)}
            className="text-left w-full mb-3 cursor-pointer"
          >
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-text-primary/90">
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

          {/* ── Media ────────────────────────────── */}
          {post.media && post.media.length > 0 && (
            <div className="mb-3 -mx-1">
              <MediaGallery media={post.media} post={post} />
            </div>
          )}

          {/* ── Footer: vote + comment + meta ────── */}
          <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle">
            {/* Left: vote + comments */}
            <div className="flex items-center gap-2">
              <VoteButtons
                type="post"
                id={post.id}
                upvotes={post.upvote_count}
                downvotes={post.downvote_count}
                myVote={post.my_vote}
              />
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                  text-text-muted hover:text-jw-accent hover:bg-jw-accent/5
                  transition-all duration-200 text-xs font-medium cursor-pointer"
              >
                <HiChatBubbleOvalLeft className="w-4 h-4" />
                {formatCount(post.comment_count)}
              </button>
            </div>

            {/* Right: location + department */}
            <div className="flex items-center gap-2">
              {post.location && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-text-dim">
                  <HiMapPin className="w-3 h-3 text-jw-accent/60" />
                  <span className="truncate max-w-[120px]">{post.location}</span>
                </span>
              )}
              <Badge className={dept.color}>{dept.short}</Badge>
            </div>
          </div>
        </div>
      </article>

      {modalOpen && (
        <PostModal post={post} onClose={() => setModalOpen(false)} />
      )}

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Laporan"
        description="Yakin mau hapus post ini? Nggak bisa dibalikin lho."
        confirmText="Ya, Hapus"
        danger
        loading={isDeleting}
      />
    </>
  );
}
