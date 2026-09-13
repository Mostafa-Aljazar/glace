import { userApi } from "@/lib/axios";
import type { SavedAddress } from "@/store/addressStore";
import { fetchDeliveryZones } from "@/lib/deliveryZones";

export const ADDRESSES_QUERY_KEY = ["addresses"] as const;

/** The backend currently returns `zoneId` on each address but omits
 *  `area`/`zoneDescription`/`fee` from the response, even though it accepts
 *  them on save — so fill them back in here from the zones list until the
 *  backend includes them itself. */
export async function fetchAddresses(): Promise<SavedAddress[]> {
  const [addresses, zones] = await Promise.all([
    userApi.get<SavedAddress[]>("/addresses").then((r) => r.data),
    fetchDeliveryZones().catch(() => []),
  ]);

  return addresses.map((address) => {
    if (address.area) return address;
    const zone = zones.find((z) => z.id === address.zoneId);
    if (!zone) return address;
    return {
      ...address,
      area: zone.name,
      zoneDescription: zone.description,
      fee: zone.fee,
    };
  });
}
