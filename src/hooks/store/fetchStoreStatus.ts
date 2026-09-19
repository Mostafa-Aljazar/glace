import { guestApi } from "@/lib/axios";

export interface StoreSchedule {
  day: string;
  label: string;
  enabled: boolean;
  open: string;
  close: string;
  allDay: boolean;
}

export interface StoreStatusDetails {
  open: boolean;
  source: "schedule" | "override";
  override: boolean | null;
  scheduleOpen: boolean;
  opensAt: string | null;
  closesAt: string | null;
  nextChangeAt: string | null;
  today: StoreSchedule;
}

export interface StoreStatusResponse {
  storeOpen: boolean;
  deliveryOpen: boolean;
  closedMessage: string;
  deliveryClosedMessage: string;
  autoConfirmMinutes: number;
  timezone: string;
  serverTime: string;
  store: StoreStatusDetails;
  delivery: StoreStatusDetails;
  schedule: {
    store: StoreSchedule[];
    delivery: StoreSchedule[];
  };
}

export const STORE_STATUS_QUERY_KEY = ["store-status"] as const;

/**
 * Fetches store and delivery status from `GET /store/status`.
 * This endpoint is public and provides real-time information about:
 * - Whether the store is open/closed
 * - Whether delivery is available
 * - User-facing messages for each state
 * - Full schedule for both store and delivery
 * - Server timezone and current time
 */
export async function fetchStoreStatus(): Promise<StoreStatusResponse> {
  const res = await guestApi.get<StoreStatusResponse>("/store/status");

  if (!res?.data) {
    throw new Error("Invalid /store/status response");
  }

  return res.data;
}

export default fetchStoreStatus;
