import { guestApi } from "@/lib/axios";
import { findFakeProductById } from "@/data/fake-data/menu";
import { isProduct } from "@/hooks/menu/fetchMenuProducts";
import type { IProduct } from "@/types/menu.types";

/**
 * Fetches a single product from `GET /menu/products/{id}`.
 * Falls back to fake data when the API fails; returns `null` if not found.
 */
export async function fetchMenuProductById(id: string): Promise<IProduct | null> {
  try {
    const res = await guestApi.get<IProduct>(`/menu/products/${id}`);
    if (isProduct(res?.data)) return res.data;
    return findFakeProductById(id) ?? null;
  } catch (e) {
    console.error(`[fetchMenuProductById:${id}]`, e);
    return findFakeProductById(id) ?? null;
  }
}

export default fetchMenuProductById;
