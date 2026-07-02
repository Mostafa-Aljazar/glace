import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  size?: string;
  type?: string;
  flavors?: string[];
  addons?: string[];
  addonTotal: number;
  unitPrice: number;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  coupon: string;
  discount: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  applyCoupon: (code: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  total: () => number;
}

const VALID_COUPONS: Record<string, number> = {
  GLACE10: 10,
  GLACE20: 20,
  WELCOME5: 5,
};

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: "",
      discount: 0,

      addItem: (item) =>
        set((state) => ({
          items: [...state.items, { ...item, id: genId() }],
        })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        })),

      applyCoupon: (code) => {
        const discount = VALID_COUPONS[code.toUpperCase()] ?? 0;
        set({ coupon: code, discount });
      },

      clearCart: () => set({ items: [], coupon: "", discount: 0 }),

      subtotal: () => {
        const { items } = get();
        return items.reduce(
          (sum, i) => sum + (i.unitPrice + i.addonTotal) * i.quantity,
          0
        );
      },

      total: () => {
        const { discount } = get();
        const sub = get().subtotal();
        return Math.max(0, sub - discount);
      },
    }),
    { name: "glace-cart" }
  )
);
