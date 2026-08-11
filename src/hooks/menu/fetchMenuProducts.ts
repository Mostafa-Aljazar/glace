import { guestApi } from "@/lib/axios";
import type { IProduct, IProductVariant } from "@/types/menu.types";

/**
 * TEMPORARY — hide specific flat-list items the business asked to drop until
 * the backend/admin can delete them (Filament has no item editor yet).
 * Keyed by `product.slug` → item `id`s.
 */
const HIDDEN_FLAT_LIST_ITEM_IDS: Record<string, readonly string[]> = {
  corn: ["chocolate"], // ذرة بالشوكولاتة
};

/**
 * TEMPORARY — delete once the backend ships `items[].id` and `mixes[].itemIds`.
 *
 * The API still returns items without an `id` and mixes with the old
 * `flavorOptionIds` (which held Arabic labels, not ids). Normalising here means
 * every component can assume the new id-based shape, and removing the shim is a
 * one-function delete rather than a hunt through the UI.
 *
 * No data is invented: an item's id falls back to its own label, which is
 * exactly what the old label-matching used as the key.
 */
export function normalizeProductIds(product: IProduct): IProduct {
  if (product.kind !== "flat-list") return product;

  const hidden = new Set(HIDDEN_FLAT_LIST_ITEM_IDS[product.slug] ?? []);

  const items: IProductVariant[] = product.items
    .map((item) => ({
      ...item,
      id: item.id ?? item.label,
    }))
    .filter((item) => !hidden.has(item.id));

  const mixes = product.mixes?.map((mix) => {
    const legacy = (mix as { flavorOptionIds?: string[] }).flavorOptionIds;
    const itemIds = (mix.itemIds ?? legacy ?? []).filter((id) => !hidden.has(id));
    return { ...mix, itemIds };
  });

  return { ...product, items, mixes };
}

function isProductBase(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<IProduct>;
  return (
    typeof p.id === "string" &&
    typeof p.slug === "string" &&
    typeof p.categoryId === "string" &&
    typeof p.name === "string" &&
    typeof p.sortOrder === "number" &&
    typeof p.available === "boolean"
  );
}

export function isProduct(value: unknown): value is IProduct {
  if (!isProductBase(value)) return false;
  const p = value as Partial<IProduct>;
  switch (p.kind) {
    case "builder":
      return Array.isArray(p.sizes);
    case "flat-list":
      return Array.isArray(p.items);
    default:
      return false;
  }
}

export interface IMenuProductsParams {
  categoryId?: string;
}

export const MENU_PRODUCTS_QUERY_KEY = ["menu-products"] as const;

/** Query key. Lives here, not in the `"use client"` hook, so Server
 *  Components can prefetch with it. */
export function menuProductsQueryKey(categoryId?: string) {
  return [...MENU_PRODUCTS_QUERY_KEY, categoryId ?? "all"] as const;
}

/**
 * Fetches products from `GET /menu/products?category=`.
 * Backend is the only source: an empty array is a valid answer (a category
 * with nothing in it) and is returned as-is rather than masked with fake data.
 */
export async function fetchMenuProducts(
  params: IMenuProductsParams = {},
): Promise<IProduct[]> {
  const res = await guestApi.get<IProduct[]>("/menu/products", {
    // The API filters on `category`; it ignores any other param name.
    params: params.categoryId ? { category: params.categoryId } : undefined,
  });

  if (!Array.isArray(res?.data)) {
    throw new Error("Invalid /menu/products response shape");
  }

  const invalid = res.data.filter((p) => !isProduct(p));
  if (invalid.length > 0) {
    throw new Error(
      `Invalid product records in /menu/products (${invalid.length}/${res.data.length})`,
    );
  }

  return res.data.map(normalizeProductIds);
}

export default fetchMenuProducts;
