import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import WalletPanel from "@/components/Account/dashboard/panels/WalletPanel";

export const metadata: Metadata = privatePageMetadata("محفظتي");

export default function MyAccountWalletPage() {
  return <WalletPanel />;
}
