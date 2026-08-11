"use client";

import { useQuery } from "@tanstack/react-query";
import fetchMenuCategories, {
  MENU_CATEGORIES_QUERY_KEY,
} from "@/hooks/menu/fetchMenuCategories";

export { MENU_CATEGORIES_QUERY_KEY };

/** Loads the menu category list (`GET /menu/categories`). */
export function useMenuCategories() {
  return useQuery({
    queryKey: MENU_CATEGORIES_QUERY_KEY,
    queryFn: fetchMenuCategories,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
