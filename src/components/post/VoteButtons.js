"use client";

/**
 * VoteButtons — upvote/downvote with animated pop effect.
 * Supports posts, comments, and subcomments via the `type` prop.
 */

import { useState } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { clientFetch } from "@/lib/api";
import { cn, formatCount } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

/**
 * @param {"post"|"comment"|"subcomment"} type
 * @param {string} id - Entity ID
 * @param {number} upvotes
 * @param {number} downvotes
 * @param {string|null} myVote - "up", "down", or null
 */
export default function VoteButtons({ type, id, upvotes: initUp, downvotes: initDown, myVote: initVote, compact }) {
  const { user } = useAuthStore();
  const [upvotes, setUpvotes] = useState(initUp || 0);
  const [downvotes, setDownvotes] = useState(initDown || 0);
  const [myVote, setMyVote] = useState(initVote);
  const [animating, setAnimating] = useState(null);

  const vote = async (voteType) => {
    if (!user) {
      toast.error("Sign in to vote");
      return;
    }

    const urlMap = {
      post: `/api/posts/${id}/vote`,
      comment: `/api/votes/comment/${id}`,
      subcomment: `/api/votes/subcomment/${id}`,
    };

    setAnimating(voteType);
    setTimeout(() => setAnimating(null), 300);

    try {
      const res = await clientFetch(urlMap[type], {
        method: "POST",
        body: JSON.stringify({ vote_type: voteType }),
      });

      const data = res.data || res;
      setUpvotes(data.upvote_count);
      setDownvotes(data.downvote_count);
      setMyVote(data.voted ? data.vote_type : null);
    } catch (err) {
      toast.error(err.message || "Vote failed");
    }
  };

  const score = upvotes - downvotes;

  return (
    <div className={cn("flex items-center rounded-xl bg-surface-hover/60", compact ? "gap-0" : "gap-0")}>
      <button
        onClick={() => vote("up")}
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded-l-xl transition-colors cursor-pointer",
          myVote === "up"
            ? "text-jw-primary bg-jw-primary/10"
            : "text-muted hover:text-jw-primary hover:bg-jw-primary/5",
          animating === "up" && "animate-vote-pop"
        )}
        title="Upvote"
      >
        <ArrowBigUp className={cn("w-5 h-5", myVote === "up" && "fill-current")} />
      </button>

      <span className={cn(
        "text-xs font-semibold min-w-[2ch] text-center tabular-nums",
        score > 0 ? "text-jw-primary" : score < 0 ? "text-red-500" : "text-muted"
      )}>
        {formatCount(score)}
      </span>

      <button
        onClick={() => vote("down")}
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded-r-xl transition-colors cursor-pointer",
          myVote === "down"
            ? "text-red-500 bg-red-500/10"
            : "text-muted hover:text-red-500 hover:bg-red-500/5",
          animating === "down" && "animate-vote-pop"
        )}
        title="Downvote"
      >
        <ArrowBigDown className={cn("w-5 h-5", myVote === "down" && "fill-current")} />
      </button>
    </div>
  );
}
