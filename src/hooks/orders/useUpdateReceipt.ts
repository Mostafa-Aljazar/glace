"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import { useOrderStore, type Order } from "@/store/orderStore";
import { ORDERS_QUERY_KEY } from "./fetchOrders";
import { orderQueryKey } from "./fetchOrderById";

interface UpdateReceiptInput {
  id: string;
  receiptImage?: File;
  receiptNote?: string;
}

export function useUpdateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, receiptImage, receiptNote }: UpdateReceiptInput) => {
      const formData = new FormData();
      if (receiptImage) formData.append("receiptImage", receiptImage);
      if (receiptNote) formData.append("receiptNote", receiptNote);

      return userApi
        .post<Order>(`/orders/${id}/receipt`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    },
    onSuccess: (order) => {
      useOrderStore.getState().upsertOrder(order);
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: orderQueryKey(order.id) });
    },
  });
}
