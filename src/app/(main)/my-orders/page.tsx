import type { Metadata } from "next";
import MyOrderClientPage from "@/components/Order/MyOrderClientPage";

export const metadata: Metadata = {
  title: "طلباتي | جلاسيه الأمير",
};

export default function MyOrdersPage() {
  return <MyOrderClientPage />;
}
