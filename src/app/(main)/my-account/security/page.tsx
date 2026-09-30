import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import SecurityPanel from "@/components/Account/dashboard/panels/SecurityPanel";

export const metadata: Metadata = privatePageMetadata("الأمان");

export default function MyAccountSecurityPage() {
  return <SecurityPanel />;
}
