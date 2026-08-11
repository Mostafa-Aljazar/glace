import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import EventDetailClientPage from "@/components/Events/EventDetailClientPage";
// Import from the fetch module, not the `"use client"` hook.
import fetchEventById, {
  eventQueryKey,
} from "@/hooks/events/fetchEventById";
import { createQueryClient } from "@/lib/reactQuery";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // A backend outage must not break metadata generation for the whole route.
  const event = await fetchEventById(Number(id)).catch(() => null);
  if (!event) return { title: "الفعالية | جلاسيه الأمير" };

  return {
    title: `${event.title} | جلاسيه الأمير`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const eventId = Number(id);

  const queryClient = createQueryClient();

  // `fetchEventById` resolves to null only for a genuine 404; anything else
  // throws, so an outage falls through to the client's error + retry state
  // instead of wrongly claiming the event does not exist.
  let notFoundEvent = false;
  try {
    const event = await fetchEventById(eventId);
    if (!event) notFoundEvent = true;
    else queryClient.setQueryData(eventQueryKey(eventId), event);
  } catch {
    // Leave the cache empty — the client refetches and shows its error state.
  }

  if (notFoundEvent) notFound();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventDetailClientPage id={eventId} />
    </HydrationBoundary>
  );
}
