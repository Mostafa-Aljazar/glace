"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import type { SavedAddress } from "@/store/addressStore";
import { ADDRESSES_QUERY_KEY } from "./fetchAddresses";

type NewAddress = Omit<SavedAddress, "id" | "isDefault">;

export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewAddress) =>
      userApi.post<SavedAddress>("/addresses", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}
