import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import HelpPanel from "@/components/Account/dashboard/panels/HelpPanel";

export const metadata: Metadata = privatePageMetadata("المساعدة");

export default function MyAccountHelpPage() {
  return <HelpPanel />;
}
