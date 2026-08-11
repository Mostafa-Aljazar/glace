"use client";

import { useQuery } from "@tanstack/react-query";
import fetchMenuProducts, {
  MENU_PRODUCTS_QUERY_KEY,
  menuProductsQueryKey,
  type IMenuProductsParams,
} from "@/hooks/menu/fetchMenuProducts";

export { MENU_PRODUCTS_QUERY_KEY, menuProductsQueryKey };

/** Loads products for a category (`GET /menu/products?category=`). */
export function useMenuProducts(categoryId?: string) {
  const params: IMenuProductsParams = { categoryId };

  return useQuery({
    queryKey: menuProductsQueryKey(categoryId),
    queryFn: () => fetchMenuProducts(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
