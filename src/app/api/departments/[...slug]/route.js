/**
 * BFF: Catch-all proxy for department endpoints.
 * Handles dashboard, posts, status updates, responses.
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request, { params }) {
  const { slug } = await params;
  const path = `/api/departments/${slug.join("/")}`;
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `${path}${qs}`);
}

export async function POST(request, { params }) {
  const { slug } = await params;
  const path = `/api/departments/${slug.join("/")}`;
  return proxyToBackend(request, path, { method: "POST" });
}

export async function PUT(request, { params }) {
  const { slug } = await params;
  const path = `/api/departments/${slug.join("/")}`;
  return proxyToBackend(request, path, { method: "PUT" });
}
