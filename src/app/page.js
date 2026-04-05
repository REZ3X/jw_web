import HomeFeed from "./HomeFeed";
import { serverFetch } from "@/lib/api";

/**
 * Home page — public post feed with trending sidebar.
 * Server-fetches initial posts for fast first paint.
 */
export default async function HomePage() {
  let initialPosts = [];
  try {
    const res = await serverFetch("/api/posts?sort=recent&per_page=20");
    initialPosts = res?.data?.posts || [];
  } catch {

  }

  return <HomeFeed initialPosts={initialPosts} />;
}
