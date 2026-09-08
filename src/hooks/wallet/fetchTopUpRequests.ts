import { userApi } from "@/lib/axios";
import { fromWireTopUpMethod, type TopUpRequest } from "@/store/walletStore";

export const TOPUP_REQUESTS_QUERY_KEY = ["wallet", "topup-requests"] as const;

type TopUpRequestDto = Omit<TopUpRequest, "method"> & { method: string };

export async function fetchTopUpRequests(): Promise<TopUpRequest[]> {
  return userApi
    .get<TopUpRequestDto[]>("/wallet/topup-requests")
    .then((r) =>
      r.data.map((dto) => ({
        ...dto,
        method: fromWireTopUpMethod(dto.method),
      }) as TopUpRequest),
    );
}
