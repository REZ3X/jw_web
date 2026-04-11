"use client";

/**
 * VoteButtons — compact upvote/downvote row.
 */

import { useState } from "react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi2";
import { motion } from "framer-motion";
import { clientFetch } from "@/lib/api";
import { cn, formatCount } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function VoteButtons({ type, id, upvotes: initUp, downvotes: initDown, myVote: initVote }) {
  const { user } = useAuthStore();
  const [upvotes, setUpvotes] = useState(initUp || 0);
  const [downvotes, setDownvotes] = useState(initDown || 0);
  const [myVote, setMyVote] = useState(initVote);

  const vote = async (voteType) => {
    if (!user) { toast.error("Sign in to vote"); return; }
    if (!user.email_verified) { toast.error("Verify your email to vote"); return; }

    const urlMap = {
      post: `/api/posts/${id}/vote`,
      comment: `/api/votes/comment/${id}`,
      subcomment: `/api/votes/subcomment/${id}`,
    };

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
    <div className="inline-flex items-center rounded-lg bg-bg-inset border border-border-subtle">
      <motion.button
        whileTap={{ scale: 1.15 }}
        onClick={() => vote("up")}
        className={cn(
          "flex items-center px-2 py-1 rounded-l-lg transition-colors duration-150 cursor-pointer",
          myVote === "up"
            ? "text-jw-mint bg-jw-accent/15"
            : "text-text-muted hover:text-jw-accent"
        )}
        title="Upvote"
      >
        <HiChevronUp className="w-4.5 h-4.5" />
      </motion.button>

      <span className={cn(
        "text-xs font-bold min-w-[1.5rem] text-center tabular-nums select-none",
        score > 0 ? "text-jw-mint" : score < 0 ? "text-danger" : "text-text-dim"
      )}>
        {formatCount(score)}
      </span>

      <motion.button
        whileTap={{ scale: 1.15 }}
        onClick={() => vote("down")}
        className={cn(
          "flex items-center px-2 py-1 rounded-r-lg transition-colors duration-150 cursor-pointer",
          myVote === "down"
            ? "text-danger bg-danger/10"
            : "text-text-muted hover:text-danger"
        )}
        title="Downvote"
      >
        <HiChevronDown className="w-4.5 h-4.5" />
      </motion.button>
    </div>
  );
}
