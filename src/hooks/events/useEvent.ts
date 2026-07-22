"use client";

import { useQuery } from "@tanstack/react-query";
import { findFakeEventById, FAKE_EVENTS } from "@/data/fake-data/events";
import fetchEventById from "@/hooks/events/fetchEventById";
import type { IEvent } from "@/types/events.types";

export function eventQueryKey(id: number) {
  return ["events", id] as const;
}

/**
 * Loads a single event (`GET /events/{id}`).
 * Falls back to fake data; `data` is `null` when the id does not exist.
 */
export function useEvent(id: number) {
  return useQuery<IEvent | null>({
    queryKey: eventQueryKey(id),
    queryFn: () => fetchEventById(id),
    initialData: findFakeEventById(id) ?? null,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: Number.isFinite(id) && id > 0,
  });
}

/** Related events excluding the current one (from fake catalog for initial paint). */
export function getRelatedEvents(id: number, limit = 6): IEvent[] {
  return FAKE_EVENTS.filter((e) => e.id !== id).slice(0, limit);
}
