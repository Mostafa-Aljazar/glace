import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import CartClientPage from "@/components/Cart/CartClientPage";

export const metadata: Metadata = privatePageMetadata("سلة التسوق");

export default function CartPage() {
  return <CartClientPage />;
}
