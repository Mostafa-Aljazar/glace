import type { Metadata } from "next";
import HelpPanel from "@/components/Account/dashboard/panels/HelpPanel";

export const metadata: Metadata = {
  title: "المساعدة | جلاسيه الأمير",
};

export default function MyAccountHelpPage() {
  return <HelpPanel />;
}
