import axios from "axios";
import { guestApi } from "@/lib/axios";
import {
  isProduct,
  normalizeProductIds,
} from "@/hooks/menu/fetchMenuProducts";
import type { IFlavorOption, IProduct } from "@/types/menu.types";

/** Query key. Lives here, not in the `"use client"` hook, so Server
 *  Components can prefetch with it. */
export function menuProductQueryKey(slug: string) {
  return ["menu-product", slug] as const;
}

const FLAVOR_FAMILIES = ["classic", "special", "stevia"] as const;

/** Missing `available` from the API means unavailable (`false`), not "unknown". */
function withDefaultAvailable<T extends { available?: boolean }>(
  value: T,
): T & { available: boolean } {
  return {
    ...value,
    available: typeof value.available === "boolean" ? value.available : false,
  };
}

function isFlavorOption(value: unknown): value is IFlavorOption {
  if (!value || typeof value !== "object") return false;
  const f = value as Partial<IFlavorOption>;
  return (
    typeof f.id === "string" &&
    typeof f.nameAr === "string" &&
    typeof f.available === "boolean" &&
    FLAVOR_FAMILIES.includes(f.family as (typeof FLAVOR_FAMILIES)[number])
  );
}

/**
 * Fetches a single product from `GET /menu/products/{slug}`.
 *
 * This is the payload that carries the builder's inline `flavors[]`, so the
 * order page needs exactly one request.
 *
 * Resolves to `null` only when the product genuinely does not exist. The API
 * currently answers unknown slugs with `200 {}` instead of `404`, so an empty
 * body is treated as "not found" too. Any other failure rejects.
 */
export async function fetchMenuProductBySlug(
  slug: string,
): Promise<IProduct | null> {
  try {
    const res = await guestApi.get<IProduct>(`/menu/products/${slug}`);

    if (isProduct(res?.data)) {
      let product = res.data;

      if (product.kind === "builder" && product.flavors !== undefined) {
        if (!Array.isArray(product.flavors)) {
          throw new Error(`Invalid flavors on /menu/products/${slug}`);
        }
        const flavors = product.flavors.map(withDefaultAvailable);
        const invalid = flavors.filter((f) => !isFlavorOption(f));
        if (invalid.length > 0) {
          throw new Error(
            `Invalid flavor records on /menu/products/${slug} (${invalid.length}/${product.flavors.length})`,
          );
        }
        product = { ...product, flavors };
      }

      return normalizeProductIds(product);
    }

    const body = res?.data as unknown;
    const isEmptyBody =
      body == null ||
      (typeof body === "object" && Object.keys(body).length === 0);
    if (isEmptyBody) return null;

    throw new Error(`Invalid /menu/products/${slug} response shape`);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

export default fetchMenuProductBySlug;
