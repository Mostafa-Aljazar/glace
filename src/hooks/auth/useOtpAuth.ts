import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
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

/** Backend auth isn't live yet — fake sending/verifying an OTP locally
 *  instead of calling `/auth/otp/send` and `/auth/otp/verify`. Swap back to
 *  the userApi.post calls once the backend endpoints are ready. */
function fakeSendOtp(_data: SendOtpPayload): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

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
    mutationFn: fakeSendOtp,
  });
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: fakeVerifyOtp,
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      const redirect = searchParams.get("redirect");
      router.push(redirect && redirect.startsWith("/") ? redirect : "/my-account");
    },
  });
}
