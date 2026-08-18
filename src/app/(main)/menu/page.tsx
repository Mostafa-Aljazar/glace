import type { Metadata } from "next";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MenuClientPage from "@/components/Menu/MenuClientPage";
import { createQueryClient } from "@/lib/reactQuery";
// Import from the fetch modules, not the `"use client"` hooks — a Server
// Component cannot call a function exported from a client module.
import fetchMenuCategories, {
  MENU_CATEGORIES_QUERY_KEY,
} from "@/hooks/menu/fetchMenuCategories";
import fetchMenuProducts, {
  menuProductsQueryKey,
} from "@/hooks/menu/fetchMenuProducts";

// Backend data changes without a redeploy (prices, products, events), so the
// prerendered HTML is refreshed on an interval instead of frozen at build
// time. Matches the client query `staleTime`.
export const revalidate = 120;


export const metadata: Metadata = {
  title: "المنيو | جلاسيه الأمير",
  description: "تصفح قائمة منتجاتنا المتنوعة من الآيس كريم والعصائر والحلويات",
};

export default async function MenuPage() {
  const queryClient = createQueryClient();

  // Server-render the real menu. `/menu/products` returns every product in one
  // response, so the page needs two requests total rather than one per category.
  await Promise.all([
    queryClient
      .prefetchQuery({
        queryKey: MENU_CATEGORIES_QUERY_KEY,
        queryFn: fetchMenuCategories,
      })
      .catch(() => {}),
    queryClient
      .prefetchQuery({
        queryKey: menuProductsQueryKey(),
        queryFn: () => fetchMenuProducts(),
      })
      .catch(() => {}),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={null}>
        <MenuClientPage />
      </Suspense>
    </HydrationBoundary>
  );
}
