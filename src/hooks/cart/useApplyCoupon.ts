"use client";

import { useMutation } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { applyCouponRequest } from "./applyCouponRequest";

export function useApplyCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      applyCouponRequest(code, subtotal),
    onSuccess: (result, { code }) => {
      useCartStore.getState().setCoupon(code, result.valid ? result.discount : 0);
    },
  });
}
