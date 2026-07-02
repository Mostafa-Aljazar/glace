import type { Metadata } from "next";
import RegisterForm from "@/components/Auth/RegisterForm";

export const metadata: Metadata = {
  title: "إنشاء حساب | جلاسيه الأمير",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
