import type { Metadata } from "next";
import KunafahOrderClientPage from "@/components/Order/KunafahOrderClientPage";

export const metadata: Metadata = {
  title: "طلب كنافة آيس كريم | جلاسيه الأمير",
};

export default function OrderKunafahPage() {
  return <KunafahOrderClientPage />;
}
