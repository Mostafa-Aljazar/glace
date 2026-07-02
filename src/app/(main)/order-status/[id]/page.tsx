import type { Metadata } from "next";
import OrderStatusClientPage from "@/components/Order/OrderStatusClientPage";

export const metadata: Metadata = {
  title: "تتبع الطلب | جلاسيه الأمير",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderStatusPage({ params }: Props) {
  const { id } = await params;
  return <OrderStatusClientPage id={id} />;
}
