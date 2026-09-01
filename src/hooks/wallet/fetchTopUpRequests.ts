import { userApi } from "@/lib/axios";
import type { TopUpRequest } from "@/store/walletStore";

export const TOPUP_REQUESTS_QUERY_KEY = ["wallet", "topup-requests"] as const;

export async function fetchTopUpRequests(): Promise<TopUpRequest[]> {
  return userApi
    .get<TopUpRequest[]>("/wallet/topup-requests")
    .then((r) => r.data);
}
