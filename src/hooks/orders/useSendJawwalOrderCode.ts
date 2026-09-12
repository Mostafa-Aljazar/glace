"use client";

import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";

interface SendCodeInput {
  phone: string;
  amount: number;
}

/** Asks the backend to have JawwalPay text `phone` a code confirming
 *  payment of `amount` — always the live order total, never a value the
 *  customer types. The code + phone are then sent along with the normal
 *  `POST /orders` call, which verifies them before creating the order. */
export function useSendJawwalOrderCode() {
  return useMutation({
    mutationFn: (input: SendCodeInput) =>
      userApi
        .post<{ sent: boolean }>("/orders/jawwal/send-code", input)
        .then((r) => r.data),
  });
}
