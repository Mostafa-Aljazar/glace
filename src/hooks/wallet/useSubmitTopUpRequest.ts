"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import {
  toWireTopUpMethod,
  fromWireTopUpMethod,
  type TopUpRequest,
} from "@/store/walletStore";
import { TOPUP_REQUESTS_QUERY_KEY } from "./fetchTopUpRequests";

/** Receipt-based top-up methods only — `jawwal` (automatic) has its own
 *  send-code/confirm flow in useJawwalTopUp.ts. */
export type ReceiptTopUpMethod = "bop" | "paypal" | "jawwal-manual";

interface SubmitTopUpInput {
  method: ReceiptTopUpMethod;
  amount: number;
  receiptImage?: File;
  receiptNote?: string;
}

type TopUpRequestDto = Omit<TopUpRequest, "method"> & { method: string };

export function useSubmitTopUpRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ method, amount, receiptImage, receiptNote }: SubmitTopUpInput) => {
      const formData = new FormData();
      formData.append("method", toWireTopUpMethod(method));
      formData.append("amount", String(amount));
      if (receiptImage) formData.append("receiptImage", receiptImage);
      if (receiptNote) formData.append("receiptNote", receiptNote);

      return userApi
        .post<TopUpRequestDto>("/wallet/topup-requests", formData)
        .then((r) => ({
          ...r.data,
          method: fromWireTopUpMethod(r.data.method),
        }) as TopUpRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOPUP_REQUESTS_QUERY_KEY });
    },
  });
}
