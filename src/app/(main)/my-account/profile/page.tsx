import type { Metadata } from "next";
import ProfilePanel from "@/components/Account/dashboard/panels/ProfilePanel";

export const metadata: Metadata = {
  title: "بياناتي | جلاسيه الأمير",
};

export default function MyAccountProfilePage() {
  return <ProfilePanel />;
}
