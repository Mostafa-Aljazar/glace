"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useWalletStore } from "@/store/walletStore";
import { WALLET_QUERY_KEY, fetchWallet } from "./fetchWallet";

export function useWallet() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const setBalance = useWalletStore((s) => s.setBalance);

  const query = useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: fetchWallet,
    enabled: isLoggedIn,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (query.data) setBalance(query.data.balance);
  }, [query.data, setBalance]);

  return query;
}
