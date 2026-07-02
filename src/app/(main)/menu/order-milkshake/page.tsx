import type { Metadata } from "next";
import MilkshakeOrderClientPage from "@/components/Order/MilkshakeOrderClientPage";

export const metadata: Metadata = {
  title: "طلب ميلك شيك | جلاسيه الأمير",
};

export default function OrderMilkshakePage() {
  return <MilkshakeOrderClientPage />;
}
