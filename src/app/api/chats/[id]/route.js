/**
 * BFF: Single chat operations.
 * GET    /api/chats/:id
 * PUT    /api/chats/:id
 * DELETE /api/chats/:id
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/chats/${id}`);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/chats/${id}`, { method: "PUT" });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/chats/${id}`, { method: "DELETE" });
}
