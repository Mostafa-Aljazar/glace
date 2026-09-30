import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import ComingSoonClientPage from "@/components/ComingSoon/ComingSoonClientPage";

export const metadata: Metadata = privatePageMetadata("قريباً");

export default function ComingSoonPage() {
  return <ComingSoonClientPage />;
}
