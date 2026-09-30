import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import EventDetailClientPage from "@/components/Events/EventDetailClientPage";
// Import from the fetch module, not the `"use client"` hook.
import fetchEventById, {
  eventQueryKey,
} from "@/hooks/events/fetchEventById";
import { createQueryClient } from "@/lib/reactQuery";
import JsonLd from "@/components/Common/JsonLd";
import {
  breadcrumbJsonLd,
  eventJsonLd,
  pageMetadata,
  toMetaDescription,
} from "@/lib/seo";
import { resolveEventImageSrc, type IEvent } from "@/types/events.types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // A backend outage must not break metadata generation for the whole route.
  const event = await fetchEventById(Number(id)).catch(() => null);
  if (!event) return { title: "الفعالية" };

  return pageMetadata({
    title: event.title,
    description: toMetaDescription(event.description) || event.title,
    path: `/events/${event.id}`,
    image: event.listImage ? resolveEventImageSrc(event.listImage) : null,
    imageAlt: event.title,
    ogType: "article",
  });
}

/** Every uploaded image of the event, cover first, without duplicates. */
function eventImageUrls(event: IEvent): string[] {
  const urls = [event.listImage, ...event.images]
    .filter(Boolean)
    .map((image) => resolveEventImageSrc(image));
  return [...new Set(urls)];
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const eventId = Number(id);

  const queryClient = createQueryClient();

  // `fetchEventById` resolves to null only for a genuine 404; anything else
  // throws, so an outage falls through to the client's error + retry state
  // instead of wrongly claiming the event does not exist.
  let notFoundEvent = false;
  let event: IEvent | null = null;
  try {
    event = await fetchEventById(eventId);
    if (!event) notFoundEvent = true;
    else queryClient.setQueryData(eventQueryKey(eventId), event);
  } catch {
    // Leave the cache empty — the client refetches and shows its error state.
  }

  if (notFoundEvent) notFound();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {event && (
        <JsonLd
          data={[
            eventJsonLd(event, eventImageUrls(event)),
            breadcrumbJsonLd([
              { name: "الفعاليات والمناسبات", path: "/events" },
              { name: event.title, path: `/events/${event.id}` },
            ]),
          ]}
        />
      )}
      <EventDetailClientPage id={eventId} />
    </HydrationBoundary>
  );
}
