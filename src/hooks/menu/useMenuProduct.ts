"use client";

import { useQuery } from "@tanstack/react-query";
import fetchMenuProductBySlug from "@/hooks/menu/fetchMenuProductById";
import type { IProduct } from "@/types/menu.types";

export function menuProductQueryKey(slug: string) {
  return ["menu-product", slug] as const;
}

/**
 * Loads a single product by slug (`GET /menu/products/{slug}`).
 * Falls back to fake data; `data` is `null` when the slug does not exist.
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
