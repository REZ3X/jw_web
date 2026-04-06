/**
 * BFF: Proxy user search to backend.
 * GET /api/users/search?q=...&limit=...
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limit = searchParams.get("limit") || "20";
  return proxyToBackend(request, `/api/users/search?q=${encodeURIComponent(q)}&limit=${limit}`);
}
