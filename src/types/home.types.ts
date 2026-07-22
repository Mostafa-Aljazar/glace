import type { StaticIMG } from "@/assets/images";

/** Image from API (URL string) or bundled static asset (fake fallback). */
export type HomeImage = StaticIMG | string;

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

export interface IHomeWhyFeature {
  label: string;
  image: HomeImage;
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

export interface IHomeOpinion {
  id: number;
  name: string;
  text: string;
  image: HomeImage;
}

export interface IHomeOpinionsData {
  title: string;
  items: IHomeOpinion[];
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
  opinions: IHomeOpinionsData;
}

export function resolveHomeImageSrc(image: HomeImage): string {
  return typeof image === "string" ? image : image.src;
}
