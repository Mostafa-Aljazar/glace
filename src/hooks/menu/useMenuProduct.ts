"use client";

import { useQuery } from "@tanstack/react-query";
import { findFakeProductById } from "@/data/fake-data/menu";
import fetchMenuProductById from "@/hooks/menu/fetchMenuProductById";
import type { IProduct } from "@/types/menu.types";

export function menuProductQueryKey(id: string) {
  return ["menu-product", id] as const;
}

/**
 * Loads a single product (`GET /menu/products/{id}`).
 * Falls back to fake data; `data` is `null` when the id does not exist.
 */
export function useMenuProduct(id: string) {
  return useQuery<IProduct | null>({
    queryKey: menuProductQueryKey(id),
    queryFn: () => fetchMenuProductById(id),
    initialData: findFakeProductById(id) ?? null,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: id.length > 0,
  });
}
