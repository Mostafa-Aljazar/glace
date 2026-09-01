"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import { useOrderStore, type Order } from "@/store/orderStore";
import { ORDERS_QUERY_KEY } from "./fetchOrders";
import { orderQueryKey } from "./fetchOrderById";

export function useMarkReceived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      userApi.post<Order>(`/orders/${id}/received`).then((r) => r.data),
    onSuccess: (order) => {
      useOrderStore.getState().upsertOrder(order);
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: orderQueryKey(order.id) });
    },
  });
}
