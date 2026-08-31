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
  street: string;
  landmark?: string;
  /** GPS pin dropped via "استخدم موقعي الحالي" or "اختر من الخريطة".
   *  Absent means the address has no map location yet. */
  location?: { lat: number; lng: number };
  isDefault: boolean;
}

interface AddressState {
  addresses: SavedAddress[];
  selectedId: string | null;
  addAddress: (address: Omit<SavedAddress, "id" | "isDefault">) => string;
  updateAddress: (
    id: string,
    address: Omit<SavedAddress, "id" | "isDefault">,
  ) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  /** Marks one address as the default, clearing the flag on every other one. */
  setDefaultAddress: (id: string) => void;
}

/** Temporary localStorage-backed simulation until the backend exposes a
 *  saved-addresses endpoint — same "fake it in the store, swap the source
 *  later" pattern used for the delivery-zone catalog in deliveryZones.ts. */
export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedId: null,
      addAddress: (address) => {
        const id = crypto.randomUUID();
        const isFirst = get().addresses.length === 0;
        set({
          addresses: [...get().addresses, { ...address, id, isDefault: isFirst }],
          selectedId: id,
        });
        return id;
      },
      updateAddress: (id, address) => {
        set({
          addresses: get().addresses.map((a) =>
            a.id === id ? { ...a, ...address } : a,
          ),
        });
      },
      removeAddress: (id) => {
        const wasDefault = get().addresses.find((a) => a.id === id)?.isDefault;
        const addresses = get().addresses.filter((a) => a.id !== id);
        if (wasDefault && addresses[0]) addresses[0].isDefault = true;
        const selectedId =
          get().selectedId === id ? (addresses[0]?.id ?? null) : get().selectedId;
        set({ addresses, selectedId });
      },
      selectAddress: (id) => set({ selectedId: id }),
      setDefaultAddress: (id) =>
        set({
          addresses: get().addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }),
    }),
    { name: "glace-addresses" }
  )
);
