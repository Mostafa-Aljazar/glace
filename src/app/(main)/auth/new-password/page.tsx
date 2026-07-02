import type { Metadata } from "next";
import NewPasswordForm from "@/components/Auth/NewPasswordForm";

export const metadata: Metadata = {
  title: "كلمة المرور الجديدة | جلاسيه الأمير",
};

export default function NewPasswordPage() {
  return <NewPasswordForm />;
}
