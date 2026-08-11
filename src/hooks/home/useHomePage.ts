"use client";

import { useQuery } from "@tanstack/react-query";
import type { IHomePageData } from "@/types/home.types";
import fetchHomePage, { HOME_PAGE_QUERY_KEY } from "@/hooks/home/fetchHomePage";

export { HOME_PAGE_QUERY_KEY };

/** Loads the full home page payload (`GET /home`). */
export function useHomePage() {
  return useQuery<IHomePageData>({
    queryKey: HOME_PAGE_QUERY_KEY,
    queryFn: fetchHomePage,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
