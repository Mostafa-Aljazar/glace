import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import ProfilePanel from "@/components/Account/dashboard/panels/ProfilePanel";

export const metadata: Metadata = privatePageMetadata("بياناتي");

export default function MyAccountProfilePage() {
  return <ProfilePanel />;
}
