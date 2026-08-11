"use client";

import { useQuery } from "@tanstack/react-query";
import fetchMenuProductBySlug, {
  menuProductQueryKey,
} from "@/hooks/menu/fetchMenuProductById";
import type { IProduct } from "@/types/menu.types";

export { menuProductQueryKey };

/**
 * Loads a single product by slug (`GET /menu/products/{slug}`).
 * `data` is `null` when the slug does not exist; failures surface via `isError`.
 */
export function useMenuProduct(slug: string) {
  return useQuery<IProduct | null>({
    queryKey: menuProductQueryKey(slug),
    queryFn: () => fetchMenuProductBySlug(slug),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: slug.length > 0,
  });
}
