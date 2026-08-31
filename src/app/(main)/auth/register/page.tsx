import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterForm from "@/components/Auth/RegisterForm";

export const metadata: Metadata = {
  title: "إنشاء حساب | جلاسيه الأمير",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
