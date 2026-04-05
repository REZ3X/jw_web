import { proxyToBackend } from "@/lib/api";
export async function POST(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/comments/${id}/pin`, { method: "POST" });
}
