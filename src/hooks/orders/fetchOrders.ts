import { userApi } from "@/lib/axios";
import type { Order } from "@/store/orderStore";

export const ORDERS_PER_PAGE = 20;

export interface OrdersParams {
  page?: number;
  perPage?: number;
}

export interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export const ORDERS_QUERY_KEY = ["orders"] as const;

/** Lives here, not in the `"use client"` hook, so Server Components can
 *  prefetch with it — matches the pattern in hooks/wallet/fetchWalletTransactions.ts. */
export function ordersQueryKey(params: OrdersParams = {}) {
  return [
    ...ORDERS_QUERY_KEY,
    {
      page: params.page ?? 1,
      perPage: params.perPage ?? ORDERS_PER_PAGE,
    },
  ] as const;
}

export async function fetchOrders(params: OrdersParams = {}): Promise<OrdersResponse> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? ORDERS_PER_PAGE;

  return userApi
    .get<OrdersResponse>("/orders", { params: { page, perPage } })
    .then((r) => r.data);
}
