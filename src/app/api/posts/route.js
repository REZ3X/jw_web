/**
 * BFF: Posts list + create.
 * GET  /api/posts?...filters → backend GET  /api/posts
 * POST /api/posts (multipart) → backend POST /api/posts
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request) {
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `/api/posts${qs}`);
}

export async function POST(request) {
  return proxyToBackend(request, "/api/posts", { method: "POST" });
}
