/**
 * BFF: Chat messages.
 * GET  /api/chats/:id/messages → list messages
 * POST /api/chats/:id/messages → send message
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request, { params }) {
  const { id } = await params;
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `/api/chats/${id}/messages${qs}`);
}

export async function POST(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/api/chats/${id}/messages`, { method: "POST" });
}
