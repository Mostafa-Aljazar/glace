import { resolveMediaSrc } from "@/lib/media";

/** Event image as served by the API — a URL, a storage-relative path, or `null`
 *  when nothing has been uploaded yet. `resolveEventImageSrc` handles all three. */
export type EventImage = string | null | undefined;

/** Default page size requested from `GET /events`. */
export const EVENTS_PER_PAGE = 8;

/** Full event — list cards + detail page. Matches `GET /events` items & `GET /events/{id}`. */
export interface IEvent {
  id: number;
  title: string;
  date: string;
  description: string;
  listImage: EventImage;
  images: EventImage[];
}

/** Paginated list response for `GET /events`. */
export interface IEventsListResponse {
  items: IEvent[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface IEventsListParams {
  page?: number;
  perPage?: number;
}

export function resolveEventImageSrc(image: EventImage): string {
  return resolveMediaSrc(image);
}
