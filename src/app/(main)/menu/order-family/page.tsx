import type { Metadata } from "next";
import FamilyOrderClientPage from "@/components/Order/FamilyOrderClientPage";

export const metadata: Metadata = {
  title: "طلب بوظة عائلي | جلاسيه الأمير",
};

export default function OrderFamilyPage() {
  return <FamilyOrderClientPage />;
}
