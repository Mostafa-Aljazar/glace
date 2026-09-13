import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { userApi } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

interface SendOtpPayload {
  phone: string;
}

interface SendOtpResponse {
  userExists: boolean;
}

interface VerifyOtpPayload {
  phone: string;
  code: string;
  fullName?: string;
}

interface VerifyOtpResponse {
  token: string;
  user: AuthUser;
}

export function useSendOtp() {
  return useMutation({
    mutationFn: async (data: SendOtpPayload) => {
      try {
        const response = await userApi.post<SendOtpResponse>("/auth/otp/send", data);
        return response.data;
      } catch (error: any) {
        if (error?.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw error;
      }
    },
  });
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: async (data: VerifyOtpPayload) => {
      try {
        const response = await userApi.post<VerifyOtpResponse>("/auth/otp/verify", data);
        return response.data;
      } catch (error: any) {
        // Extract and throw error message from backend
        if (error?.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw error;
      }
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      const redirect = searchParams.get("redirect");
      router.push(redirect && redirect.startsWith("/") ? redirect : "/my-account");
    },
  });
}
