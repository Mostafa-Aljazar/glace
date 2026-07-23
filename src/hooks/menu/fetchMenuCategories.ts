import { guestApi } from "@/lib/axios";
import { FAKE_MENU_CATEGORIES } from "@/data/fake-data/menu";
import type { IMenuCategory } from "@/types/menu.types";

function isMenuCategory(value: unknown): value is IMenuCategory {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<IMenuCategory>;
  return (
    typeof c.id === "string" &&
    typeof c.label === "string" &&
    typeof c.icon === "string" &&
    typeof c.accentColor === "string" &&
    typeof c.gradientFrom === "string" &&
    typeof c.gradientTo === "string" &&
    typeof c.sortOrder === "number"
  );
}

/**
 * Fetches the menu category list from `GET /menu/categories`.
 * Falls back to `FAKE_MENU_CATEGORIES` when the API fails or returns invalid
 * data. Malformed rows are dropped individually so one bad category doesn't
 * blank the whole browse grid.
 */
export async function fetchMenuCategories(): Promise<IMenuCategory[]> {
  try {
    const res = await guestApi.get<IMenuCategory[]>("/menu/categories");
    if (Array.isArray(res?.data)) {
      const valid = res.data.filter(isMenuCategory);
      if (valid.length > 0) return valid;
    }
    return FAKE_MENU_CATEGORIES;
  } catch (e) {
    console.error("[fetchMenuCategories]", e);
    return FAKE_MENU_CATEGORIES;
  }
}

export default fetchMenuCategories;
