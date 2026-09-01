"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import type { TopUpRequest } from "@/store/walletStore";
import { TOPUP_REQUESTS_QUERY_KEY } from "./fetchTopUpRequests";

/** Receipt-based top-up methods only — `jawwal` (automatic) has its own
 *  send-code/confirm flow in useJawwalTopUp.ts. */
export type ReceiptTopUpMethod = "bop" | "paypal" | "jawwal-manual";

interface SubmitTopUpInput {
  method: ReceiptTopUpMethod;
  receiptImage?: string;
  receiptNote?: string;
}

export function useSubmitTopUpRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitTopUpInput) =>
      userApi
        .post<TopUpRequest>("/wallet/topup-requests", input)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOPUP_REQUESTS_QUERY_KEY });
    },
  });
}
