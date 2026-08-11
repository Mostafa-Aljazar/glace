"use client";

import { useQuery } from "@tanstack/react-query";
import fetchEventById, {
  eventQueryKey,
} from "@/hooks/events/fetchEventById";
import type { IEvent } from "@/types/events.types";

export { eventQueryKey };

/** Loads a single event (`GET /events/{id}`). */
export function useEvent(id: number) {
  return useQuery<IEvent | null>({
    queryKey: eventQueryKey(id),
    queryFn: () => fetchEventById(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: Number.isFinite(id) && id > 0,
  });
}
