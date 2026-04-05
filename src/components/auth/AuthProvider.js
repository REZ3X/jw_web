"use client";

/**
 * AuthProvider — wraps the app to fetch and provide the current user.
 *
 * On mount, fetches `/api/auth/me`. If authenticated, stores the user
 * in the Zustand auth store. All client components can then read
 * the user from `useAuthStore()`.
 */

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";

export default function AuthProvider({ children, initialUser }) {
  const { setUser, setLoaded } = useAuthStore();

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    } else {

      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.data) setUser(data.data);
          else setLoaded();
        })
        .catch(() => setLoaded());
    }
  }, [initialUser, setUser, setLoaded]);

  return children;
}
