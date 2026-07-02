import type { Metadata } from "next";
import PaymentClientPage from "@/components/Payment/PaymentClientPage";

export const metadata: Metadata = {
  title: "الدفع | جلاسيه الأمير",
};

interface Props {
  searchParams: Promise<{
    delivery?: string;
    name?: string;
    phone?: string;
    city?: string;
    area?: string;
    street?: string;
    landmark?: string;
  }>;
}

export default async function PaymentPage({ searchParams }: Props) {
  const params = await searchParams;
  const isDelivery = params.delivery === "delivery";
  const address = isDelivery ? {
    name: params.name ?? "",
    phone: params.phone ?? "",
    city: params.city ?? "",
    area: params.area ?? "",
    street: params.street ?? "",
    landmark: params.landmark,
  } : undefined;

  return (
    <PaymentClientPage
      deliveryMethod={isDelivery ? "delivery" : "pickup"}
      address={address}
    />
  );
}
