import { proxyToBackend } from "@/lib/api";
export async function POST(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/votes/post/${id}`, { method: "POST" });
}
