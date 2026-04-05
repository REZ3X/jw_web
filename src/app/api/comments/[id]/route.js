import { proxyToBackend } from "@/lib/api";

export async function PUT(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/comments/${id}`, { method: "PUT" });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/comments/${id}`, { method: "DELETE" });
}
