import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderTypeClientPage from "@/components/Order/OrderTypeClientPage";
import { fetchMenuProducts } from "@/hooks/menu/fetchMenuProducts";

interface Props {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const products = await fetchMenuProducts();
  const product = products.find((p) => p.slug === type);
  return {
    title: product ? `طلب ${product.name} | جلاسيه الأمير` : "طلب | جلاسيه الأمير",
  };
}

export async function generateStaticParams() {
  const products = await fetchMenuProducts();
  return products.map((p) => ({ type: p.slug }));
}

export default async function OrderTypePage({ params }: Props) {
  const { type } = await params;
  const products = await fetchMenuProducts();

  // Gate 404s server-side to avoid client-side flashes for garbage ids
  if (!products.some((p) => p.slug === type)) notFound();

  return <OrderTypeClientPage productId={type} />;
}
