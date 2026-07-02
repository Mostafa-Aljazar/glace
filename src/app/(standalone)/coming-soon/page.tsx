import type { Metadata } from "next";
import ComingSoonClientPage from "@/components/ComingSoon/ComingSoonClientPage";

export const metadata: Metadata = {
  title: "قريباً | جلاسيه الأمير",
};

export default function ComingSoonPage() {
  return <ComingSoonClientPage />;
}
