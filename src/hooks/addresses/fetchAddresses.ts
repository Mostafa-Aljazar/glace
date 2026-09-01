import { userApi } from "@/lib/axios";
import type { SavedAddress } from "@/store/addressStore";

export const ADDRESSES_QUERY_KEY = ["addresses"] as const;

export async function fetchAddresses(): Promise<SavedAddress[]> {
  return userApi.get<SavedAddress[]>("/addresses").then((r) => r.data);
}
