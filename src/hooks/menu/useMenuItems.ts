"use client";

import { useQuery } from "@tanstack/react-query";
import { FAKE_MENU_ITEMS, type ApiMenuItem } from "@/data/fake-data/menuApiData";

async function fetchMenuItems(category?: string): Promise<ApiMenuItem[]> {
  // Swap this URL for the real Laravel endpoint when the backend is ready:
  // const res = await api.get("/menu/items", { params: { category } });
  // return res.data;
  await new Promise((r) => setTimeout(r, 0));
  return category
    ? FAKE_MENU_ITEMS.filter((i) => i.category === category)
    : FAKE_MENU_ITEMS;
}

export function useMenuItems(category?: string) {
  return useQuery({
    queryKey: ["menu-items", category ?? "all"],
    queryFn: () => fetchMenuItems(category),
    staleTime: Infinity,
  });
}
