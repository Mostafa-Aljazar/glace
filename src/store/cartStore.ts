import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ADDONS } from "@/data/OrderData";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  /** Product thumbnail URL (StaticImageData.src) for cart display */
  image?: string;
  size?: string;
  type?: string;
  flavors?: string[];
  /** Product-specific extras from the order page (e.g. extra biscuit) */
  addons?: string[];
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

/**
 * Migrate old persisted carts that stamped shared addons onto every item.
 * Moves catalog addons up to cart-level and leaves only product-specific extras on items.
 */
function migrateSharedAddonsFromItems(state: {
  items: CartItem[];
  cartAddons?: string[];
  cartAddonTotal?: number;
}): Pick<CartState, "items" | "cartAddons" | "cartAddonTotal"> {
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
              addons: item.addons ? [...item.addons] : [],
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
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as {
          items?: CartItem[];
          cartAddons?: string[];
          cartAddonTotal?: number;
          orderNote?: string;
          coupon?: string;
          discount?: number;
        };
        const migrated = migrateSharedAddonsFromItems({
          items: state.items ?? [],
          cartAddons: state.cartAddons,
          cartAddonTotal: state.cartAddonTotal,
        });
        return {
          ...state,
          ...migrated,
          orderNote: state.orderNote ?? "",
          coupon: state.coupon ?? "",
          discount: state.discount ?? 0,
        };
      },
    },
  ),
);

export {
  parseAddonLine,
  calcCatalogAddonTotal,
  isCartCatalogAddon,
};
