"use client";

/**
 * CommentItem — single comment with replies support.
 * Supports pinning, editing, deleting, and expanding reply thread.
 */

import { useState } from "react";
import Link from "next/link";
import {
  HiChevronDown, HiChevronUp, HiMapPin, HiEllipsisHorizontal, HiTrash, HiPencilSquare
} from "react-icons/hi2";
import { BsPin } from "react-icons/bs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import VoteButtons from "@/components/post/VoteButtons";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import CommentForm from "./CommentForm";
import SubCommentItem from "./SubCommentItem";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { timeAgo, cn } from "@/lib/utils";
import { GOV_ROLES } from "@/lib/constants";
import toast from "react-hot-toast";

export default function CommentItem({ comment, postOwnerId, onDeleted }) {
  const { user } = useAuthStore();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const isPostOwner = user?.id === postOwnerId;
  const isGov = GOV_ROLES.includes(comment.user_role);

  const loadReplies = async () => {
    if (repliesLoaded) {
      setShowReplies(!showReplies);
      return;
    }
    try {
      const res = await clientFetch(`/api/comments/${comment.id}/replies`);
      const data = res.data || [];
      setReplies(Array.isArray(data) ? data : data.replies || []);
      setRepliesLoaded(true);
      setShowReplies(true);
    } catch {
      toast.error("Gagal memuat balasan");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await clientFetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      onDeleted?.(comment.id);
      toast.success("Komentar dihapus");
    } catch (err) {
      toast.error(err.message);
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handlePin = async () => {
    try {
      await clientFetch(`/api/comments/${comment.id}/pin`, { method: "POST" });
      toast.success(comment.is_pinned ? "Lepas semat" : "Sematkan");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReplyAdded = (reply) => {
    setReplies((prev) => [...prev, reply]);
    setShowReplies(true);
    setShowReplyForm(false);
  };

  return (
    <div className={cn("py-3", comment.is_pinned && "bg-jw-accent/5 rounded-xl px-3 -mx-3 border border-jw-accent/10")}>
      {comment.is_pinned && (
        <div className="flex items-center gap-1 text-xs text-jw-accent font-semibold mb-1.5">
          <BsPin className="w-3 h-3" /> Disematkan
        </div>
      )}

      <div className="flex gap-3">
        <Link href={`/profile/${comment.username}`} className="shrink-0">
          <Avatar src={comment.user_avatar} name={comment.user_name} size="sm" isGovernment={isGov} />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <Link href={`/profile/${comment.username}`} className="text-sm font-semibold hover:text-jw-highlight transition-colors">
              {comment.user_name}
            </Link>
            {comment.is_official && (
              <Badge className="bg-jw-accent/15 text-jw-highlight border border-jw-accent/30 text-[10px]">
                Respon Resmi
              </Badge>
            )}
            <span className="text-xs text-muted">{timeAgo(comment.created_at)}</span>
            {comment.is_edited && <span className="text-xs text-muted-light">(diedit)</span>}

            {/* Actions dropdown */}
            {(isOwner || isPostOwner) && (
              <Dropdown
                trigger={<HiEllipsisHorizontal className="w-4 h-4 text-muted hover:text-foreground cursor-pointer" />}
              >
                {isPostOwner && (
                  <DropdownItem onClick={handlePin}>
                    <BsPin className="w-3.5 h-3.5" /> {comment.is_pinned ? "Lepas semat" : "Sematkan"}
                  </DropdownItem>
                )}
                {isOwner && (
                  <DropdownItem danger onClick={() => setShowDeleteConfirm(true)}>
                    <HiTrash className="w-3.5 h-3.5" /> Hapus
                  </DropdownItem>
                )}
              </Dropdown>
            )}
          </div>

          {/* Content */}
          <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap">{comment.content}</p>

          {/* Official image */}
          {comment.official_image_url && (
            <div className="mt-2 rounded-xl overflow-hidden max-w-sm border border-surface-border">
              <img src={comment.official_image_url} alt="Official response" className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <VoteButtons
              type="comment"
              id={comment.id}
              upvotes={comment.upvote_count}
              downvotes={comment.downvote_count}
              myVote={comment.my_vote}
              compact
            />
            {user && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-muted hover:text-jw-accent font-semibold transition-colors cursor-pointer"
              >
                Balas
              </button>
            )}
            {comment.reply_count > 0 && (
              <button
                onClick={loadReplies}
                className="flex items-center gap-1 text-xs text-jw-accent font-semibold hover:text-jw-highlight transition-colors cursor-pointer"
              >
                {showReplies ? <HiChevronUp className="w-3.5 h-3.5" /> : <HiChevronDown className="w-3.5 h-3.5" />}
                {comment.reply_count} {comment.reply_count === 1 ? "balasan" : "balasan"}
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                commentId={comment.id}
                isReply
                onAdded={handleReplyAdded}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 space-y-1 pl-2 border-l-2 border-jw-accent/20">
              {replies.map((reply) => (
                <SubCommentItem key={reply.id} reply={reply} commentId={comment.id} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Komentar"
        description="Yakin mau hapus komentar ini?"
        confirmText="Ya, Hapus"
        danger
        loading={isDeleting}
      />
    </div>
  );
}
