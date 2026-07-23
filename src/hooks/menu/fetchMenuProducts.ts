import { guestApi } from "@/lib/axios";
import { FAKE_PRODUCTS } from "@/data/fake-data/menu";
import type { IProduct } from "@/types/menu.types";

function isProductBase(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<IProduct>;
  return (
    typeof p.id === "string" &&
    typeof p.categoryId === "string" &&
    typeof p.name === "string" &&
    p.image != null &&
    typeof p.sortOrder === "number" &&
    typeof p.available === "boolean"
  );
}

function isProduct(value: unknown): value is IProduct {
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

/**
 * Fetches products from `GET /menu/products?category=`.
 * Falls back to `FAKE_PRODUCTS` (filtered by category) when the API fails or
 * returns invalid data. Malformed rows are dropped individually so one bad
 * product doesn't blank the whole category.
 */
export async function fetchMenuProducts(
  params: IMenuProductsParams = {},
): Promise<IProduct[]> {
  const { categoryId } = params;

  try {
    const res = await guestApi.get<IProduct[]>("/menu/products", {
      params: { category: categoryId },
    });
    if (Array.isArray(res?.data)) {
      const valid = res.data.filter(isProduct);
      if (valid.length > 0) return valid;
    }
    return categoryId
      ? FAKE_PRODUCTS.filter((p) => p.categoryId === categoryId)
      : FAKE_PRODUCTS;
  } catch (e) {
    console.error("[fetchMenuProducts]", e);
    return categoryId
      ? FAKE_PRODUCTS.filter((p) => p.categoryId === categoryId)
      : FAKE_PRODUCTS;
  }
}

export default fetchMenuProducts;
