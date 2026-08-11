"use client";

import { useQuery } from "@tanstack/react-query";
import fetchEvents, {
  EVENTS_QUERY_KEY,
  eventsQueryKey,
} from "@/hooks/events/fetchEvents";
import {
  EVENTS_PER_PAGE,
  type IEventsListParams,
  type IEventsListResponse,
} from "@/types/events.types";

export { EVENTS_QUERY_KEY, eventsQueryKey };

/** Loads paginated events (`GET /events`). */
export function useEvents(params: IEventsListParams = {}) {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? EVENTS_PER_PAGE;

  return useQuery<IEventsListResponse>({
    queryKey: eventsQueryKey({ page, perPage }),
    queryFn: () => fetchEvents({ page, perPage }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
