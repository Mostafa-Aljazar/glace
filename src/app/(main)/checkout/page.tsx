import type { Metadata } from "next";
import CheckoutClientPage from "@/components/Checkout/CheckoutClientPage";

export const metadata: Metadata = {
  title: "إتمام الطلب | جلاسيه الأمير",
};

export default function CheckoutPage() {
  return <CheckoutClientPage />;
}
