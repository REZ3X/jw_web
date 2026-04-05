/** BFF: Proxy email verification + resend */
import { proxyToBackend, BACKEND } from "@/lib/api";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  return proxyToBackend(request, `/api/auth/verify-email?token=${encodeURIComponent(token || "")}`);
}
