"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import type { TopUpRequest } from "@/store/walletStore";
import { WALLET_QUERY_KEY } from "./fetchWallet";
import { WALLET_TRANSACTIONS_QUERY_KEY } from "./fetchWalletTransactions";
import { TOPUP_REQUESTS_QUERY_KEY } from "./fetchTopUpRequests";

interface SendCodeInput {
  phone: string;
  amount: number;
}

/** Step 1 of the jawwal (automatic) top-up — asks the backend to have
 *  JawwalPay text the customer a code confirming payment of `amount`. The
 *  frontend never talks to JawwalPay directly. */
export function useSendJawwalTopUpCode() {
  return useMutation({
    mutationFn: (input: SendCodeInput) =>
      userApi
        .post<{ sent: boolean }>("/wallet/topup-requests/jawwal/send-code", input)
        .then((r) => r.data),
  });
}

interface ConfirmInput {
  phone: string;
  amount: number;
  code: string;
}

/** Step 2 — verifies the JawwalPay code. Unlike the receipt-based methods,
 *  a correct code means the transfer already happened on JawwalPay's side,
 *  so the balance is credited immediately and the request comes back
 *  already "مكتمل" — no manual review. */
export function useConfirmJawwalTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfirmInput) =>
      userApi
        .post<TopUpRequest>("/wallet/topup-requests/jawwal/confirm", input)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALLET_TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TOPUP_REQUESTS_QUERY_KEY });
    },
  });
}
