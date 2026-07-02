import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

interface RegisterResponse {
  token: string;
  user: AuthUser;
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterPayload) =>
      api.post<RegisterResponse>("/auth/register", data).then((r) => r.data),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      router.push("/my-account");
    },
  });
}
