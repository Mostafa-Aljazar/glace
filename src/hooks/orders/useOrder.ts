"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrderStore } from "@/store/orderStore";
import { orderQueryKey, fetchOrderById } from "./fetchOrderById";

export function useOrder(id: string) {
  const upsertOrder = useOrderStore((s) => s.upsertOrder);

  const query = useQuery({
    queryKey: orderQueryKey(id),
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (query.data) upsertOrder(query.data);
  }, [query.data, upsertOrder]);

  return query;
}
