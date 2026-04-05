/**
 * @file auth.js — Server-side auth helpers.
 *
 * `getUser()` is the primary helper, used in server components and
 * layouts to read the current user from the JWT cookie.
 */

import { serverFetch } from "./api";

/**
 * Read the current authenticated user from the backend.
 * Returns `null` if not logged in or token is invalid.
 * Safe to call in any server component — never throws.
 */
export async function getUser() {
  try {
    const res = await serverFetch("/api/auth/me");
    return res?.data || null;
  } catch {
    return null;
  }
}

/** Check if a role string is a government department role */
export function isGovRole(role) {
  return [
    "city_major_gov",
    "fire_department",
    "health_department",
    "environment_department",
    "police_department",
  ].includes(role);
}

/** Check if user has dev role */
export function isDevRole(role) {
  return role === "dev";
}
