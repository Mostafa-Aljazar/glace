import { resolveMediaSrc } from "@/lib/media";

/** Home image as served by the API — a URL, a storage-relative path, or `null`
 *  when nothing has been uploaded yet. `resolveHomeImageSrc` handles all three. */
export type HomeImage = string | null | undefined;

export interface ISlideData {
  manImg: HomeImage;
  pieceImg: HomeImage;
  zigzagsImg: HomeImage;
  titleH1: string;
  titleH2: string;
  bgColor: string;
  headerBgColor: string;
  h1BgColor: string;
  h2BgColor: string;
}

export interface IHomeAboutData {
  title: string;
  paragraphs: string[];
  image: HomeImage;
  ctaLabel: string;
  ctaHref: string;
}

/** A "why Glace" pill. Only the text comes from the backend — the coloured
 *  blob behind it is fixed frontend decoration, alternating blue/brown by
 *  position, so the design stays consistent whatever the dashboard says. */
export interface IHomeWhyFeature {
  label: string;
}

export interface IHomeWhyGlaceData {
  title: string;
  description: string;
  features: IHomeWhyFeature[];
  videoUrl: string;
  videoThumbnail: HomeImage;
}

export interface IHomeBranch {
  id: string;
  label: string;
  mapSrc: string;
  address: string;
  phone: string;
  whatsapp: string;
  weekdayHours: string;
  fridayHours: string;
  borderRadius: string;
}

export interface IHomeBranchesData {
  title: string;
  branches: IHomeBranch[];
}

export interface IHomeEvent {
  id: number;
  title: string;
  image: HomeImage;
  href: string;
}

export interface IHomeEventsData {
  title: string;
  items: IHomeEvent[];
  moreLabel: string;
  moreHref: string;
}

/** Full payload for `GET /home` — one request for the entire home page. */
export interface IHomePageData {
  hero: {
    slides: ISlideData[];
  };
  about: IHomeAboutData;
  whyGlace: IHomeWhyGlaceData;
  branches: IHomeBranchesData;
  events: IHomeEventsData;
}

export function resolveHomeImageSrc(image: HomeImage): string {
  return resolveMediaSrc(image);
}
