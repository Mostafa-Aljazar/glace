"use client";

import { useQuery } from "@tanstack/react-query";
import { FAKE_MENU_CATEGORIES } from "@/data/fake-data/menu";
import fetchMenuCategories from "@/hooks/menu/fetchMenuCategories";

export const MENU_CATEGORIES_QUERY_KEY = ["menu-categories"] as const;

/**
 * Loads the menu category list (`GET /menu/categories`).
 * Uses fake data as initial/fallback content so the UI never goes empty.
 */
export function useMenuCategories() {
  return useQuery({
    queryKey: MENU_CATEGORIES_QUERY_KEY,
    queryFn: fetchMenuCategories,
    initialData: FAKE_MENU_CATEGORIES,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
