"use client";

import { useSyncExternalStore } from "react";
import { useCartStore } from "@/store/cartStore";

const noop = () => {};

/**
 * The cart is persisted to localStorage, so anything rendered from it must
 * wait for hydration — otherwise the server HTML (empty cart) and the first
 * client render disagree. The server snapshot is always `false`, so the
 * hydrating render matches the server and flips once the store is ready.
 */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useCartStore.persist?.onFinishHydration(onChange) ?? noop,
    () => useCartStore.persist?.hasHydrated() ?? true,
    () => false,
  );
}
