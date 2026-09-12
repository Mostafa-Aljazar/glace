"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import type { SavedAddress } from "@/store/addressStore";
import { ADDRESSES_QUERY_KEY } from "./fetchAddresses";

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      userApi.post<SavedAddress>(`/addresses/${id}/default`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}
