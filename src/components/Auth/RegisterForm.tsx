"use client";

import AuthLayout from "@/components/Auth/AuthLayout";
import PhoneOtpFlow from "@/components/Auth/PhoneOtpFlow";

export default function RegisterForm() {
  return (
    <AuthLayout
      title="إنشاء الحساب"
      subtitle="يمكنك إنشاء حساب جديد بكل سهولة"
      activeHref="/auth/register"
    >
      <PhoneOtpFlow
        mode="register"
        switchLinkHref="/auth/login"
        switchLinkLabel="تسجيل الدخول"
        switchLinkText="أمتلك حساب بالفعل؟"
      />
    </AuthLayout>
  );
}
