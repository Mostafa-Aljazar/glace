import type { Metadata } from "next";
import PrivacyPanel from "@/components/Account/dashboard/panels/PrivacyPanel";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | جلاسيه الأمير",
};

export default function MyAccountPrivacyPage() {
  return <PrivacyPanel />;
}
