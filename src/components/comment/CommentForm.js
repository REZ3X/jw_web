"use client";

/**
 * CommentForm — input for adding a new comment or reply.
 */

import { useState } from "react";
import { Send } from "lucide-react";
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
      <div className="flex-1 relative">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isReply ? "Write a reply…" : "Add a comment…"}
          className="w-full px-4 py-2.5 pr-12 bg-surface-hover/50 border border-surface-border rounded-xl text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-jw-primary/30"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-jw-primary hover:bg-jw-primary/10 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
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
