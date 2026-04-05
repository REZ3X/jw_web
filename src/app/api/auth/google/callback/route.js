/**
 * BFF: Handle Google OAuth callback.
 *
 * Exchanges the OAuth `code` with the backend, receives a JWT token,
 * sets it as an HttpOnly cookie, and redirects the user to the home page.
 *
 * GET /api/auth/google/callback?code=XXX
 */
import { BACKEND } from "@/lib/api";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return Response.redirect(new URL("/auth/login?error=missing_code", request.url));
  }

  try {
    const res = await fetch(
      `${BACKEND}/api/auth/google/callback?code=${encodeURIComponent(code)}`,
      { cache: "no-store" }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.data?.token) {
      return Response.redirect(new URL("/auth/login?error=auth_failed", request.url));
    }


    const token = data.data.token;
    const isNew = data.data.is_new_user;
    const redirectUrl = new URL(isNew ? "/?welcome=true" : "/", request.url);

    const response = Response.redirect(redirectUrl);


    const isProd = process.env.NODE_ENV === "production";
    response.headers.set(
      "Set-Cookie",
      `jw_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${isProd ? "; Secure" : ""}`
    );

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return Response.redirect(new URL("/auth/login?error=server_error", request.url));
  }
}
