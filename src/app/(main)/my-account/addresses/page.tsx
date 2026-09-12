import type { Metadata } from "next";
import AddressesPanel from "@/components/Account/dashboard/panels/AddressesPanel";

export const metadata: Metadata = {
  title: "العناوين المحفوظة | جلاسيه الأمير",
};

export default function MyAccountAddressesPage() {
  return <AddressesPanel />;
}
