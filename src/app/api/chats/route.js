/**
 * BFF: Chat CRUD.
 * GET  /api/chats → list chats
 * POST /api/chats → create chat
 */
import { proxyToBackend } from "@/lib/api";

export async function GET(request) {
  const qs = new URL(request.url).search;
  return proxyToBackend(request, `/api/chats${qs}`);
}

export async function POST(request) {
  return proxyToBackend(request, "/api/chats", { method: "POST" });
}
