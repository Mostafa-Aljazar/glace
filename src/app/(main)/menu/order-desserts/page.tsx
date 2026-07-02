import type { Metadata } from "next";
import DessertsOrderClientPage from "@/components/Order/DessertsOrderClientPage";

export const metadata: Metadata = {
  title: "طلب الحلويات | جلاسيه الأمير",
};

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function OrderDessertsPage({ searchParams }: Props) {
  const params = await searchParams;
  return <DessertsOrderClientPage initialType={params.type ?? "luqaimat"} />;
}
