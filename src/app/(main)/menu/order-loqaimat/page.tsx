import type { Metadata } from "next";
import LoqaimatOrderClientPage from "@/components/Order/LoqaimatOrderClientPage";

export const metadata: Metadata = {
  title: "طلب لقيمات | جلاسيه الأمير",
};

export default function OrderLoqaimatPage() {
  return <LoqaimatOrderClientPage />;
}
