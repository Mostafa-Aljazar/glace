import type { Metadata } from "next";
import LuqaimatOrderClientPage from "@/components/Order/LuqaimatOrderClientPage";

export const metadata: Metadata = {
  title: "طلب لقيمات | جلاسيه الأمير",
};

export default function CreateOrderPage() {
  return <LuqaimatOrderClientPage />;
}
