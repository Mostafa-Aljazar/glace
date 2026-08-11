import axios from "axios";
import { guestApi } from "@/lib/axios";
import { isEvent } from "@/hooks/events/fetchEvents";
import type { IEvent } from "@/types/events.types";

/** Query key. Lives here, not in the `"use client"` hook, so Server
 *  Components can prefetch with it. */
export function eventQueryKey(id: number) {
  return ["events", id] as const;
}

/**
 * Fetches a single event from `GET /events/{id}`.
 * Resolves to `null` only on a genuine 404; any other failure rejects so the
 * UI can tell "this event doesn't exist" apart from "the API is down".
 */
export async function fetchEventById(id: number): Promise<IEvent | null> {
  try {
    const res = await guestApi.get<IEvent>(`/events/${id}`);
    if (!isEvent(res?.data)) {
      throw new Error(`Invalid /events/${id} response shape`);
    }
    return res.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

export default fetchEventById;
