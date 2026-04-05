/**
 * BFF: Current user endpoint.
 * GET  /api/auth/me → backend GET  /api/auth/me
 * PUT  /api/auth/me → backend PUT  /api/auth/me (profile update)
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request) {
  return proxyToBackend(request, "/api/auth/me");
}

export async function PUT(request) {
  return proxyToBackend(request, "/api/auth/me", { method: "PUT" });
}
