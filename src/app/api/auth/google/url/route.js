/**
 * BFF: Proxy Google OAuth URL request to backend.
 * GET /api/auth/google/url → backend /api/auth/google/url
 */
import { BACKEND } from "@/lib/api";

export async function GET() {
  const res = await fetch(`${BACKEND}/api/auth/google/url`, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}
