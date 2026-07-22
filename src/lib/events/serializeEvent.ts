import type { IEvent } from "@/types/events.types";
import { resolveEventImageSrc } from "@/types/events.types";

/** API-facing event — all images are URL strings. */
export interface IApiEvent {
  id: number;
  title: string;
  date: string;
  description: string;
  listImage: string;
  images: string[];
}

export function toApiEvent(event: IEvent): IApiEvent {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    description: event.description,
    listImage: resolveEventImageSrc(event.listImage),
    images: event.images.map(resolveEventImageSrc),
  };
}

export function toApiEvents(events: IEvent[]): IApiEvent[] {
  return events.map(toApiEvent);
}
