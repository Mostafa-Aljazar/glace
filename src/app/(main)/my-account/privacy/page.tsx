import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import PrivacyPanel from "@/components/Account/dashboard/panels/PrivacyPanel";

export const metadata: Metadata = privatePageMetadata("سياسة الخصوصية");

export default function MyAccountPrivacyPage() {
  return <PrivacyPanel />;
}
