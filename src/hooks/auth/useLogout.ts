import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => userApi.post("/auth/logout").then((r) => r.data),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.push("/auth/login");
    },
  });
}
