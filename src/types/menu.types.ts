import type { StaticIMG } from "@/assets/images";
import { resolveMediaSrc } from "@/lib/media";

/** Image from the API (URL / storage path string) or a bundled static asset
 *  (e.g. flavor list assets the backend does not serve yet). */
export type MenuImage = StaticIMG | string | null | undefined;

/** Backend id of the extra-biscuit addon inside `GET /menu/addons`. Priced
 *  once for the whole cart line (flat), never per-unit — kept as one shared
 *  constant since both the order-page picker and the cart's "تخصيص
 *  الإضافات" dialog need to agree on which addon id gets that treatment. */
export const EXTRA_BISCUIT_ADDON_ID = "extra-biscuit";

export function resolveMenuImageSrc(image: MenuImage): string {
  if (image && typeof image !== "string") return image.src;
  return resolveMediaSrc(image);
}

/** Client-only key into ONE Lucide icon lookup table — see MenuIcon.tsx. */
export type MenuIconName =
  | "ice-cream"
  | "cup-soda"
  | "cake"
  | "glass-water"
  | "milk"
  | "apple";

export interface IMenuCategory {
  id: string; // stable slug: "ice-cream", "brad", "pancake", ...
  label: string;
  icon: MenuIconName;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  sortOrder: number;
  /** Absent or `true` = shown. `false` hides the whole section from the menu. */
  available?: boolean;
}

/**
 * One flavor ball in the builder order flow. Delivered inline on the product
 * detail payload (`IBuilderProduct.flavors`) — see the note there.
 */
export interface IFlavorOption {
  id: string; // "pistachio", "lotus", ...
  nameAr: string;
  nameEn: string;
  image: MenuImage;
  family: "classic" | "special" | "stevia";
  available: boolean;
  isPremiumMixFlavor?: boolean;
}

export interface IProductVariant {
  /** Stable, dashboard-safe identifier. Mixes reference items by this id, so
   *  renaming `label` from the dashboard never breaks a mix rule. */
  id: string;
  label: string;
  price: number;
  description?: string;
  image?: MenuImage;
  available: boolean;
  /** Priced at a mix's premiumFlavorPrice instead of flavorPrice when this
   *  variant is picked inside one of the product's mixes (e.g. pistachio). */
  isPremiumMixFlavor?: boolean;
}

/**
 * An optional extra a customer can add to a unit of the product (e.g. extra
 * caramel, nuts). A product exposes a catalog of these via `IProductBase.addons`;
 * the cart lets the user apply them either uniformly or per individual unit.
 */
export interface IAddonOption {
  id: string; // stable slug: "extra-caramel", "extra-nuts"
  label: string; // "كراميل إضافي"
  price: number; // per-unit surcharge (₪), charged per selected quantity
  available?: boolean;
  /** How the addon is picked in the cart: "toggle" (on/off, default) or
   *  "counter" (a +/- quantity stepper, e.g. extra biscuit ×3). */
  type?: "toggle" | "counter";
  /** Optional cap for counter addons (max quantity per unit). */
  maxQty?: number;
}

export interface IMixRule {
  id: string;
  label: string; // "مكس", "سوبر مكس"
  pick: number;
  basePrice: number;
  flavorPrice: number;
  premiumFlavorPrice: number; // was: pistachioPrice, hand-duplicated per category
  /** Ids of the `items[]` this mix can be built from — NOT flavor ids and NOT
   *  labels. Must match `IProductVariant.id` on the same product. */
  itemIds: string[];
  /** Absent or `true` = offered. `false` hides this mix rule for the product. */
  available?: boolean;
}

export interface IPriceCell {
  flavorFamily: "classic" | "special" | "mix";
  price: number;
}

export interface ISizeOption {
  id: string; // "small" | "medium" | "large" | "takeaway"
  label: string;
  maxBalls: number;
  prices: IPriceCell[];
  /** Restricts this size to one containerOption id — e.g. Cup's "بسكوت
   *  صغير" has no special-price cell and only exists under the "biscuit"
   *  container. Absent means the size applies regardless of container. */
  containerId?: string;
  /** Absent or `true` = orderable. `false` renders the size greyed with a
   *  "غير متوفر" badge. Lets one size be stopped independently of its
   *  container — e.g. Family's merged step can disable "1 لتر فلين" alone. */
  available?: boolean;
  /** Thumbnail for this size row (e.g. family "1/2 لتر بلاستيك"). Preferred
   *  over `IContainerOption.image` when both exist. */
  image?: MenuImage;
}

export type SelectionMode = "repeatable" | "toggle";

export interface IContainerOption {
  id: string; // "كاسة" | "بسكوت" | "كلاسيكس" | "فلين"
  label: string;
  available: boolean;
  /** Overrides the product's own name/image when this container is picked. */
  name?: string;
  image?: MenuImage;
  /** Heading for this container's price table on the preview panel, e.g.
   *  "الكاسة" → "أسعار الكاسة". Falls back to the container label. */
  pricingLabel?: string;
}

interface IProductBase {
  id: string; // opaque backend primary key — used for cart/order/favorites references, never rendered in a URL
  slug: string; // stable URL-safe identifier, e.g. "cup", "family" — matched against /menu/order/[type]
  categoryId: string;
  name: string;
  description?: string; // short product description shown on order page
  image: MenuImage;
  sortOrder: number;
  available: boolean;
  /** Superseded by `addons` below — presence of a non-empty `addons` catalog
   *  is what actually drives the per-unit additions UI on the cart page. */
  hasAddons?: boolean;
  hasNotes?: boolean;
  /** Optional per-unit extras a customer can add to this product (toppings,
   *  sauces...). Drives the "تخصيص الإضافات" flow on the cart page. */
  addons?: IAddonOption[];
  hasFavorites?: boolean;
  hasImageZoom?: boolean;
  /** Shows a small in-store-only warning step before entering the order flow. */
  inStoreOnly?: boolean;
}

/** Template A — StepCard wizard: cup, family, brad, brad-boza. */
export interface IBuilderProduct extends IProductBase {
  kind: "builder";
  /** Cup: كاسة/بسكوت. Family: كلاسيكس/فلين. Absent for brad/brad-boza. */
  containerOptions?: IContainerOption[];
  /** Brad-boza only: renders an extra ice-type + flavor-ball step. */
  includesIceCreamStep?: boolean;
  /** Brad-boza only: flat additive charge for the included ice-cream step,
   *  independent of the base size price (base + this = total). */
  iceCreamAddonPrices?: IPriceCell[];
  /** Cup/Family only: an extra-biscuit quantity addon at a flat unit price. */
  hasExtraBiscuitAddon?: boolean;
  /** Heading for the price table when sizes aren't split per container (e.g.
   *  brad/brad-boza). May be the full title ("أسعار البراد") or just the noun
   *  ("البراد") — the UI prefixes "أسعار" only when missing. Unused when sizes
   *  carry their own containerId. */
  pricingLabel?: string;
  sizes: ISizeOption[];
  /**
   * Absent entirely for products with no flavor-ball step at all (plain
   * "برادة" flavor is its own containerOptions choice, not a ball pick).
   * When `includesIceCreamStep` is set, these describe THAT step, not a
   * top-level one — brad-boza has no ball-picking for the برادة itself.
   */
  selectionMode?: SelectionMode;
  flavorFamilies?: Array<"classic" | "special" | "mix">;
  /**
   * The flavor balls this product offers, served inline by
   * `GET /menu/products/{slug}` — there is no separate flavors endpoint.
   *
   * Scoped per product on purpose: two builder products may offer different
   * flavors. Only the detail payload carries it; the `/menu/products` list
   * omits it to avoid repeating the catalog on every row.
   *
   * Absent/empty means the picker renders its empty state.
   */
  flavors?: IFlavorOption[];
}

/**
 * Template B — flat list + optional mixes: milkshake, kunafa, loqaimat,
 * pancake/waffle/crepe/pizza/molten, cold-drinks, juices, brownie, cookies,
 * cheesecake, hot-drinks, corn.
 */
export interface IFlatListProduct extends IProductBase {
  kind: "flat-list";
  items: IProductVariant[];
  mixes?: IMixRule[];
}

export type IProduct = IBuilderProduct | IFlatListProduct;

export function isBuilderProduct(p: IProduct): p is IBuilderProduct {
  return p.kind === "builder";
}

export function isFlatListProduct(p: IProduct): p is IFlatListProduct {
  return p.kind === "flat-list";
}

/** The product items a mix rule can be built from, in the rule's own order.
 *  Ids with no matching item are dropped rather than rendered as ghosts. */
export function resolveMixItems(
  mix: IMixRule,
  items: IProductVariant[],
): IProductVariant[] {
  return mix.itemIds
    .map((id) => items.find((i) => i.id === id))
    .filter((i): i is IProductVariant => i !== undefined);
}

/** Per-unit price of one flavor/variant inside a mix rule. */
export function getMixFlavorUnitPrice(mix: IMixRule, isPremium?: boolean): number {
  return isPremium ? mix.premiumFlavorPrice : mix.flavorPrice;
}

/** Sum of per-unit prices for a set of selected mix flavors/variants. */
export function getMixSelectionPrice(
  mix: IMixRule,
  selections: Array<{ isPremiumMixFlavor?: boolean }>,
): number {
  return selections.reduce(
    (sum, s) => sum + getMixFlavorUnitPrice(mix, s.isPremiumMixFlavor),
    0,
  );
}

/** Reads the price cell for a flavor family, falling back to "special" then
 *  "classic" for "mix" (matches Cup's "mix priced as special" rule) when the
 *  size has no explicit "mix" cell of its own (Family/Subscriptions do). */
export function pickPriceCell(
  cells: IPriceCell[],
  family: "classic" | "special" | "mix",
): number {
  const exact = cells.find((c) => c.flavorFamily === family);
  if (exact) return exact.price;
  if (family === "mix") {
    return (
      cells.find((c) => c.flavorFamily === "special")?.price ??
      cells.find((c) => c.flavorFamily === "classic")?.price ??
      0
    );
  }
  return cells.find((c) => c.flavorFamily === "classic")?.price ?? 0;
}

/** Total unit price for a builder product's current size + flavor family,
 *  including brad-boza's additive ice-cream addon when present. */
export function resolveBuilderPrice(
  product: IBuilderProduct,
  size: ISizeOption,
  family: "classic" | "special" | "mix",
): number {
  const base = pickPriceCell(size.prices, family);
  const addon = product.includesIceCreamStep
    ? pickPriceCell(product.iceCreamAddonPrices ?? [], family)
    : 0;
  return base + addon;
}
