"use client";

/**
 * SubCommentItem — reply within a comment thread.
 * Shows the @mention tag for nested replies.
 */

import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import VoteButtons from "@/components/post/VoteButtons";
import { timeAgo } from "@/lib/utils";
import { GOV_ROLES } from "@/lib/constants";

export default function SubCommentItem({ reply, commentId }) {
  const isGov = GOV_ROLES.includes(reply.user_role);

  return (
    <div className="flex gap-2.5 py-2.5">
      <Link href={`/profile/${reply.username}`} className="shrink-0">
        <Avatar src={reply.user_avatar} name={reply.user_name} size="xs" isGovernment={isGov} />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Link href={`/profile/${reply.username}`} className="text-xs font-semibold hover:text-jw-primary transition-colors">
            {reply.user_name}
          </Link>
          {reply.is_official && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px]">
              Official
            </Badge>
          )}
          <span className="text-[11px] text-muted">{timeAgo(reply.created_at)}</span>
          {reply.is_edited && <span className="text-[11px] text-muted-light">(edited)</span>}
        </div>

        <p className="text-sm leading-relaxed text-foreground/90">
          {reply.reply_to_username && (
            <Link
              href={`/profile/${reply.reply_to_username}`}
              className="text-jw-primary font-medium mr-1"
            >
              @{reply.reply_to_username}
            </Link>
          )}
          {reply.content}
        </p>

        <div className="mt-1.5">
          <VoteButtons
            type="subcomment"
            id={reply.id}
            upvotes={reply.upvote_count}
            downvotes={reply.downvote_count}
            myVote={reply.my_vote}
            compact
          />
        </div>
      </div>
    </div>
  );
}
