import type { Metadata } from "next";
import OtherDessertsOrderClientPage from "@/components/Order/OtherDessertsOrderClientPage";

export const metadata: Metadata = {
  title: "طلب حلويات | جلاسيه الأمير",
};

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function OrderOtherDessertsPage({ searchParams }: Props) {
  const params = await searchParams;
  return <OtherDessertsOrderClientPage initialType={params.type ?? "brownie"} />;
}
