import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/Auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول | جلاسيه الأمير",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
