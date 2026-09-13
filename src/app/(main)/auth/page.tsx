import type { Metadata } from "next";
import { Suspense } from "react";
import UnifiedAuthForm from "@/components/Auth/UnifiedAuthForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول / إنشاء حساب | جلاسيه الأمير",
};

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <UnifiedAuthForm />
    </Suspense>
  );
}
