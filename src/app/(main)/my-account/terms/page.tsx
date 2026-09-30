import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import TermsPanel from "@/components/Account/dashboard/panels/TermsPanel";

export const metadata: Metadata = privatePageMetadata("الشروط والأحكام");

export default function MyAccountTermsPage() {
  return <TermsPanel />;
}
