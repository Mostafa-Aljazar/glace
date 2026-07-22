import type { StaticIMG } from "@/assets/images";

/** Image from API (URL string) or bundled static asset (fake fallback). */
export type EventImage = StaticIMG | string;

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
  return typeof image === "string" ? image : image.src;
}
