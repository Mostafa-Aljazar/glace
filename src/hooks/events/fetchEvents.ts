import { guestApi } from "@/lib/axios";
import {
  EVENTS_PER_PAGE,
  type IEvent,
  type IEventsListParams,
  type IEventsListResponse,
} from "@/types/events.types";

export const EVENTS_QUERY_KEY = ["events"] as const;

/** Query key. Lives here, not in the `"use client"` hook, so Server
 *  Components can prefetch with it. */
export function eventsQueryKey(params: IEventsListParams = {}) {
  return [
    ...EVENTS_QUERY_KEY,
    { page: params.page ?? 1, perPage: params.perPage ?? EVENTS_PER_PAGE },
  ] as const;
}

export function isEvent(value: unknown): value is IEvent {
  if (!value || typeof value !== "object") return false;
  const e = value as Partial<IEvent>;
  return (
    typeof e.id === "number" &&
    typeof e.title === "string" &&
    typeof e.date === "string" &&
    typeof e.description === "string" &&
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

/** Fetches paginated events from `GET /events`. Backend is the only source. */
export async function fetchEvents(
  params: IEventsListParams = {},
): Promise<IEventsListResponse> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? EVENTS_PER_PAGE;

  const res = await guestApi.get<IEventsListResponse>("/events", {
    params: { page, perPage },
  });

  if (!isEventsListResponse(res?.data)) {
    throw new Error("Invalid /events response shape");
  }

  return res.data;
}

export default fetchEvents;
