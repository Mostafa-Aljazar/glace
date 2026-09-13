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

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

function extractErrorMessage(error: any): string {
  const status = error?.response?.status;
  if (status === 429) {
    return "لقد تجاوزت الحد المسموح من المحاولات، الرجاء الانتظار قليلاً ثم إعادة المحاولة";
  }
  const message = error?.response?.data?.message;
  if (message) return message;
  return "حدث خطأ غير متوقع، الرجاء المحاولة مرة أخرى";
}

export function useSendOtp() {
  return useMutation({
    mutationFn: async (data: SendOtpPayload) => {
      try {
        const response = await userApi.post<ApiEnvelope<SendOtpResponse>>(
          "/auth/otp/send",
          data,
        );
        return response.data.data;
      } catch (error: any) {
        throw new Error(extractErrorMessage(error));
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
        const response = await userApi.post<ApiEnvelope<VerifyOtpResponse>>(
          "/auth/otp/verify",
          data,
        );
        return response.data.data;
      } catch (error: any) {
        throw new Error(extractErrorMessage(error));
      }
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      const redirect = searchParams.get("redirect");
      router.push(redirect && redirect.startsWith("/") ? redirect : "/my-account");
    },
  });
}
