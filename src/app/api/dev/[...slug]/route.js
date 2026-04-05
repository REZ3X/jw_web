/**
 * BFF: Catch-all proxy for dev admin endpoints.
 * /api/dev/users, /api/dev/users/:id/role, /api/dev/analytics/overview
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request, { params }) {
  const { slug } = await params;
  const path = `/api/dev/${slug.join("/")}`;
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `${path}${qs}`);
}

export async function PUT(request, { params }) {
  const { slug } = await params;
  const path = `/api/dev/${slug.join("/")}`;
  return proxyToBackend(request, path, { method: "PUT" });
}
