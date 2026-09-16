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
  /** Free-text note for the delivery captain (gate code, floor, landmark
   *  detail) — set on the address in Checkout, forwarded here since the
   *  backend expects it as its own order field, not nested under the
   *  address. */
  captainNote?: string;
  /** Free-text note about the order itself (allergies, special requests) —
   *  set in Cart, separate from `captainNote` which is about reaching the
   *  address, not the order contents. */
  orderNote?: string;
  /** Transfer receipt photo, for RECEIPT_METHODS orders — uploaded as a real
   *  file (multipart), never base64. */
  receiptImage?: File;
  receiptNote?: string;
  /** Required for RECEIPT_METHODS orders — the name on the account the
   *  customer transferred from, so staff can match the incoming transfer
   *  to this order regardless of whether a receipt image was attached. */
  senderAccountName?: string;
  /** Required when `paymentMethod` is `jawwal` (automatic) — the phone
   *  JawwalPay texted the confirmation code to, and the code itself, from
   *  a prior `POST /orders/jawwal/send-code`. The server verifies the code
   *  against JawwalPay before creating the order. */
  jawwalPhone?: string;
  jawwalCode?: string;
}

/** Expands a builder item's flavor/mix picks into the flat, repeated-by-qty
 *  id list (`items[].flavorIds`) `POST /orders` requires alongside the
 *  structured `selections[]`, which the backend doesn't derive this from
 *  itself — e.g. 8 balls of one flavor become that id repeated 8 times,
 *  matching how `GET /orders` echoes it back. `flatSelections` is sent as
 *  named — the backend reads that field directly (confirmed against a real
 *  order: renaming it to `flatAddons` made the backend silently drop the
 *  addon from pricing/storage instead of rejecting it, which is what made
 *  the mismatch easy to miss). */
function toWireItem(item: CartItem) {
  const flavorIds = item.selections
    .filter((s) => s.kind === "flavor" || s.kind === "mix")
    .flatMap((s) => Array(s.qty).fill(s.id));
  return flavorIds.length > 0 ? { ...item, flavorIds } : item;
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PlaceOrderInput) => {
      const formData = new FormData();
      formData.append("items", JSON.stringify(input.items.map(toWireItem)));
      if (input.couponCode) formData.append("couponCode", input.couponCode);
      // Backend's payment_method enum uses "palpay", not "paypal".
      formData.append(
        "paymentMethod",
        input.paymentMethod === "paypal" ? "palpay" : input.paymentMethod,
      );
      formData.append("deliveryMethod", input.deliveryMethod);
      if (input.addressId) formData.append("addressId", input.addressId);
      if (input.pickupTime) formData.append("pickupTime", input.pickupTime);
      if (input.captainNote) formData.append("captainNote", input.captainNote);
      if (input.orderNote) formData.append("orderNote", input.orderNote);
      if (input.receiptImage) formData.append("receiptImage", input.receiptImage);
      if (input.receiptNote) formData.append("receiptNote", input.receiptNote);
      if (input.senderAccountName)
        formData.append("senderAccountName", input.senderAccountName);
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
