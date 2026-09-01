import { userApi } from "@/lib/axios";
import { isBackendUnavailable } from "@/lib/apiWithFallback";

export const WALLET_QUERY_KEY = ["wallet"] as const;

export interface WalletResponse {
  balance: number;
}

/** Temporary fake balance shown while `/wallet` isn't live yet on the
 *  backend — remove once the real endpoint is up. */
const FAKE_BALANCE = 400;

export async function fetchWallet(): Promise<WalletResponse> {
  try {
    return await userApi.get<WalletResponse>("/wallet").then((r) => r.data);
  } catch (error) {
    if (isBackendUnavailable(error)) return { balance: FAKE_BALANCE };
    throw error;
  }
}
