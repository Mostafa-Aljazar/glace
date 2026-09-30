import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import OrdersPanel from "@/components/Account/dashboard/panels/OrdersPanel";

export const metadata: Metadata = privatePageMetadata("طلباتي");

export default function MyAccountOrdersPage() {
  return <OrdersPanel />;
}
