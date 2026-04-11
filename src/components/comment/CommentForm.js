"use client";

/**
 * CommentForm — input for adding a new comment or reply.
 */

import { useState } from "react";
import { HiPaperAirplane } from "react-icons/hi2";
import { clientFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Avatar from "@/components/ui/Avatar";
import toast from "react-hot-toast";

export default function CommentForm({ postId, commentId, isReply, onAdded, onCancel }) {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      let res;
      if (isReply && commentId) {

        res = await clientFetch(`/api/comments/${commentId}/replies`, {
          method: "POST",
          body: JSON.stringify({ content, reply_to_user_id: null }),
        });
      } else {

        res = await clientFetch(`/api/comments/post/${postId}`, {
          method: "POST",
          body: JSON.stringify({ content }),
        });
      }
      setContent("");
      onAdded?.(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to post comment");
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2.5">
      <Avatar src={user.avatar_url} name={user.name} size="sm" />
      <div className="flex-1 relative group">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={user.email_verified ? (isReply ? "Write a reply…" : "Add a comment…") : "Verify your email to comment"}
          className="w-full px-4 py-2.5 pr-12 bg-surface border border-surface-border rounded-xl text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-jw-accent/30 focus:border-jw-accent/40 text-foreground transition-all duration-300"
          disabled={submitting || !user.email_verified}
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting || !user.email_verified}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-jw-accent hover:bg-jw-accent/10 disabled:opacity-30 transition-all duration-200 cursor-pointer"
        >
          <HiPaperAirplane className="w-4 h-4" />
        </button>
      </div>
      {isReply && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted hover:text-foreground transition-colors mt-2.5 cursor-pointer"
        >
          Cancel
        </button>
      )}
    </form>
  );
}
