import type { CartItem } from "@/store/cartStore";
import type { IProduct } from "@/types/menu.types";

/**
 * Product slugs (confirmed against `GET /menu/products` on the live backend)
 * whose small/medium sizes are unsuitable for delivery: "براد", "براد مع
 * بوظة", and "بوظة كاسة/بسكوت" (slug "cup"). Their size ids are prefixed per
 * product (e.g. "brad-small", "cup-medium", "biscuit-small"), not the generic
 * "small"/"medium" from ISizeOption's doc comment — matched below by suffix
 * rather than exact id. "بوظة عائلي" (slug "family") has no small/medium
 * sizes at all (only half/full liter) so it's never affected.
 */
const COLD_PRODUCT_SLUGS = ["brad", "brad-boza", "cup"];
const BLOCKED_SIZE_SUFFIXES = ["-small", "-medium"];
const BLOCKED_SIZE_IDS = ["small", "medium"];

/** "جيلاتو دوم" — a flat-list product (slug "gelatodome") under the
 *  "desserts" category, not a category of its own. Never suitable for
 *  delivery regardless of size. */
const ALWAYS_BLOCKED_PRODUCT_SLUG = "gelatodome";

export interface DeliveryBlockedItem {
  item: CartItem;
  reason: "size" | "category" | "in-store-only";
}

function isBlockedSize(sizeId: string): boolean {
  return (
    BLOCKED_SIZE_IDS.includes(sizeId) ||
    BLOCKED_SIZE_SUFFIXES.some((suffix) => sizeId.endsWith(suffix))
  );
}

/**
 * First cart item unsuitable for delivery/pickup: a "براد"/"براد مع بوظة"/
 * "بوظة كاسة" item in a small/medium size, or the "جيلاتو دوم" item. Matches
 * by product slug (stable backend identifier), not category or display
 * labels.
 */
export function getDeliveryBlockingItem(
  items: CartItem[],
  products: IProduct[],
): DeliveryBlockedItem | null {
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) continue;

    if (product.slug === ALWAYS_BLOCKED_PRODUCT_SLUG) {
      return { item, reason: "category" };
    }

    if (product.inStoreOnly) {
      return { item, reason: "in-store-only" };
    }

    if (COLD_PRODUCT_SLUGS.includes(product.slug)) {
      const sizes = "sizes" in product ? product.sizes : undefined;
      const matchedSize = sizes?.find((s) => s.label === item.size);
      if (matchedSize && isBlockedSize(matchedSize.id)) {
        return { item, reason: "size" };
      }
    }
  }

  return null;
}
