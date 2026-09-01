import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import { withMutationFallback } from "@/lib/apiWithFallback";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

interface UpdateProfilePayload {
  name: string;
  email?: string;
  phone?: string;
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      withMutationFallback(
        () =>
          userApi
            .put<{ user: AuthUser }>("/auth/profile", data)
            .then((r) => r.data.user),
        () => ({ ...(useAuthStore.getState().user as AuthUser), ...data }),
      ),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(["me"], user);
    },
  });
}
