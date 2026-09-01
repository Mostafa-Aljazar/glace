import { create } from "zustand";
import type { CartItem } from "@/store/cartStore";

export type PaymentMethod =
  | "jawwal"
  | "jawwal-manual"
  | "paypal"
  | "cash"
  | "visa"
  | "wallet"
  | "bop";
export type DeliveryMethod = "delivery" | "pickup" | "dine-in";
export type OrderStatus =
  | "قيد المراجعة"
  | "جاري التحضير"
  | "جاهز للاستلام"
  | "في الطريق"
  | "تم التسليم"
  | "تم الاستلام"
  | "ملغي"
  | "مسترد";

/** Payment methods with no in-app transfer integration — the customer pays
 *  externally (app or bank transfer) and uploads a screenshot of the
 *  confirmation before the order is placed, so by the time it exists it
 *  always has proof attached and starts at the same "قيد المراجعة" as any
 *  other order. */
export const RECEIPT_METHODS: PaymentMethod[] = ["jawwal-manual", "paypal", "bop"];

/** Shared status -> badge color, so every screen that lists orders agrees. */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  "قيد المراجعة": "bg-yellow-500/30 text-yellow-200",
  "جاري التحضير": "bg-blue-500/30 text-blue-200",
  "جاهز للاستلام": "bg-green-500/30 text-green-200",
  "في الطريق": "bg-purple-500/30 text-purple-200",
  "تم التسليم": "bg-green-500/30 text-green-200",
  "تم الاستلام": "bg-green-600/30 text-green-100",
  "ملغي": "bg-red-500/30 text-red-200",
  "مسترد": "bg-slate-400/30 text-slate-200",
};

/** Shared payment-method -> label, so every screen that lists orders agrees. */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  jawwal: "جوال باي (آلي)",
  "jawwal-manual": "جوال باي (يدوي)",
  paypal: "بال باي",
  cash: "كاش",
  visa: "فيزا",
  wallet: "محفظة النظام",
  bop: "بنك فلسطين",
};

/** True once an order is past all active handling — done, cancelled, or refunded. */
export function isOrderFinal(status: OrderStatus): boolean {
  return status === "تم التسليم" || status === "تم الاستلام" || status === "ملغي" || status === "مسترد";
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  landmark?: string;
  /** Free-text note for the delivery captain, e.g. gate code or floor. */
  note?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  company?: string;
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
  /** Requested dine-in time, e.g. "17:00" — only set when deliveryMethod is "dine-in". */
  pickupTime?: string;
  status: OrderStatus;
  createdAt: string;
  /** URL of the uploaded transfer receipt, for RECEIPT_METHODS orders. */
  receiptImage?: string;
  /** Fallback note when the customer can't upload a receipt image — the
   *  account/bank name they paid from, for manual staff matching. */
  receiptNote?: string;
  /** Set when the order is cancelled by the customer. */
  cancelReason?: string;
  /** Driver info for delivery orders. */
  driver?: Driver;
  /** Timestamp when driver was assigned (for delivery orders). */
  driverAssignedAt?: string;
  /** Fixed preparation time in minutes (5-30). */
  preparationTime?: number;
  /** Fixed estimated delivery time in minutes (10-25) for delivery orders. */
  estimatedDeliveryTime?: number;
  /** Timestamp when order was marked as received by customer (for delivery). */
  receivedAt?: string;
}

interface OrderState {
  /** Mirror of orders fetched/placed this session, keyed by nothing in
   *  particular — just a lookup cache for `getOrder`, not a source of truth.
   *  Never persisted; a reload refetches from the server. */
  orders: Order[];
  /** Overwrites the list wholesale — used by `useOrders()` to sync a real
   *  `GET /orders` page into the store. */
  setOrders: (orders: Order[]) => void;
  /** Merges one order into the list (update if present, prepend if new) —
   *  used after a successful `POST /orders` so the order is immediately
   *  available via `getOrder` without waiting for a refetch. */
  upsertOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],

  setOrders: (orders) => set({ orders }),

  upsertOrder: (order) =>
    set((state) => {
      const exists = state.orders.some((o) => o.id === order.id);
      return {
        orders: exists
          ? state.orders.map((o) => (o.id === order.id ? order : o))
          : [order, ...state.orders],
      };
    }),

  getOrder: (id) => get().orders.find((o) => o.id === id),
}));
