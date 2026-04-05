/**
 * BFF: Catch-all proxy for log endpoints (dev only).
 * /api/logs/auth, /api/logs/activity
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request, { params }) {
  const { slug } = await params;
  const path = `/api/logs/${slug.join("/")}`;
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `${path}${qs}`);
}
