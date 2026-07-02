"use client";

import { useQuery } from "@tanstack/react-query";
import { FAKE_CATEGORIES, type ApiMenuCategory } from "@/data/fake-data/menuApiData";

async function fetchMenuCategories(): Promise<ApiMenuCategory[]> {
  // Swap this URL for the real Laravel endpoint when the backend is ready:
  // const res = await api.get("/menu/categories");
  // return res.data;
  await new Promise((r) => setTimeout(r, 0));
  return FAKE_CATEGORIES;
}

export function useMenuCategories() {
  return useQuery({
    queryKey: ["menu-categories"],
    queryFn: fetchMenuCategories,
    staleTime: Infinity,
  });
}
