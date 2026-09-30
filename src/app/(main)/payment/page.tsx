import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import PaymentClientPage from "@/components/Payment/PaymentClientPage";

export const metadata: Metadata = privatePageMetadata("الدفع");

export default function PaymentPage() {
  // Delivery method, address, and fee travel via `useCheckoutDraftStore`
  // (set on Checkout, read here client-side) instead of the URL — the
  // customer's name, phone, and address shouldn't sit in a shareable link
  // or browser history.
  return <PaymentClientPage />;
}
