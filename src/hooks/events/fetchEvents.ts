import { guestApi } from "@/lib/axios";
import {
  FAKE_EVENTS,
  EVENTS_PER_PAGE,
  paginateEvents,
} from "@/data/fake-data/events";
import type {
  IEvent,
  IEventsListParams,
  IEventsListResponse,
} from "@/types/events.types";

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

function isEventsListResponse(value: unknown): value is IEventsListResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<IEventsListResponse>;
  return (
    Array.isArray(data.items) &&
    data.items.every(isEvent) &&
    typeof data.total === "number" &&
    typeof data.page === "number" &&
    typeof data.perPage === "number" &&
    typeof data.totalPages === "number"
  );
}

/**
 * Fetches paginated events from `GET /events`.
 * Falls back to `FAKE_EVENTS` when the API fails or returns invalid data.
 */
export async function fetchEvents(
  params: IEventsListParams = {},
): Promise<IEventsListResponse> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? EVENTS_PER_PAGE;

  try {
    const res = await guestApi.get<IEventsListResponse>("/events", {
      params: { page, perPage },
    });
    if (isEventsListResponse(res?.data)) return res.data;
    return paginateEvents(FAKE_EVENTS, page, perPage);
  } catch (e) {
    console.error("[fetchEvents]", e);
    return paginateEvents(FAKE_EVENTS, page, perPage);
  }
}

export default fetchEvents;
