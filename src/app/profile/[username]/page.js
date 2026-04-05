import ProfileView from "./ProfileView";
import { serverFetch } from "@/lib/api";
import { notFound } from "next/navigation";

/**
 * Public profile page — server-fetches user data and shows posts or responses.
 */
export async function generateMetadata({ params }) {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }) {
  const { username } = await params;

  let profile = null;
  try {
    const res = await serverFetch(`/api/users/${username}`);
    profile = res?.data || null;
  } catch {
    notFound();
  }

  if (!profile) notFound();

  return <ProfileView profile={profile} />;
}
