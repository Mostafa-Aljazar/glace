"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import DataError from "@/components/Common/DataError";
import OrderBuilderTemplate from "@/components/Order/OrderBuilderTemplate";
import OrderFlatListTemplate from "@/components/Order/OrderFlatListTemplate";
import { useMenuProduct } from "@/hooks/menu/useMenuProduct";

interface OrderTypeClientPageProps {
  productId: string;
}

/**
 * Fetches the product client-side via `useMenuProduct` (`GET /menu/products/
 * {slug}`) and dispatches to the matching order template once it resolves.
 */
export default function OrderTypeClientPage({ productId }: OrderTypeClientPageProps) {
  const { data: product, isLoading, isError, refetch } = useMenuProduct(productId);

  if (isLoading) {
    return (
      <div className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen pt-20 pb-40 lg:pb-20">
        <EventsBackground />
        <div className="z-10 relative max-w-2xl mx-auto px-4 space-y-6">
          {/* Product header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-12 bg-white/15 rounded-lg w-3/4 mx-auto animate-pulse" />
            <div className="h-8 bg-white/10 rounded-lg w-1/2 mx-auto animate-pulse" />
          </div>

          {/* Image skeleton */}
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-white/15 rounded-2xl animate-pulse" />
          </div>

          {/* Steps skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 space-y-3 animate-pulse"
              >
                <div className="h-6 bg-white/15 rounded w-1/3" />
                <div className="space-y-2">
                  <div className="h-10 bg-white/10 rounded-lg" />
                  <div className="h-10 bg-white/10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Button skeleton */}
          <div className="h-12 bg-glace-yellow/50 rounded-full animate-pulse mt-8" />
        </div>
      </div>
    );
  }

  // Distinguish "the backend is unreachable" from "this product doesn't exist".
  if (isError) {
    return (
      <div className="flex justify-center items-center bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] px-4 min-h-screen">
        <EventsBackground />
        <div className="z-10 relative">
          <DataError
            title="تعذّر تحميل المنتج"
            description="لم نتمكن من الوصول إلى الخادم، حاول مرة أخرى"
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }

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
