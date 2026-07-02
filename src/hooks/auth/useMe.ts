import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["me"],
    queryFn: () =>
      api.get<{ user: AuthUser }>("/auth/me").then((r) => {
        setUser(r.data.user);
        return r.data.user;
      }),
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
  });
}
