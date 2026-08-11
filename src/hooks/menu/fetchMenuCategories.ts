import { guestApi } from "@/lib/axios";
import type { IMenuCategory } from "@/types/menu.types";

/** Query key. Lives here, not in the `"use client"` hook, so Server
 *  Components can prefetch with it. */
export const MENU_CATEGORIES_QUERY_KEY = ["menu-categories"] as const;

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
 * Backend is the only source — network/shape failures reject so the UI can
 * surface an error instead of rendering data the backend never sent.
 */
export async function fetchMenuCategories(): Promise<IMenuCategory[]> {
  const res = await guestApi.get<IMenuCategory[]>("/menu/categories");

  if (!Array.isArray(res?.data)) {
    throw new Error("Invalid /menu/categories response shape");
  }

  const invalid = res.data.filter((c) => !isMenuCategory(c));
  if (invalid.length > 0) {
    // Dropping records silently hides backend regressions — fail loudly.
    throw new Error(
      `Invalid category records in /menu/categories (${invalid.length}/${res.data.length})`,
    );
  }

  return res.data;
}

export default fetchMenuCategories;
