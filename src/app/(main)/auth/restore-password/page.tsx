import type { Metadata } from "next";
import RestorePasswordForm from "@/components/Auth/RestorePasswordForm";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور | جلاسيه الأمير",
};

export default function RestorePasswordPage() {
  return <RestorePasswordForm />;
}
