"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import { withQueryFallback } from "@/lib/apiWithFallback";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";
import { useEffect } from "react";

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery<AuthUser, Error, AuthUser>({
    queryKey: ["me"],
    queryFn: () =>
      withQueryFallback(
        () => userApi.get<{ user: AuthUser }>("/auth/me").then((r) => r.data.user),
        () => useAuthStore.getState().user as AuthUser,
      ),
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  return query;
}
