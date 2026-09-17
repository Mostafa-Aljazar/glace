"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/Auth/AuthLayout";
import PhoneOtpFlow from "@/components/Auth/PhoneOtpFlow";
import { useAuthStore } from "@/store/authStore";

export default function UnifiedAuthForm() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!hasHydrated || !isLoggedIn) return;
    const redirect = searchParams.get("redirect");
    router.replace(
      redirect && redirect.startsWith("/") ? redirect : "/my-account",
    );
  }, [hasHydrated, isLoggedIn, router, searchParams]);

  if (!hasHydrated || isLoggedIn) return null;

  return (
    <AuthLayout
      title="تسجيل الدخول / إنشاء حساب"
      subtitle="أدخل رقم جوالك لتسجيل الدخول أو إنشاء حساب جديد"
      activeHref="/auth"
    >
      <PhoneOtpFlow />
    </AuthLayout>
  );
}
