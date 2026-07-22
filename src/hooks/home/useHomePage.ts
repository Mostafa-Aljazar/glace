"use client";

import { useQuery } from "@tanstack/react-query";
import type { IHomePageData } from "@/types/home.types";
import { FAKE_HOME_PAGE } from "@/data/fake-data/homePage";
import fetchHomePage from "@/hooks/home/fetchHomePage";

export const HOME_PAGE_QUERY_KEY = ["home-page"] as const;

/**
 * Loads the full home page payload (`GET /home`).
 * Uses fake data as initial/fallback content so the UI never goes empty.
 */
export function useHomePage(initialData?: IHomePageData) {
  return useQuery<IHomePageData>({
    queryKey: HOME_PAGE_QUERY_KEY,
    queryFn: fetchHomePage,
    initialData: initialData ?? FAKE_HOME_PAGE,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
