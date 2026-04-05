import { proxyToBackend } from "@/lib/api";
export async function POST(request) {
  return proxyToBackend(request, "/api/auth/resend-verification", { method: "POST" });
}
