import { CheckCircle2, Clock, ChefHat, Truck, Package, XCircle } from "lucide-react";
import type { OrderStatus, DeliveryMethod } from "@/store/orderStore";

/** Display for `Order.paymentStatus` — separate from the order lifecycle
 *  `status`, e.g. a manual-transfer order can be "قيد المراجعة" while staff
 *  hasn't verified the uploaded receipt yet. */
export const PAYMENT_STATUS_DISPLAY: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: "بانتظار تأكيد الدفع",
    className: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    icon: Clock,
  },
  paid: {
    label: "تم تأكيد الدفع",
    className: "bg-green-500/15 text-green-300 border-green-500/30",
    icon: CheckCircle2,
  },
  failed: {
    label: "فشل الدفع",
    className: "bg-red-500/15 text-red-300 border-red-500/30",
    icon: XCircle,
  },
  refunded: {
    label: "تم استرداد المبلغ",
    className: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    icon: CheckCircle2,
  },
};

export type StatusStep = {
  key: OrderStatus;
  label: string;
  icon: typeof Clock;
};

/** Get order status steps based on delivery method. */
export function getStatusSteps(deliveryMethod: DeliveryMethod): StatusStep[] {
  if (deliveryMethod === "dine-in") {
    return [
      { key: "قيد المراجعة", label: "قيد المراجعة", icon: Clock },
      { key: "تم التسليم", label: "تم التسليم", icon: CheckCircle2 },
    ];
  }

  if (deliveryMethod === "pickup") {
    return [
      { key: "قيد المراجعة", label: "قيد المراجعة", icon: Clock },
      { key: "جاري التحضير", label: "جاري التحضير", icon: ChefHat },
      { key: "جاهز للاستلام", label: "جاهز للاستلام", icon: Package },
      { key: "تم التسليم", label: "تم التسليم", icon: CheckCircle2 },
    ];
  }

  // delivery
  return [
    { key: "قيد المراجعة", label: "قيد المراجعة", icon: Clock },
    { key: "جاري التحضير", label: "جاري التحضير", icon: ChefHat },
    { key: "في الطريق", label: "في الطريق", icon: Truck },
    { key: "تم الاستلام", label: "تم الاستلام", icon: CheckCircle2 },
  ];
}

/** @deprecated Use getStatusSteps() instead */
export const STATUS_STEPS: StatusStep[] = getStatusSteps("pickup");
