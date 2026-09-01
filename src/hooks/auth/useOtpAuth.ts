import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { userApi } from "@/lib/axios";
import { withMutationFallback } from "@/lib/apiWithFallback";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

interface SendOtpPayload {
  phone: string;
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

/** Fallback when `/auth/otp/send` isn't live yet — fakes the SMS delay. */
function fakeSendOtp(_data: SendOtpPayload): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

/** Fallback when `/auth/otp/verify` isn't live yet — accepts the fixed demo
 *  code "123456" so the rest of the app can still be exercised end to end. */
function fakeVerifyOtp(data: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (data.code !== "123456") {
        reject(new Error("رمز التحقق غير صحيح"));
        return;
      }
      resolve({
        token: "fake-token-" + Date.now(),
        user: {
          id: 1,
          name: data.fullName || "مستخدم",
          email: "",
          phone: data.phone,
        },
      });
    }, 500),
  );
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (data: SendOtpPayload) =>
      withMutationFallback(
        () => userApi.post("/auth/otp/send", data).then(() => undefined),
        () => fakeSendOtp(data),
      ),
  });
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: (data: VerifyOtpPayload) =>
      withMutationFallback(
        () =>
          userApi
            .post<VerifyOtpResponse>("/auth/otp/verify", data)
            .then((r) => r.data),
        () => fakeVerifyOtp(data),
      ),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      const redirect = searchParams.get("redirect");
      router.push(redirect && redirect.startsWith("/") ? redirect : "/my-account");
    },
  });
}
