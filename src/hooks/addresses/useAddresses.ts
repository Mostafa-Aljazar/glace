"use client";

import { useQuery } from "@tanstack/react-query";
import { ADDRESSES_QUERY_KEY, fetchAddresses } from "./fetchAddresses";

export function useAddresses() {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: fetchAddresses,
    staleTime: 1000 * 60 * 5,
  });
}
