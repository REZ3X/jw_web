"use client";

/**
 * CommentSection — loads and displays comments for a post.
 * Includes sort selector, comment list, and new comment form.
 */

import { useState, useEffect, useCallback } from "react";
import { HiAdjustmentsHorizontal, HiChatBubbleOvalLeft } from "react-icons/hi2";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { CommentSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { clientFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { COMMENT_SORT_OPTIONS } from "@/lib/constants";
import { cn, buildQuery } from "@/lib/utils";

export default function CommentSection({ postId, postOwnerId }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchComments = useCallback(async (p = 1, append = false) => {
    try {
      const qs = buildQuery({ sort, page: p, per_page: 15 });
      const res = await clientFetch(`/api/comments/post/${postId}${qs}`);
      const data = res.data || [];
      const list = Array.isArray(data) ? data : data.comments || data;
      setComments((prev) => (append ? [...prev, ...list] : list));
      setHasMore(list.length >= 15);
    } catch {}
    setLoading(false);
  }, [postId, sort]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchComments(1);
  }, [fetchComments]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchComments(next, true);
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <div>
      {/* Header + Sort */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <HiChatBubbleOvalLeft className="w-4 h-4 text-jw-accent" />
          Comments
        </h3>
        <div className="flex items-center gap-1">
          <HiAdjustmentsHorizontal className="w-3.5 h-3.5 text-muted" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs bg-transparent border-none text-muted focus:outline-none cursor-pointer"
          >
            {COMMENT_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface text-foreground">{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* New comment form */}
      {user && (
        <div className="mb-4">
          <CommentForm postId={postId} onAdded={handleCommentAdded} />
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="space-y-3">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          icon={HiChatBubbleOvalLeft}
          title="No comments yet"
          description="Be the first to comment on this report"
          className="py-8"
        />
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postOwnerId={postOwnerId}
              onDeleted={(id) => setComments((prev) => prev.filter((c) => c.id !== id))}
            />
          ))}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="w-full py-2 text-sm text-jw-accent font-semibold hover:text-jw-highlight transition-colors cursor-pointer"
            >
              Load more comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}
