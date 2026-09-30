import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MenuClientPage from "@/components/Menu/MenuClientPage";
import JsonLd from "@/components/Common/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import type { IProduct } from "@/types/menu.types";
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


export const metadata: Metadata = pageMetadata({
  title: "المنيو",
  description:
    "منيو جلاسيه الأمير: آيس كريم بنكهات كثيرة، براد، عصائر طبيعية، وافل، كريب، بان كيك، كنافة وحلويات، اطلب أونلاين مع التوصيل في غزة",
  path: "/menu",
});

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

  const products =
    queryClient.getQueryData<IProduct[]>(menuProductsQueryKey()) ?? [];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "المنيو", path: "/menu" }]),
          ...(products.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  name: `منيو ${SITE_NAME}`,
                  itemListElement: products.map((product, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: product.name,
                    url: absoluteUrl(`/menu/order/${product.slug}`),
                  })),
                },
              ]
            : []),
        ]}
      />
      <MenuClientPage />
    </HydrationBoundary>
  );
}
