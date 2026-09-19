"use client";

import { useQuery } from "@tanstack/react-query";
import fetchStoreStatus, {
  STORE_STATUS_QUERY_KEY,
  type StoreStatusResponse,
} from "@/hooks/store/fetchStoreStatus";

export { STORE_STATUS_QUERY_KEY };

/**
 * Loads real-time store and delivery status (`GET /store/status`).
 * Provides current open/closed state for both store and delivery service,
 * along with user-facing messages and full schedule information.
 */
export function useStoreStatus() {
  return useQuery<StoreStatusResponse>({
    queryKey: STORE_STATUS_QUERY_KEY,
    queryFn: fetchStoreStatus,
    staleTime: 1000 * 60, // Cache for 1 minute (status updates rarely)
    refetchOnWindowFocus: true, // Refetch if user returns to tab
  });
}

export default useStoreStatus;
