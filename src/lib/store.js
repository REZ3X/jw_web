/**
 * @file store.js — Zustand client-side state management.
 *
 * Stores the authenticated user object fetched from `/api/auth/me`.
 * Used by AuthProvider and consumed by client components that need
 * access to the current user without prop drilling.
 */

import { create } from "zustand";

export const useAuthStore = create((set) => ({
  /** Current authenticated user or null */
  user: null,
  /** Whether the initial auth check has completed */
  loaded: false,

  /** Set the user after a successful auth check */
  setUser: (user) => set({ user, loaded: true }),

  /** Mark loading as complete (even if no user) */
  setLoaded: () => set({ loaded: true }),

  /** Clear user state (logout) */
  clearUser: () => set({ user: null, loaded: true }),
}));
