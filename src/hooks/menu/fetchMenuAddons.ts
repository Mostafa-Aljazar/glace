import { guestApi } from "@/lib/axios";
import type { IAddonOption } from "@/types/menu.types";

/** Query key. Lives here, not in the `"use client"` hook, so Server
 *  Components can prefetch with it. */
export const MENU_ADDONS_QUERY_KEY = ["menu-addons"] as const;

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
 * Fetches the shared additions catalog from `GET /menu/addons`.
 * Backend is the only source — prices here are charged to the customer, so a
 * bad payload must reject rather than fall back to a stale local copy.
 */
export async function fetchMenuAddons(): Promise<IAddonOption[]> {
  const res = await guestApi.get<IAddonOption[]>("/menu/addons");

  if (!Array.isArray(res?.data)) {
    throw new Error("Invalid /menu/addons response shape");
  }

  const invalid = res.data.filter((a) => !isAddonOption(a));
  if (invalid.length > 0) {
    throw new Error(
      `Invalid addon records in /menu/addons (${invalid.length}/${res.data.length})`,
    );
  }

  return res.data;
}

export default fetchMenuAddons;
