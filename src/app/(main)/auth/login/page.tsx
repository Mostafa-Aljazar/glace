import type { Metadata } from "next";
import LoginForm from "@/components/Auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول | جلاسيه الأمير",
};

export default function LoginPage() {
  return <LoginForm />;
}
