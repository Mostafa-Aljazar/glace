import { guestApi } from "@/lib/axios";
import { FAKE_ADDONS } from "@/data/fake-data/menu";
import type { IAddonOption } from "@/types/menu.types";

function isAddonOption(value: unknown): value is IAddonOption {
  if (!value || typeof value !== "object") return false;
  const a = value as Partial<IAddonOption>;
  return (
    typeof a.id === "string" &&
    typeof a.label === "string" &&
    typeof a.price === "number"
  );
}

/**
 * Fetches the shared additions (إضافات) catalog from `GET /menu/addons` — the
 * per-unit extras a customer can attach to a cart line. Falls back to
 * `FAKE_ADDONS` when the API fails or returns invalid data, so the cart's
 * "تخصيص الإضافات" flow always has options. Malformed rows are dropped
 * individually. A product may still ship its own `addons` catalog to override
 * this shared list.
 */
export async function fetchMenuAddons(): Promise<IAddonOption[]> {
  try {
    const res = await guestApi.get<IAddonOption[]>("/menu/addons");
    if (Array.isArray(res?.data)) {
      const valid = res.data.filter(isAddonOption);
      if (valid.length > 0) return valid;
    }
    return FAKE_ADDONS;
  } catch (e) {
    console.error("[fetchMenuAddons]", e);
    return FAKE_ADDONS;
  }
}

export default fetchMenuAddons;
