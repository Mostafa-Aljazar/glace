"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import { WALLET_QUERY_KEY, fetchWallet } from "./fetchWallet";
import { WALLET_TRANSACTIONS_QUERY_KEY } from "./fetchWalletTransactions";

interface DeductInput {
  amount: number;
  label?: string;
}

export function useDeductWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeductInput) => {
      // Refetch the live balance from the backend right before deducting —
      // never trust a cached/local balance for a money-moving operation.
      const fresh = await queryClient.fetchQuery({
        queryKey: WALLET_QUERY_KEY,
        queryFn: fetchWallet,
      });
      if (fresh.balance < input.amount) {
        throw new Error("الرصيد غير كافٍ");
      }
      return userApi
        .post<{ balance: number }>("/wallet/deduct", input)
        .then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALLET_TRANSACTIONS_QUERY_KEY });
    },
  });
}
