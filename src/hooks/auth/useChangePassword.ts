import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";

interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) =>
      userApi.put("/auth/password", data).then((r) => r.data),
  });
}
