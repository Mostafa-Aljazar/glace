"use client";

import { useQuery } from "@tanstack/react-query";
import fetchMenuAddons, {
  MENU_ADDONS_QUERY_KEY,
} from "@/hooks/menu/fetchMenuAddons";

export { MENU_ADDONS_QUERY_KEY };

/** Loads the shared additions (إضافات) catalog (`GET /menu/addons`). */
export function useMenuAddons() {
  return useQuery({
    queryKey: MENU_ADDONS_QUERY_KEY,
    queryFn: fetchMenuAddons,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
