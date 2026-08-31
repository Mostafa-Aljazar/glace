import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  /** Base64 data URL of the uploaded transfer receipt, for RECEIPT_METHODS orders. */
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
  orders: Order[];
  placeOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => string;
  updateStatus: (id: string, status: OrderStatus) => void;
  /** Attaches/updates the transfer receipt on an existing order — does not
   *  change its status, since nothing in this app verifies the transfer. */
  updateReceipt: (id: string, receiptImage?: string, receiptNote?: string) => void;
  cancelOrder: (id: string, reason: string) => void;
  getOrder: (id: string) => Order | undefined;
}

function genId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

/** Mock orders for testing different scenarios */
const getMockOrders = (): Order[] => {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  return [
    // 1. Dine-in - Completed
    {
      id: "ORD-DINEINCOMPLETED",
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          name: "آيس كريم أيس - أيس كريم فاني",
          image: "https://via.placeholder.com/56",
          type: "فانيليا",
          selections: [],
          addonTotal: 0,
          unitPrice: 45,
          quantity: 1,
        },
      ],
      subtotal: 45,
      discount: 0,
      total: 45,
      paymentMethod: "cash",
      deliveryMethod: "dine-in",
      pickupTime: "17:30",
      status: "تم التسليم",
      createdAt: twoHoursAgo.toISOString(),
      preparationTime: 15,
    },

    // 2. Pickup - Preparation in progress
    {
      id: "ORD-PICKUPPREP",
      items: [
        {
          id: "item-2",
          productId: "prod-2",
          name: "آيس كريم أيس - أيس كريم كراميل",
          image: "https://via.placeholder.com/56",
          type: "كراميل",
          selections: [],
          addonTotal: 0,
          unitPrice: 30,
          quantity: 2,
        },
      ],
      subtotal: 60,
      discount: 0,
      total: 60,
      paymentMethod: "wallet",
      deliveryMethod: "pickup",
      pickupTime: "18:00",
      status: "جاري التحضير",
      createdAt: tenMinutesAgo.toISOString(),
      preparationTime: 20,
    },

    // 3. Pickup - Ready for pickup
    {
      id: "ORD-PICKUPREADY",
      items: [
        {
          id: "item-3",
          productId: "prod-3",
          name: "مشروبات باردة - أيس كومبو",
          image: "https://via.placeholder.com/56",
          type: "الحجم: 500 مل",
          selections: [],
          addonTotal: 0,
          unitPrice: 25,
          quantity: 1,
        },
      ],
      subtotal: 25,
      discount: 5,
      total: 20,
      paymentMethod: "jawwal",
      deliveryMethod: "pickup",
      pickupTime: "18:15",
      status: "جاهز للاستلام",
      createdAt: thirtyMinutesAgo.toISOString(),
      preparationTime: 25,
    },

    // 4. Delivery - In transit with driver
    {
      id: "ORD-DELIVERYPROGRESS",
      items: [
        {
          id: "item-4",
          productId: "prod-4",
          name: "مشروبات باردة - عصير برتقال",
          image: "https://via.placeholder.com/56",
          type: "500 مل",
          selections: [],
          addonTotal: 0,
          unitPrice: 20,
          quantity: 1,
        },
        {
          id: "item-5",
          productId: "prod-5",
          name: "آيس كريم أيس - أيس كريم شوكولاتة",
          image: "https://via.placeholder.com/56",
          type: "شوكولاتة",
          selections: [],
          addonTotal: 0,
          unitPrice: 45,
          quantity: 1,
        },
      ],
      subtotal: 65,
      discount: 0,
      total: 65,
      paymentMethod: "visa",
      deliveryMethod: "delivery",
      address: {
        name: "محمود علي",
        phone: "0595123456",
        city: "رام الله",
        area: "الماصيون",
        street: "شارع الملك عبدالعزيز",
        landmark: "بجانب المسجد",
        note: "رقم العمارة 42",
      },
      status: "في الطريق",
      createdAt: oneHourAgo.toISOString(),
      preparationTime: 15,
      estimatedDeliveryTime: 15,
      driver: {
        id: "driver-1",
        name: "محمود الأحمد",
        phone: "0599876543",
        company: "توصيل فلسطين",
      },
      driverAssignedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
    },

    // 5. Delivery - Cancelled
    {
      id: "ORD-DELIVERYCANCELLED",
      items: [
        {
          id: "item-6",
          productId: "prod-6",
          name: "آيس كريم أيس - براد",
          image: "https://via.placeholder.com/56",
          type: "براد صغير",
          selections: [],
          addonTotal: 0,
          unitPrice: 120,
          quantity: 1,
        },
      ],
      subtotal: 120,
      discount: 0,
      total: 120,
      paymentMethod: "cash",
      deliveryMethod: "delivery",
      address: {
        name: "علي محمد",
        phone: "0595987654",
        city: "البيرة",
        area: "شارع النيل",
        street: "البيرة الرئيسية",
      },
      status: "ملغي",
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      cancelReason: "غيرت رأيي",
      preparationTime: 30,
    },
  ];
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: getMockOrders(),

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

      updateReceipt: (id, receiptImage, receiptNote) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, receiptImage, receiptNote } : o
          ),
        })),

      cancelOrder: (id, reason) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: "ملغي", cancelReason: reason } : o
          ),
        })),

      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "glace-orders" }
  )
);
