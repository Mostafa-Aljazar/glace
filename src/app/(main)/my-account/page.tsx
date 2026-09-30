import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import SettingsLinksPanel from "@/components/Account/dashboard/panels/SettingsLinksPanel";

export const metadata: Metadata = privatePageMetadata("الإعدادات");

export default function MyAccountPage() {
  return <SettingsLinksPanel />;
}
