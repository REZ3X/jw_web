/**
 * BFF: Catch-all proxy for analytics endpoints.
 * /api/analytics/trending-tags, /api/analytics/stats, etc.
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request, { params }) {
  const { slug } = await params;
  const path = `/api/analytics/${slug.join("/")}`;
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `${path}${qs}`);
}
