import type { Metadata } from "next";
import OrdersPanel from "@/components/Account/dashboard/panels/OrdersPanel";

export const metadata: Metadata = {
  title: "طلباتي | جلاسيه الأمير",
};

export default function MyAccountOrdersPage() {
  return <OrdersPanel />;
}
