"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import { withQueryFallback } from "@/lib/apiWithFallback";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";
import { useEffect } from "react";

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery<AuthUser, Error, AuthUser>({
    queryKey: ["me"],
    queryFn: () =>
      withQueryFallback(
        () => userApi.get<{ user: AuthUser }>("/auth/me").then((r) => r.data.user),
        // Fallback to cached user from store if API fails or offline. Read
        // at call time so the fallback never returns a stale closure value.
        () => useAuthStore.getState().user as AuthUser,
      ),
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
    // Render the cached user immediately, but mark it as stale (updated at
    // epoch 0) so /auth/me is still fetched on mount instead of trusting
    // the cache for the full staleTime.
    initialData: user ?? undefined,
    initialDataUpdatedAt: 0,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  return query;
}
