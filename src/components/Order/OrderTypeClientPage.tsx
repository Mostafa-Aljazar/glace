"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import OrderBuilderTemplate from "@/components/Order/OrderBuilderTemplate";
import OrderFlatListTemplate from "@/components/Order/OrderFlatListTemplate";
import { useMenuProduct } from "@/hooks/menu/useMenuProduct";

interface OrderTypeClientPageProps {
  productId: string;
}

/**
 * Fetches the product client-side via `useMenuProduct` (real API first, fake
 * data fallback — same pattern as `useEvent` on the events detail page) and
 * dispatches to the matching order template once it resolves.
 */
export default function OrderTypeClientPage({ productId }: OrderTypeClientPageProps) {
  const { data: product } = useMenuProduct(productId);

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen">
        <EventsBackground />
        <p className="z-10 relative font-bold text-[32px] text-white">المنتج غير موجود</p>
        <Link
          href="/menu"
          className="z-10 relative flex items-center gap-2 bg-glace-yellow px-6 py-2.5 rounded-full font-bold text-[#1e6a7f] text-[16px]"
        >
          <ArrowRight size={16} />
          العودة للمنيو
        </Link>
      </div>
    );
  }

  return product.kind === "flat-list" ? (
    <OrderFlatListTemplate product={product} />
  ) : (
    <Suspense>
      <OrderBuilderTemplate product={product} />
    </Suspense>
  );
}
