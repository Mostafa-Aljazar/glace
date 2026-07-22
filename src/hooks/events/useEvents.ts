"use client";

import { useQuery } from "@tanstack/react-query";
import {
  FAKE_EVENTS,
  EVENTS_PER_PAGE,
  paginateEvents,
} from "@/data/fake-data/events";
import fetchEvents from "@/hooks/events/fetchEvents";
import type {
  IEventsListParams,
  IEventsListResponse,
} from "@/types/events.types";

export const EVENTS_QUERY_KEY = ["events"] as const;

export function eventsQueryKey(params: IEventsListParams = {}) {
  return [
    ...EVENTS_QUERY_KEY,
    { page: params.page ?? 1, perPage: params.perPage ?? EVENTS_PER_PAGE },
  ] as const;
}

/**
 * Loads paginated events (`GET /events`).
 * Uses fake data as initial/fallback content so the UI never goes empty.
 */
export function useEvents(params: IEventsListParams = {}) {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? EVENTS_PER_PAGE;

  return useQuery<IEventsListResponse>({
    queryKey: eventsQueryKey({ page, perPage }),
    queryFn: () => fetchEvents({ page, perPage }),
    initialData: paginateEvents(FAKE_EVENTS, page, perPage),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
