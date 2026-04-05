/**
 * BFF: Single post operations.
 * GET    /api/posts/:id → backend
 * PUT    /api/posts/:id → backend
 * DELETE /api/posts/:id → backend
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/posts/${id}`);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/posts/${id}`, { method: "PUT" });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/posts/${id}`, { method: "DELETE" });
}
