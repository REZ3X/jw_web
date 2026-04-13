/**
 * BFF: Handle Google OAuth callback.
 *
 * Exchanges the OAuth `code` with the backend, receives a JWT token,
 * sets it as an HttpOnly cookie, and redirects the user to the home page.
 *
 * GET /api/auth/google/callback?code=XXX
 */
import { BACKEND } from "@/lib/api";
import { NextResponse } from "next/server";

/**
 * Resolve the public-facing origin so redirects go to the real domain
 * instead of the internal server address (e.g. 0.0.0.0 / 127.0.0.1).
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL env var (most explicit)
 *  2. x-forwarded-host + x-forwarded-proto headers (set by reverse proxy)
 *  3. host header
 *  4. request.url as last resort (works in local dev)
 */
function getPublicOrigin(request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }

  const fwdHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (fwdHost) {
    const proto = request.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${fwdHost}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const origin = getPublicOrigin(request);

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=missing_code", origin));
  }

  try {
    const res = await fetch(
      `${BACKEND}/api/auth/google/callback?code=${encodeURIComponent(code)}`,
      { cache: "no-store" }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.data?.token) {
      return NextResponse.redirect(new URL("/auth/login?error=auth_failed", origin));
    }

    const token = data.data.token;
    const isNew = data.data.is_new_user;
    const redirectUrl = new URL(isNew ? "/?welcome=true" : "/", origin);

    const response = NextResponse.redirect(redirectUrl);

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("jw_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      secure: isProd
    });

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/auth/login?error=server_error", origin));
  }
}
