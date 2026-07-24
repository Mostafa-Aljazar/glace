import { guestApi } from "@/lib/axios";
import { findFakeProductBySlug } from "@/data/fake-data/menu";
import { isProduct } from "@/hooks/menu/fetchMenuProducts";
import type { IProduct } from "@/types/menu.types";

/**
 * Fetches a single product from `GET /menu/products/{slug}`.
 * Falls back to fake data when the API fails; returns `null` if not found.
 */
export async function fetchMenuProductBySlug(slug: string): Promise<IProduct | null> {
  try {
    const res = await guestApi.get<IProduct>(`/menu/products/${slug}`);
    if (isProduct(res?.data)) return res.data;
    return findFakeProductBySlug(slug) ?? null;
  } catch (e) {
    console.error(`[fetchMenuProductBySlug:${slug}]`, e);
    return findFakeProductBySlug(slug) ?? null;
  }
}

export default fetchMenuProductBySlug;
