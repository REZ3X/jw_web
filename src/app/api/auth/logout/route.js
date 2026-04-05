/**
 * BFF: Logout — clear the JWT cookie and redirect to home.
 * POST /api/auth/logout
 */
export async function POST() {
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    "jw_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  );
  return response;
}
