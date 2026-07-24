"use client";

import { useQuery } from "@tanstack/react-query";
import fetchMenuAddons from "@/hooks/menu/fetchMenuAddons";

export const MENU_ADDONS_QUERY_KEY = ["menu-addons"] as const;

/**
 * Loads the shared additions (إضافات) catalog (`GET /menu/addons`).
 * `fetchMenuAddons` already falls back to fake data on failure, so the query
 * resolves to a usable catalog without seeding `initialData`.
 */
export function useMenuAddons() {
  return useQuery({
    queryKey: MENU_ADDONS_QUERY_KEY,
    queryFn: fetchMenuAddons,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
