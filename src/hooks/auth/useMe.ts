"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";
import { useEffect } from "react";

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery<AuthUser, Error, AuthUser>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await userApi.get<{ user: AuthUser }>("/auth/me");
      return res.data.user;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  return query;
}
