import { guestApi } from "@/lib/axios";
import { findFakeEventById } from "@/data/fake-data/events";
import type { IEvent } from "@/types/events.types";

function isEvent(value: unknown): value is IEvent {
  if (!value || typeof value !== "object") return false;
  const e = value as Partial<IEvent>;
  return (
    typeof e.id === "number" &&
    typeof e.title === "string" &&
    typeof e.date === "string" &&
    typeof e.description === "string" &&
    e.listImage != null &&
    Array.isArray(e.images)
  );
}

/**
 * Fetches a single event from `GET /events/{id}`.
 * Falls back to fake data when the API fails; returns `null` if not found.
 */
export async function fetchEventById(id: number): Promise<IEvent | null> {
  try {
    const res = await guestApi.get<IEvent>(`/events/${id}`);
    if (isEvent(res?.data)) return res.data;
    return findFakeEventById(id) ?? null;
  } catch (e) {
    console.error(`[fetchEventById:${id}]`, e);
    return findFakeEventById(id) ?? null;
  }
}

export default fetchEventById;
