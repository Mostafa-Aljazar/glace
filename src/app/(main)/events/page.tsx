import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import EventsClientPage from "@/components/Events/EventsClientPage";
import { createQueryClient } from "@/lib/reactQuery";
// Import from the fetch module, not the `"use client"` hook.
import fetchEvents, { eventsQueryKey } from "@/hooks/events/fetchEvents";
import { EVENTS_PER_PAGE } from "@/types/events.types";

// Backend data changes without a redeploy (prices, products, events), so the
// prerendered HTML is refreshed on an interval instead of frozen at build
// time. Matches the client query `staleTime`.
export const revalidate = 300;


export const metadata: Metadata = {
  title: "الفعاليات و المناسبات | جلاسيه الأمير",
  description: "تصفح أحدث فعاليات ومناسبات جلاسيه الأمير",
};

export default async function EventsPage() {
  const queryClient = createQueryClient();
  const params = { page: 1, perPage: EVENTS_PER_PAGE };

  // Prefetch failures are ignored — the client query retries and renders its
  // own error state with a retry button.
  await queryClient
    .prefetchQuery({
      queryKey: eventsQueryKey(params),
      queryFn: () => fetchEvents(params),
    })
    .catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventsClientPage />
    </HydrationBoundary>
  );
}
