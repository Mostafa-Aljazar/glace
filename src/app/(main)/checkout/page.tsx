import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import CheckoutClientPage from "@/components/Checkout/CheckoutClientPage";

export const metadata: Metadata = privatePageMetadata("إتمام الطلب");

export default function CheckoutPage() {
  return <CheckoutClientPage />;
}
