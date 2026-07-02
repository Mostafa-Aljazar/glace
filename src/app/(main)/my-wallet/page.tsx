import type { Metadata } from "next";
import MyWalletClientPage from "@/components/Wallet/MyWalletClientPage";

export const metadata: Metadata = {
  title: "محفظتي | جلاسيه الأمير",
};

export default function MyWalletPage() {
  return <MyWalletClientPage />;
}
