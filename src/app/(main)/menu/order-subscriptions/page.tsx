import type { Metadata } from "next";
import SubscriptionsOrderClientPage from "@/components/Order/SubscriptionsOrderClientPage";

export const metadata: Metadata = {
  title: "طلب مشتركات | جلاسيه الأمير",
};

export default function SubscriptionsOrderPage() {
  return <SubscriptionsOrderClientPage />;
}
