"use client";

/**
 * CommentItem — single comment with replies support.
 * Supports pinning, editing, deleting, and expanding reply thread.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown, ChevronUp, Pin, MoreHorizontal, Trash2, Pencil, Image as ImageIcon,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import VoteButtons from "@/components/post/VoteButtons";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import CommentForm from "./CommentForm";
import SubCommentItem from "./SubCommentItem";
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
      toast.error("Failed to load replies");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    try {
      await clientFetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      onDeleted?.(comment.id);
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePin = async () => {
    try {
      await clientFetch(`/api/comments/${comment.id}/pin`, { method: "POST" });
      toast.success(comment.is_pinned ? "Unpinned" : "Pinned");
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
    <div className={cn("py-3", comment.is_pinned && "bg-jw-primary/5 rounded-xl px-3 -mx-3")}>
      {comment.is_pinned && (
        <div className="flex items-center gap-1 text-xs text-jw-primary font-medium mb-1.5">
          <Pin className="w-3 h-3" /> Pinned
        </div>
      )}

      <div className="flex gap-3">
        <Link href={`/profile/${comment.username}`} className="shrink-0">
          <Avatar src={comment.user_avatar} name={comment.user_name} size="sm" isGovernment={isGov} />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-0.5">
            <Link href={`/profile/${comment.username}`} className="text-sm font-semibold hover:text-jw-primary transition-colors">
              {comment.user_name}
            </Link>
            {comment.is_official && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px]">
                Official Response
              </Badge>
            )}
            <span className="text-xs text-muted">{timeAgo(comment.created_at)}</span>
            {comment.is_edited && <span className="text-xs text-muted-light">(edited)</span>}

            {/* Actions dropdown */}
            {(isOwner || isPostOwner) && (
              <Dropdown
                trigger={<MoreHorizontal className="w-4 h-4 text-muted hover:text-foreground" />}
              >
                {isPostOwner && (
                  <DropdownItem onClick={handlePin}>
                    <Pin className="w-3.5 h-3.5" /> {comment.is_pinned ? "Unpin" : "Pin"}
                  </DropdownItem>
                )}
                {isOwner && (
                  <DropdownItem danger onClick={handleDelete}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </DropdownItem>
                )}
              </Dropdown>
            )}
          </div>

          {/* Content */}
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{comment.content}</p>

          {/* Official image */}
          {comment.official_image_url && (
            <div className="mt-2 rounded-xl overflow-hidden max-w-sm">
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
                className="text-xs text-muted hover:text-jw-primary font-medium transition-colors cursor-pointer"
              >
                Reply
              </button>
            )}
            {comment.reply_count > 0 && (
              <button
                onClick={loadReplies}
                className="flex items-center gap-1 text-xs text-jw-primary font-medium hover:text-jw-primary-light transition-colors cursor-pointer"
              >
                {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {comment.reply_count} {comment.reply_count === 1 ? "reply" : "replies"}
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
            <div className="mt-3 space-y-1 pl-2 border-l-2 border-surface-border">
              {replies.map((reply) => (
                <SubCommentItem key={reply.id} reply={reply} commentId={comment.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
