import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import AddressesPanel from "@/components/Account/dashboard/panels/AddressesPanel";

export const metadata: Metadata = privatePageMetadata("العناوين المحفوظة");

export default function MyAccountAddressesPage() {
  return <AddressesPanel />;
}
