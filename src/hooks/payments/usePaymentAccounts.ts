"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPaymentAccounts } from "@/lib/merchantPaymentAccounts";

export const PAYMENT_ACCOUNTS_QUERY_KEY = ["payment-accounts"] as const;

export function usePaymentAccounts() {
  return useQuery({
    queryKey: PAYMENT_ACCOUNTS_QUERY_KEY,
    queryFn: fetchPaymentAccounts,
    staleTime: 1000 * 60 * 30,
  });
}
