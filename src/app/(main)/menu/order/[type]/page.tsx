import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import OrderFlatListTemplate from "@/components/Order/OrderFlatListTemplate";
import OrderBuilderTemplate from "@/components/Order/OrderBuilderTemplate";
import { FAKE_PRODUCTS } from "@/data/fake-data/menu";

interface Props {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const product = FAKE_PRODUCTS.find((p) => p.id === type);
  return {
    title: product ? `طلب ${product.name} | جلاسيه الأمير` : "طلب | جلاسيه الأمير",
  };
}

export function generateStaticParams() {
  return FAKE_PRODUCTS.map((p) => ({ type: p.id }));
}

export default async function OrderTypePage({ params }: Props) {
  const { type } = await params;
  const product = FAKE_PRODUCTS.find((p) => p.id === type);

  if (!product) {
    notFound();
  }

  if (product.kind === "flat-list") {
    return <OrderFlatListTemplate product={product} />;
  }

  return (
    <Suspense>
      <OrderBuilderTemplate product={product} />
    </Suspense>
  );
}
