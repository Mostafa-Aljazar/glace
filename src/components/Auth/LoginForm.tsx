"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/Auth/AuthLayout";
import PhoneOtpFlow from "@/components/Auth/PhoneOtpFlow";
import { useAuthStore } from "@/store/authStore";

export default function LoginForm() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoggedIn) return;
    const redirect = searchParams.get("redirect");
    router.replace(redirect && redirect.startsWith("/") ? redirect : "/my-account");
  }, [isLoggedIn, router, searchParams]);

  if (isLoggedIn) return null;

  return (
    <AuthLayout title="تسجيل الدخول" subtitle="أهلا وسهلاً أهلاً بعودتكْ" activeHref="/auth/login">
      <PhoneOtpFlow
        mode="login"
        switchLinkHref="/auth/register"
        switchLinkLabel="إنشاء حساب"
        switchLinkText="لا تمتلكِ حساب؟"
      />
    </AuthLayout>
  );
}
