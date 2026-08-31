import type { Metadata } from "next";
import TermsPanel from "@/components/Account/dashboard/panels/TermsPanel";

export const metadata: Metadata = {
  title: "الشروط والأحكام | جلاسيه الأمير",
};

export default function MyAccountTermsPage() {
  return <TermsPanel />;
}
