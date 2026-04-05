/**
 * @file api.js — Unified API client for the JogjaWaskita BFF architecture.
 *
 * Server components call `serverFetch()` which reads the JWT from cookies
 * and forwards requests to the Rust backend directly.
 *
 * Client components call `clientFetch()` which calls Next.js API routes
 * (the BFF layer), never the Rust backend directly.
 *
 * BFF route handlers use `proxyToBackend()` to forward requests.
 */

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

/* ------------------------------------------------------------------ */
/*  Server-side: direct backend calls (used in RSC / server actions)   */
/* ------------------------------------------------------------------ */

/**
 * Fetch from the Rust backend on the server side.
 * Automatically attaches the JWT from cookies as a Bearer token.
 */
export async function serverFetch(path, options = {}) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("jw_token")?.value;

  const headers = { ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const url = `${BACKEND}${path}`;
  const res = await fetch(url, { ...options, headers, cache: "no-store" });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Backend ${res.status}`);
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  Client-side: calls the Next.js BFF API routes                      */
/* ------------------------------------------------------------------ */

/**
 * Fetch from the Next.js BFF `/api/…` routes (client components only).
 * Cookies are sent automatically by the browser.
 *
 * @param {string} path - API path starting with `/api/…`
 * @param {RequestInit} options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function clientFetch(path, options = {}) {
  const headers = { ...options.headers };


  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Request failed ${res.status}`);
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  BFF helpers: used inside Next.js API route handlers                */
/* ------------------------------------------------------------------ */

/** Extract proxy-ready headers (Authorization + Content-Type) from a request */
export function proxyHeaders(request) {
  const token = request.cookies.get("jw_token")?.value;
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const ct = request.headers.get("content-type");
  if (ct) headers["Content-Type"] = ct;
  return headers;
}

/**
 * Proxy a request to the Rust backend and return the response.
 * Handles JSON and multipart bodies transparently.
 *
 * @param {Request} request - Incoming Next.js API request
 * @param {string} backendPath - Backend path e.g. `/api/posts`
 * @param {object} [overrides] - Extra fetch options (method, etc.)
 */
export async function proxyToBackend(request, backendPath, overrides = {}) {
  const token = request.cookies.get("jw_token")?.value;
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const method = overrides.method || request.method;
  let body = undefined;

  if (method !== "GET" && method !== "HEAD") {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("multipart/form-data")) {
      // Stream the raw body for multipart
      body = await request.arrayBuffer();
      headers["Content-Type"] = ct;
    } else if (ct.includes("application/json")) {
      body = await request.text();
      headers["Content-Type"] = "application/json";
    } else {
      body = await request.text();
      if (ct) headers["Content-Type"] = ct;
    }
  }

  const url = `${BACKEND}${backendPath}`;
  const res = await fetch(url, { method, headers, body, cache: "no-store" });

  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}

export { BACKEND };
