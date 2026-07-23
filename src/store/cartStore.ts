import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Cart-level shared addon catalog (extras accordion on the cart page). */
export interface Addon {
  id: number;
  name: string;
  price: number;
}

export const ADDONS: Addon[] = [
  { id: 1, name: "بسكوت مخروط فاضي", price: 3 },
  { id: 2, name: "حلبي", price: 3 },
  { id: 3, name: "بندق", price: 5 },
  { id: 4, name: "صوص نوتيلا", price: 7 },
  { id: 5, name: "صوص لوتس", price: 7 },
  { id: 6, name: "صوص حلبي بيستاشيو", price: 7 },
  { id: 7, name: "صوص كراميل", price: 7 },
  { id: 8, name: "صوص كندر", price: 7 },
];

export const EMPTY_CONE_ADDON = ADDONS[0];
export const MULTI_CHOICE_ADDONS = ADDONS.filter((a) => a.id > 1);
export const MAX_MULTI_ADDONS = 4;

/** One structured, priced pick inside a cart line — replaces the old
 *  `flavors?: string[]` / `addons?: string[]` string-encoded pair (which
 *  needed two differently-anchored regexes to parse quantities back out). */
export type SelectionKind = "flavor" | "mix" | "addon";

export interface CartSelection {
  kind: SelectionKind;
  id: string; // flavor id / addon id / mix rule id — never a label-string key
  label: string;
  qty: number; // repeat count OR a toggle-selected flavor's count of 1
  unitPrice: number; // 0 for flavor choices bundled into the base price
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  /** Product thumbnail URL (StaticImageData.src) for cart display */
  image?: string;
  size?: string;
  type?: string;
  /** Builder products only — e.g. Cup's "بسكوت", Family's "فلين" container. */
  container?: string;
  flavorFamily?: "classic" | "special" | "mix";
  /** Structured flavor/mix/addon picks for this line. */
  selections: CartSelection[];
  addonTotal: number;
  unitPrice: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  /** Shared cart addons — charged once for the whole order */
  cartAddons: string[];
  cartAddonTotal: number;
  orderNote: string;
  coupon: string;
  discount: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  setOrderNote: (note: string) => void;
  setCartAddons: (addons: string[], addonTotal: number) => void;
  applyCoupon: (code: string) => void;
  clearCart: () => void;
  itemsSubtotal: () => number;
  subtotal: () => number;
  total: () => number;
}

const VALID_COUPONS: Record<string, number> = {
  GLACE10: 10,
  GLACE20: 20,
  WELCOME5: 5,
};

const CART_ADDON_NAMES = new Set(ADDONS.map((a) => a.name));

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseAddonLine(line: string): { name: string; qty: number } {
  const match = line.match(/^(.*)\s×(\d+)$/);
  if (match) return { name: match[1].trim(), qty: Number(match[2]) };
  return { name: line.trim(), qty: 1 };
}

/** True if this line is a shared cart catalog addon (not order-page biscuit extras) */
function isCartCatalogAddon(line: string): boolean {
  const { name } = parseAddonLine(line);
  return CART_ADDON_NAMES.has(name);
}

function calcCatalogAddonTotal(addonLines: string[]): number {
  return addonLines.reduce((sum, line) => {
    const { name, qty } = parseAddonLine(line);
    if (!CART_ADDON_NAMES.has(name)) return sum;
    const addon = ADDONS.find((a) => a.name === name);
    return sum + (addon?.price ?? 0) * Math.max(0, qty);
  }, 0);
}

/** Product extras like "بسكوت إضافي ×3" use embedded qty × unit 1, or known names */
function calcProductAddonTotal(addonLines: string[]): number {
  return addonLines.reduce((sum, line) => {
    if (isCartCatalogAddon(line)) {
      return sum + calcCatalogAddonTotal([line]);
    }
    // e.g. بسكوت إضافي ×3 at 1₪ each
    const match = line.match(/×(\d+)/);
    if (match) return sum + Number(match[1]);
    return sum;
  }, 0);
}

/** Pre-v3 persisted item shape (still has string-encoded flavors/addons). */
interface LegacyCartItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  size?: string;
  type?: string;
  flavors?: string[];
  addons?: string[];
  addonTotal?: number;
  unitPrice: number;
  quantity: number;
}

/**
 * Migrate old persisted carts that stamped shared addons onto every item.
 * Moves catalog addons up to cart-level and leaves only product-specific extras on items.
 */
function migrateSharedAddonsFromItems(state: {
  items: LegacyCartItem[];
  cartAddons?: string[];
  cartAddonTotal?: number;
}): { items: LegacyCartItem[]; cartAddons: string[]; cartAddonTotal: number } {
  const existingCartAddons = state.cartAddons ?? [];
  if (existingCartAddons.length > 0) {
    return {
      items: state.items,
      cartAddons: existingCartAddons,
      cartAddonTotal:
        state.cartAddonTotal ?? calcCatalogAddonTotal(existingCartAddons),
    };
  }

  const first = state.items[0];
  if (!first?.addons?.length) {
    return {
      items: state.items,
      cartAddons: [],
      cartAddonTotal: 0,
    };
  }

  const catalogFromFirst = first.addons.filter(isCartCatalogAddon);
  const allShareSameCatalog =
    catalogFromFirst.length > 0 &&
    state.items.every((item) => {
      const catalog = (item.addons ?? []).filter(isCartCatalogAddon);
      return (
        catalog.length === catalogFromFirst.length &&
        catalog.every((line, i) => line === catalogFromFirst[i])
      );
    });

  if (!allShareSameCatalog) {
    return {
      items: state.items,
      cartAddons: [],
      cartAddonTotal: 0,
    };
  }

  return {
    items: state.items.map((item) => {
      const productAddons = (item.addons ?? []).filter(
        (line) => !isCartCatalogAddon(line),
      );
      return {
        ...item,
        addons: productAddons,
        addonTotal: calcProductAddonTotal(productAddons),
      };
    }),
    cartAddons: catalogFromFirst,
    cartAddonTotal: calcCatalogAddonTotal(catalogFromFirst),
  };
}

/** Collapse a raw, possibly-repeated array of labels into {label, qty} pairs. */
function countOccurrences(labels: string[]): Array<{ label: string; qty: number }> {
  const counts = new Map<string, number>();
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);
  return Array.from(counts.entries()).map(([label, qty]) => ({ label, qty }));
}

/**
 * v2 -> v3: convert each item's legacy `flavors`/`addons` string arrays into
 * structured `selections`. Historical `unitPrice`/`addonTotal` are left
 * untouched as the source of truth for totals — `selections` is
 * structural/display only, so no historical total is at risk even where a
 * per-flavor unit price can't be reconstructed.
 */
function migrateToStructuredSelections(items: LegacyCartItem[]): CartItem[] {
  return items.map((item) => {
    const selections: CartSelection[] = [];

    for (const { label, qty } of countOccurrences(item.flavors ?? [])) {
      selections.push({ kind: "flavor", id: label, label, qty, unitPrice: 0 });
    }

    for (const line of item.addons ?? []) {
      const { name, qty } = parseAddonLine(line);
      const catalogAddon = ADDONS.find((a) => a.name === name);
      selections.push({
        kind: "addon",
        id: name,
        label: name,
        qty,
        unitPrice: catalogAddon?.price ?? 1,
      });
    }

    return {
      id: item.id,
      productId: item.productId,
      name: item.name,
      image: item.image,
      size: item.size,
      type: item.type,
      selections,
      addonTotal: item.addonTotal ?? 0,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    };
  });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartAddons: [],
      cartAddonTotal: 0,
      orderNote: "",
      coupon: "",
      discount: 0,

      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              selections: item.selections ? [...item.selections] : [],
              addonTotal: item.addonTotal ?? 0,
              id: genId(),
            },
          ],
        })),

      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((i) => i.id !== id);
          if (items.length === 0) {
            return {
              items,
              cartAddons: [],
              cartAddonTotal: 0,
              orderNote: "",
            };
          }
          return { items };
        }),

      updateQuantity: (id, qty) =>
        set((state) => {
          const items =
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity: qty } : i,
                );
          if (items.length === 0) {
            return {
              items,
              cartAddons: [],
              cartAddonTotal: 0,
              orderNote: "",
            };
          }
          return { items };
        }),

      setOrderNote: (note) => set({ orderNote: note }),

      setCartAddons: (addons, addonTotal) =>
        set({
          cartAddons: [...addons],
          cartAddonTotal: Math.max(0, addonTotal),
        }),

      applyCoupon: (code) => {
        const trimmed = code.trim();
        if (!trimmed) {
          set({ coupon: "", discount: 0 });
          return;
        }
        const discount = VALID_COUPONS[trimmed.toUpperCase()] ?? 0;
        set({ coupon: trimmed, discount });
      },

      clearCart: () =>
        set({
          items: [],
          cartAddons: [],
          cartAddonTotal: 0,
          orderNote: "",
          coupon: "",
          discount: 0,
        }),

      itemsSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (sum, i) => sum + (i.unitPrice + (i.addonTotal ?? 0)) * i.quantity,
          0,
        );
      },

      subtotal: () => {
        const { cartAddonTotal } = get();
        return get().itemsSubtotal() + (cartAddonTotal ?? 0);
      },

      total: () => {
        const { discount } = get();
        return Math.max(0, get().subtotal() - discount);
      },
    }),
    {
      name: "glace-cart",
      version: 3,
      migrate: (persisted, fromVersion) => {
        const raw = (persisted ?? {}) as {
          items?: LegacyCartItem[];
          cartAddons?: string[];
          cartAddonTotal?: number;
          orderNote?: string;
          coupon?: string;
          discount?: number;
        };

        let items = raw.items ?? [];
        let cartAddons = raw.cartAddons ?? [];
        let cartAddonTotal = raw.cartAddonTotal;

        if (fromVersion < 2) {
          const migrated = migrateSharedAddonsFromItems({
            items,
            cartAddons,
            cartAddonTotal,
          });
          items = migrated.items;
          cartAddons = migrated.cartAddons;
          cartAddonTotal = migrated.cartAddonTotal;
        }

        const finalItems: CartItem[] =
          fromVersion < 3 ? migrateToStructuredSelections(items) : (items as CartItem[]);

        return {
          items: finalItems,
          cartAddons,
          cartAddonTotal: cartAddonTotal ?? calcCatalogAddonTotal(cartAddons),
          orderNote: raw.orderNote ?? "",
          coupon: raw.coupon ?? "",
          discount: raw.discount ?? 0,
        };
      },
    },
  ),
);

export { parseAddonLine, calcCatalogAddonTotal, isCartCatalogAddon };
