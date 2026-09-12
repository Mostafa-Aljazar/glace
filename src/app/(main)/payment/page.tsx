import type { Metadata } from "next";
import PaymentClientPage from "@/components/Payment/PaymentClientPage";

export const metadata: Metadata = {
  title: "الدفع | جلاسيه الأمير",
};

export default function PaymentPage() {
  // Delivery method, address, and fee travel via `useCheckoutDraftStore`
  // (set on Checkout, read here client-side) instead of the URL — the
  // customer's name, phone, and address shouldn't sit in a shareable link
  // or browser history.
  return <PaymentClientPage />;
}
