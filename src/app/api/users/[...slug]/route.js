/**
 * BFF: Catch-all proxy for user endpoints.
 * /api/users/:username, /api/users/:username/posts, /api/users/me/avatar
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request, { params }) {
  const { slug } = await params;
  const path = `/api/users/${slug.join("/")}`;
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `${path}${qs}`);
}

export async function POST(request, { params }) {
  const { slug } = await params;
  const path = `/api/users/${slug.join("/")}`;
  return proxyToBackend(request, path, { method: "POST" });
}

export async function DELETE(request, { params }) {
  const { slug } = await params;
  const path = `/api/users/${slug.join("/")}`;
  return proxyToBackend(request, path, { method: "DELETE" });
}
