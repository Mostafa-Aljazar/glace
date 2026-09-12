"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrderStore } from "@/store/orderStore";
import {
  ORDERS_PER_PAGE,
  fetchOrders,
  ordersQueryKey,
  type OrdersParams,
  type OrdersResponse,
} from "./fetchOrders";

export { ORDERS_QUERY_KEY, ordersQueryKey } from "./fetchOrders";

/** Loads one page of the current user's orders (`GET /orders`), newest first. */
export function useOrders(params: OrdersParams = {}) {
  const setOrders = useOrderStore((s) => s.setOrders);
  const page = params.page ?? 1;
  const perPage = params.perPage ?? ORDERS_PER_PAGE;

  const query = useQuery<OrdersResponse>({
    queryKey: ordersQueryKey({ page, perPage }),
    queryFn: () => fetchOrders({ page, perPage }),
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (query.data) setOrders(query.data.items);
  }, [query.data, setOrders]);

  return query;
}
