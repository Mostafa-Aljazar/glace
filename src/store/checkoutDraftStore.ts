import { create } from "zustand";
import type { DeliveryAddress, DeliveryMethod } from "@/store/orderStore";

interface CheckoutDraftState {
  hasDraft: boolean;
  deliveryMethod: DeliveryMethod;
  address?: DeliveryAddress;
  /** Saved address id the snapshot in `address` came from — sent to the
   *  real `POST /orders` as `addressId` (delivery orders only). */
  addressId?: string;
  deliveryFee: number;
  pickupTime?: string;
  setDraft: (draft: {
    deliveryMethod: DeliveryMethod;
    address?: DeliveryAddress;
    addressId?: string;
    deliveryFee: number;
    pickupTime?: string;
  }) => void;
  clearDraft: () => void;
}

/** Carries the address/delivery choice from Checkout to Payment without
 *  putting the customer's name, phone, and address in the URL — plain
 *  (non-persisted) state is enough since both pages live in the same
 *  client-side navigation flow. `hasDraft` lets Payment tell "no checkout
 *  happened yet" apart from "pickup was chosen, no address needed". */
export const useCheckoutDraftStore = create<CheckoutDraftState>()((set) => ({
  hasDraft: false,
  deliveryMethod: "delivery",
  address: undefined,
  addressId: undefined,
  deliveryFee: 0,
  pickupTime: undefined,
  setDraft: (draft) => set({ ...draft, hasDraft: true }),
  clearDraft: () =>
    set({
      hasDraft: false,
      address: undefined,
      addressId: undefined,
      deliveryFee: 0,
      pickupTime: undefined,
    }),
}));
