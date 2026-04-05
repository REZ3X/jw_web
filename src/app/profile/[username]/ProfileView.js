"use client";

/**
 * ProfileView — client component showing public profile with posts/responses.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, MapPin, Settings, FileText, MessageCircle } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import PostCard from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useAuthStore } from "@/lib/store";
import { clientFetch } from "@/lib/api";
import { getRole, cn, formatDate, buildQuery } from "@/lib/utils";
import { GOV_ROLES } from "@/lib/constants";

export default function ProfileView({ profile }) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwn = user?.id === profile.id;
  const isGov = GOV_ROLES.includes(profile.role);
  const role = getRole(profile.role);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const qs = buildQuery({ per_page: 20 });
        const res = await clientFetch(`/api/users/${profile.username}/posts${qs}`);
        setPosts(res?.data?.posts || res?.data || []);
      } catch {}
      setLoading(false);
    };
    fetchPosts();
  }, [profile.username]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile header */}
      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden mb-6">
        {/* Banner gradient */}
        <div className="h-32 bg-gradient-to-r from-jw-primary/20 via-jw-secondary/20 to-jw-primary/10" />

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar
              src={profile.avatar_url}
              name={profile.name}
              size="2xl"
              isGovernment={isGov}
              className="ring-4 ring-surface"
            />
            <div className="flex-1 min-w-0 mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <Badge className={role.color}>{role.label}</Badge>
              </div>
              <p className="text-sm text-muted">@{profile.username}</p>
            </div>
            {isOwn && (
              <Link
                href="/profile/settings"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-border text-sm font-medium hover:bg-surface-hover transition-colors"
              >
                <Settings className="w-4 h-4" /> Edit Profile
              </Link>
            )}
          </div>

          {/* Bio + metadata */}
          <div className="mt-4 space-y-2">
            {profile.bio && (
              <p className="text-sm text-foreground/80">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts / Responses */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {isGov ? (
            <><MessageCircle className="w-5 h-5 text-jw-primary" /> Official Responses</>
          ) : (
            <><FileText className="w-5 h-5 text-jw-primary" /> Reports</>
          )}
        </h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={isGov ? MessageCircle : FileText}
          title={isGov ? "No responses yet" : "No reports yet"}
          description={isGov ? "This department hasn't responded to any reports" : "This user hasn't submitted any reports"}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
