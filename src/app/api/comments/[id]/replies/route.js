import { proxyToBackend } from "@/lib/api";

export async function GET(request, { params }) {
  const { id } = await params;
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `/api/comments/${id}/replies${qs}`);
}

export async function POST(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/comments/${id}/replies`, { method: "POST" });
}
