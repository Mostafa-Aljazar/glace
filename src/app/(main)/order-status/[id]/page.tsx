import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import OrderStatusClientPage from "@/components/Order/OrderStatusClientPage";

export const metadata: Metadata = privatePageMetadata("تتبع الطلب");

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderStatusPage({ params }: Props) {
  const { id } = await params;
  return <OrderStatusClientPage id={id} />;
}
