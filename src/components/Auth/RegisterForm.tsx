"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/Auth/AuthLayout";
import PhoneOtpFlow from "@/components/Auth/PhoneOtpFlow";
import { useAuthStore } from "@/store/authStore";

export default function RegisterForm() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) router.replace("/my-account");
  }, [isLoggedIn, router]);

  if (isLoggedIn) return null;

  return (
    <AuthLayout
      title="تسجيل الدخول / إنشاء حساب"
      subtitle="أدخل رقم جوالك لتسجيل الدخول أو إنشاء حساب جديد"
      activeHref="/auth/register"
    >
      <PhoneOtpFlow />
    </AuthLayout>
  );
}
