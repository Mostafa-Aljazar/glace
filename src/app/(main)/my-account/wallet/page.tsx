import type { Metadata } from "next";
import WalletPanel from "@/components/Account/dashboard/panels/WalletPanel";

export const metadata: Metadata = {
  title: "محفظتي | جلاسيه الأمير",
};

export default function MyAccountWalletPage() {
  return <WalletPanel />;
}
