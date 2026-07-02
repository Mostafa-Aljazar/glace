import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/store/cartStore";

export type PaymentMethod = "jawwal" | "paypal" | "cash" | "visa" | "wallet";
export type DeliveryMethod = "delivery" | "pickup";
export type OrderStatus =
  | "قيد المراجعة"
  | "قيد التحضير"
  | "في الطريق"
  | "تم التسليم";

export interface DeliveryAddress {
  name: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  landmark?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  address?: DeliveryAddress;
  status: OrderStatus;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  placeOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => string;
  updateStatus: (id: string, status: OrderStatus) => void;
  getOrder: (id: string) => Order | undefined;
}

function genId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      placeOrder: (order) => {
        const id = genId();
        const newOrder: Order = {
          ...order,
          id,
          status: "قيد المراجعة",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
        return id;
      },

      updateStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        })),

      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "glace-orders" }
  )
);
