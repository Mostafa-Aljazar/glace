import type { Metadata } from "next";
import DrinksOrderClientPage from "@/components/Order/DrinksOrderClientPage";

export const metadata: Metadata = {
  title: "طلب المشروبات | جلاسيه الأمير",
};

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function OrderDrinksPage({ searchParams }: Props) {
  const params = await searchParams;
  return <DrinksOrderClientPage initialType={params.type ?? "juices"} />;
}
