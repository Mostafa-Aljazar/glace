import { guestApi } from "@/lib/axios";

/** One named delivery zone — a neighborhood/area with its boundary streets
 *  spelled out so customers can self-identify without needing GPS. */
export interface DeliveryZone {
  id: string;
  name: string;
  /** Boundary streets/landmarks describing the zone's extent, e.g.
   *  "من مفترق العائلات - مفترق اللبابيدي". Shown as a hint under the name. */
  description?: string;
  /** Delivery fee for this zone — 0 until pricing is finalized per zone. */
  fee: number;
}

export async function fetchDeliveryZones(): Promise<DeliveryZone[]> {
  return guestApi.get<DeliveryZone[]>("/addresses/delivery-zones").then((r) => r.data);
}
