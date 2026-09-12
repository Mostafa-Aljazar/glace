import { CheckCircle2, Clock, ChefHat, Truck, Package } from "lucide-react";
import type { OrderStatus, DeliveryMethod } from "@/store/orderStore";

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
