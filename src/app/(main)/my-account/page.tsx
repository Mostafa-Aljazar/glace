import type { Metadata } from "next";
import SettingsLinksPanel from "@/components/Account/dashboard/panels/SettingsLinksPanel";

export const metadata: Metadata = {
  title: "الإعدادات | جلاسيه الأمير",
};

export default function MyAccountPage() {
  return <SettingsLinksPanel />;
}
