"use client";

import { useQuery } from "@tanstack/react-query";
import { FAKE_PRODUCTS } from "@/data/fake-data/menu";
import fetchMenuProducts, {
  type IMenuProductsParams,
} from "@/hooks/menu/fetchMenuProducts";

export const MENU_PRODUCTS_QUERY_KEY = ["menu-products"] as const;

export function menuProductsQueryKey(categoryId?: string) {
  return [...MENU_PRODUCTS_QUERY_KEY, categoryId ?? "all"] as const;
}

/**
 * Loads products for a category (`GET /menu/products?category=`).
 * Uses fake data as initial/fallback content so the UI never goes empty.
 */
export function useMenuProducts(categoryId?: string) {
  const params: IMenuProductsParams = { categoryId };

  return useQuery({
    queryKey: menuProductsQueryKey(categoryId),
    queryFn: () => fetchMenuProducts(params),
    initialData: categoryId
      ? FAKE_PRODUCTS.filter((p) => p.categoryId === categoryId)
      : FAKE_PRODUCTS,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
