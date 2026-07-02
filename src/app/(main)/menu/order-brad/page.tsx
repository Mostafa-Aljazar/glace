import type { Metadata } from "next";
import BradOrderClientPage from "@/components/Order/BradOrderClientPage";

export const metadata: Metadata = {
  title: "طلب البراد | جلاسيه الأمير",
};

interface Props {
  searchParams: Promise<{ withIceCream?: string }>;
}

export default async function OrderBradPage({ searchParams }: Props) {
  const params = await searchParams;
  return <BradOrderClientPage withIceCream={params.withIceCream === "true"} />;
}
