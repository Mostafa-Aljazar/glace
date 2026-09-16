"use client";

import { useMutation } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { applyCouponRequest } from "./applyCouponRequest";

export function useApplyCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      applyCouponRequest(code, subtotal),
    onSuccess: (result, { code }) => {
      // An invalid/expired coupon must not linger in the cart's `coupon`
      // field — PaymentClientPage sends that field verbatim as `couponCode`
      // on every place-order attempt, so leaving a rejected code there
      // would make the backend re-reject checkout until the customer
      // manually clears it.
      useCartStore
        .getState()
        .setCoupon(result.valid ? code : "", result.valid ? result.discount : 0);
    },
  });
}
