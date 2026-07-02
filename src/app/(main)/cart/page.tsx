import type { Metadata } from "next";
import CartClientPage from "@/components/Cart/CartClientPage";

export const metadata: Metadata = {
  title: "سلة التسوق | جلاسيه الأمير",
};

export default function CartPage() {
  return <CartClientPage />;
}
