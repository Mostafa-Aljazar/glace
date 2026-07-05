import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) =>
      userApi.post<LoginResponse>("/auth/login", data).then((r) => r.data),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      router.push("/my-account");
    },
  });
}
