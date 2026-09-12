"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";
import type { SavedAddress } from "@/store/addressStore";
import { ADDRESSES_QUERY_KEY } from "./fetchAddresses";

type AddressEdit = Omit<SavedAddress, "id" | "isDefault">;

export function useUpdateAddress(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddressEdit) =>
      userApi.put<SavedAddress>(`/addresses/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}
