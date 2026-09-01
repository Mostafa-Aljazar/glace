"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import {
  useOrderStore,
  type DeliveryMethod,
  type Order,
  type PaymentMethod,
} from "@/store/orderStore";
import type { CartItem } from "@/store/cartStore";
import { ORDERS_QUERY_KEY } from "./fetchOrders";

export interface PlaceOrderInput {
  items: CartItem[];
  couponCode?: string;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  /** Reference to a saved address — required when deliveryMethod is "delivery". */
  addressId?: string;
  pickupTime?: string;
  /** Transfer receipt photo, for RECEIPT_METHODS orders — uploaded as a real
   *  file (multipart), never base64. */
  receiptImage?: File;
  receiptNote?: string;
  /** Required when `paymentMethod` is `jawwal` (automatic) — the phone
   *  JawwalPay texted the confirmation code to, and the code itself, from
   *  a prior `POST /orders/jawwal/send-code`. The server verifies the code
   *  against JawwalPay before creating the order. */
  jawwalPhone?: string;
  jawwalCode?: string;
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PlaceOrderInput) => {
      const formData = new FormData();
      formData.append("items", JSON.stringify(input.items));
      if (input.couponCode) formData.append("couponCode", input.couponCode);
      formData.append("paymentMethod", input.paymentMethod);
      formData.append("deliveryMethod", input.deliveryMethod);
      if (input.addressId) formData.append("addressId", input.addressId);
      if (input.pickupTime) formData.append("pickupTime", input.pickupTime);
      if (input.receiptImage) formData.append("receiptImage", input.receiptImage);
      if (input.receiptNote) formData.append("receiptNote", input.receiptNote);
      if (input.jawwalPhone) formData.append("jawwalPhone", input.jawwalPhone);
      if (input.jawwalCode) formData.append("jawwalCode", input.jawwalCode);

      return userApi
        .post<Order>("/orders", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    },
    onSuccess: (order) => {
      useOrderStore.getState().upsertOrder(order);
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}
