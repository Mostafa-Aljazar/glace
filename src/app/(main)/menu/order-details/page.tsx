import type { Metadata } from "next";
import OrderDetailsClientPage from "@/components/Order/OrderDetailsClientPage";

export const metadata: Metadata = {
  title: "تفاصيل الطلب | جلاسيه الأمير",
};

export default function OrderDetailsPage() {
  return <OrderDetailsClientPage />;
}
