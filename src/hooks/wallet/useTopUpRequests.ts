"use client";

import { useQuery } from "@tanstack/react-query";
import { TOPUP_REQUESTS_QUERY_KEY, fetchTopUpRequests } from "./fetchTopUpRequests";

export function useTopUpRequests() {
  return useQuery({
    queryKey: TOPUP_REQUESTS_QUERY_KEY,
    queryFn: fetchTopUpRequests,
    staleTime: 1000 * 30,
  });
}
