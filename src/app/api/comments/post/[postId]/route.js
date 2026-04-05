/**
 * BFF: Comments for a post.
 * GET  /api/comments/post/:postId → list comments
 * POST /api/comments/post/:postId → create comment
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request, { params }) {
  const { postId } = await params;
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `/api/comments/post/${postId}${qs}`);
}

export async function POST(request, { params }) {
  const { postId } = await params;
  return proxyToBackend(request, `/api/comments/post/${postId}`, { method: "POST" });
}
