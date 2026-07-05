"use client";

import { useQuery } from "@tanstack/react-query";
import { FAKE_MENU_ITEMS, type ApiMenuItem } from "@/data/fake-data/menuApiData";
import { guestApi } from "@/lib/axios";

async function fetchMenuItems(category?: string): Promise<ApiMenuItem[]> {
  try {
    const res = await guestApi.get<ApiMenuItem[]>('/menu/items', { params: { category } });
    if (res?.data && Array.isArray(res.data)) return res.data;
    return category
      ? FAKE_MENU_ITEMS.filter((i) => i.category === category)
      : FAKE_MENU_ITEMS;
  } catch (e) {
    return category
      ? FAKE_MENU_ITEMS.filter((i) => i.category === category)
      : FAKE_MENU_ITEMS;
  }
}

export function useMenuItems(category?: string) {
  return useQuery({
    queryKey: ["menu-items", category ?? "all"],
    queryFn: () => fetchMenuItems(category),
    staleTime: Infinity,
  });
}
