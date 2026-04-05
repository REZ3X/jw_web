import { proxyToBackend } from "@/lib/api";
export async function GET(request) {
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `/api/posts/me${qs}`);
}
