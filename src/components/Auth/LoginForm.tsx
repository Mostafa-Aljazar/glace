"use client";

import AuthLayout from "@/components/Auth/AuthLayout";
import PhoneOtpFlow from "@/components/Auth/PhoneOtpFlow";

export default function LoginForm() {
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
