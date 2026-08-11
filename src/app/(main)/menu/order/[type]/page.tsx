import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import OrderTypeClientPage from "@/components/Order/OrderTypeClientPage";
import { createQueryClient } from "@/lib/reactQuery";
// Import from the fetch modules, not the `"use client"` hooks.
import { fetchMenuProducts } from "@/hooks/menu/fetchMenuProducts";
import fetchMenuProductBySlug, {
  menuProductQueryKey,
} from "@/hooks/menu/fetchMenuProductById";
import fetchMenuAddons, {
  MENU_ADDONS_QUERY_KEY,
} from "@/hooks/menu/fetchMenuAddons";

// Backend data changes without a redeploy (prices, products, events), so the
// prerendered HTML is refreshed on an interval instead of frozen at build
// time. Matches the client query `staleTime`.
export const revalidate = 300;


interface Props {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;

  // A backend outage must not break metadata for the whole route.
  const product = await fetchMenuProductBySlug(type).catch(() => null);
  return {
    title: product
      ? `طلب ${product.name} | جلاسيه الأمير`
      : "طلب | جلاسيه الأمير",
  };
}

export async function generateStaticParams() {
  try {
    const products = await fetchMenuProducts();
    return products.map((p) => ({ type: p.slug }));
  } catch {
    // Fall back to on-demand rendering if the API is unreachable at build time.
    return [];
  }
}

export default async function OrderTypePage({ params }: Props) {
  const { type } = await params;
  const queryClient = createQueryClient();

  // `fetchMenuProductBySlug` resolves to null only when the product genuinely
  // does not exist; anything else throws and falls through to the client's
  // error + retry state rather than a misleading 404.
  let missing = false;
  try {
    const product = await fetchMenuProductBySlug(type);
    if (!product) missing = true;
    else queryClient.setQueryData(menuProductQueryKey(type), product);
  } catch {
    // Leave the cache empty — the client refetches and shows its error state.
  }

  if (missing) notFound();

  // Addon prices are charged to the customer, so seed them alongside the
  // product. Flavors need no prefetch — they ride on the product payload.
  await queryClient
    .prefetchQuery({
      queryKey: MENU_ADDONS_QUERY_KEY,
      queryFn: fetchMenuAddons,
    })
    .catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrderTypeClientPage productId={type} />
    </HydrationBoundary>
  );
}
