import { userApi } from "@/lib/axios";
import { fromWireTopUpMethod, type WalletTransaction } from "@/store/walletStore";

export const WALLET_TRANSACTIONS_PER_PAGE = 20;

export interface WalletTransactionsParams {
  page?: number;
  perPage?: number;
}

type WalletTransactionDto = Omit<WalletTransaction, "method"> & { method?: string };

interface WalletTransactionsResponseDto {
  items: WalletTransactionDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface WalletTransactionsResponse {
  items: WalletTransaction[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export const WALLET_TRANSACTIONS_QUERY_KEY = ["wallet", "transactions"] as const;

/** Lives here, not in the `"use client"` hook, so Server Components can
 *  prefetch with it — matches the pattern in hooks/events/fetchEvents.ts. */
export function walletTransactionsQueryKey(params: WalletTransactionsParams = {}) {
  return [
    ...WALLET_TRANSACTIONS_QUERY_KEY,
    {
      page: params.page ?? 1,
      perPage: params.perPage ?? WALLET_TRANSACTIONS_PER_PAGE,
    },
  ] as const;
}

export async function fetchWalletTransactions(
  params: WalletTransactionsParams = {},
): Promise<WalletTransactionsResponse> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? WALLET_TRANSACTIONS_PER_PAGE;

  return userApi
    .get<WalletTransactionsResponseDto>("/wallet/transactions", {
      params: { page, perPage },
    })
    .then((r) => ({
      ...r.data,
      items: r.data.items.map((item) => ({
        ...item,
        method: fromWireTopUpMethod(item.method),
      }) as WalletTransaction),
    }));
}
