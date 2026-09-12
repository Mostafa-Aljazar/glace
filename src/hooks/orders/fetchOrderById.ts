import { userApi } from "@/lib/axios";
import type { Order } from "@/store/orderStore";

export function orderQueryKey(id: string) {
  return ["orders", id] as const;
}

export async function fetchOrderById(id: string): Promise<Order> {
  return userApi.get<Order>(`/orders/${id}`).then((r) => r.data);
}
