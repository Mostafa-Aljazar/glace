import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import UnifiedAuthForm from "@/components/Auth/UnifiedAuthForm";

export const metadata: Metadata = privatePageMetadata("تسجيل الدخول / إنشاء حساب");

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <UnifiedAuthForm />
    </Suspense>
  );
}
