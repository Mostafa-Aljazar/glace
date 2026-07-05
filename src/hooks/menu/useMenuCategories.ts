"use client";

import { useQuery } from "@tanstack/react-query";
import { FAKE_CATEGORIES, type ApiMenuCategory } from "@/data/fake-data/menuApiData";
import { guestApi } from "@/lib/axios";

async function fetchMenuCategories(): Promise<ApiMenuCategory[]> {
  try {
    const res = await guestApi.get<ApiMenuCategory[]>('/menu/categories');
    if (res?.data && Array.isArray(res.data)) return res.data;
    return FAKE_CATEGORIES;
  } catch (e) {
    // fallback to fake data when backend is unavailable
    return FAKE_CATEGORIES;
  }
}

export function useMenuCategories() {
  return useQuery({
    queryKey: ["menu-categories"],
    queryFn: fetchMenuCategories,
    staleTime: Infinity,
  });
}
