import type { Metadata } from "next";
import SecurityPanel from "@/components/Account/dashboard/panels/SecurityPanel";

export const metadata: Metadata = {
  title: "الأمان | جلاسيه الأمير",
};

export default function MyAccountSecurityPage() {
  return <SecurityPanel />;
}
