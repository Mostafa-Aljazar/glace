"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  WALLET_TRANSACTIONS_PER_PAGE,
  fetchWalletTransactions,
  walletTransactionsQueryKey,
  type WalletTransactionsParams,
  type WalletTransactionsResponse,
} from "./fetchWalletTransactions";

export { WALLET_TRANSACTIONS_QUERY_KEY, walletTransactionsQueryKey } from "./fetchWalletTransactions";

/** Loads one page of the current user's wallet transactions
 *  (`GET /wallet/transactions`). */
export function useWalletTransactions(params: WalletTransactionsParams = {}) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const page = params.page ?? 1;
  const perPage = params.perPage ?? WALLET_TRANSACTIONS_PER_PAGE;

  return useQuery<WalletTransactionsResponse>({
    queryKey: walletTransactionsQueryKey({ page, perPage }),
    queryFn: () => fetchWalletTransactions({ page, perPage }),
    enabled: isLoggedIn,
    staleTime: 1000 * 30,
  });
}
