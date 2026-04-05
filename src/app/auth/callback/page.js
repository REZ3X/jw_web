/**
 * Auth Callback Page — handles the redirect from Google OAuth.
 * Actually handled by the API route, so this page just shows a loading state
 * in case the user lands here directly.
 */

import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage({ searchParams }) {

  redirect("/auth/login?error=auth_failed");
}
