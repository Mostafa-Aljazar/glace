import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AddressType = "home" | "work" | "other";

export interface SavedAddress {
  id: string;
  type: AddressType;
  /** Free-text name for the address — defaults per type (e.g. "المنزل") but
   *  overridable, and required when type is "other". */
  label: string;
  name: string;
  phone: string;
  city: string;
  /** Named delivery zone id (see `src/lib/deliveryZones.ts`) — replaces the
   *  old free-text area field so pricing/description can be looked up. */
  zoneId: string;
  /** Zone name for display purposes */
  area?: string;
  /** Boundary streets/landmarks describing the zone's extent */
  zoneDescription?: string;
  /** Delivery fee for this zone */
  fee?: number;
  street: string;
  landmark?: string;
  /** GPS pin dropped via "استخدم موقعي الحالي" or "اختر من الخريطة".
   *  Absent means the address has no map location yet. */
  location?: { lat: number; lng: number };
  isDefault: boolean;
}

interface AddressState {
  /** Which saved address is selected for checkout — persisted to
   *  localStorage so a freshly-created address (confirmed via
   *  `POST /addresses`, then explicitly re-selected from the saved list)
   *  survives navigation between checkout and payment. The addresses
   *  themselves still live on the server, see `src/hooks/addresses/*`. */
  selectedId: string | null;
  selectAddress: (id: string) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      selectedId: null,
      selectAddress: (id) => set({ selectedId: id }),
    }),
    { name: "glace-selected-address" },
  ),
);
