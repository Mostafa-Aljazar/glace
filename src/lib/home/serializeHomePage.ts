import type {
  HomeImage,
  IHomePageData,
  ISlideData,
  IHomeAboutData,
  IHomeWhyGlaceData,
  IHomeBranchesData,
  IHomeEventsData,
} from "@/types/home.types";
import { resolveHomeImageSrc } from "@/types/home.types";

/** API-facing home payload — all images are URL strings. */
export interface IApiHomePageData {
  hero: { slides: IApiSlideData[] };
  about: IApiHomeAboutData;
  whyGlace: IApiHomeWhyGlaceData;
  branches: IApiHomeBranchesData;
  events: IApiHomeEventsData;
}

export interface IApiSlideData extends Omit<
  ISlideData,
  "manImg" | "pieceImg" | "zigzagsImg"
> {
  manImg: string;
  pieceImg: string;
  zigzagsImg: string;
}

export interface IApiHomeAboutData extends Omit<IHomeAboutData, "image"> {
  image: string;
}

export interface IApiHomeWhyGlaceData
  extends Omit<IHomeWhyGlaceData, "features" | "videoThumbnail"> {
  features: { label: string; image: string }[];
  videoThumbnail: string;
}

export interface IApiHomeBranchesData extends IHomeBranchesData {}

export interface IApiHomeEventsData
  extends Omit<IHomeEventsData, "items"> {
  items: { id: number; title: string; image: string; href: string }[];
}

function img(image: HomeImage): string {
  return resolveHomeImageSrc(image);
}

/** Convert app/fake home data into a JSON-serializable API response. */
export function toApiHomePage(data: IHomePageData): IApiHomePageData {
  return {
    hero: {
      slides: data.hero.slides.map((s) => ({
        ...s,
        manImg: img(s.manImg),
        pieceImg: img(s.pieceImg),
        zigzagsImg: img(s.zigzagsImg),
      })),
    },
    about: {
      ...data.about,
      image: img(data.about.image),
    },
    whyGlace: {
      ...data.whyGlace,
      features: data.whyGlace.features.map((f) => ({
        label: f.label,
        image: img(f.image),
      })),
      videoThumbnail: img(data.whyGlace.videoThumbnail),
    },
    branches: data.branches,
    events: {
      ...data.events,
      items: data.events.items.map((e) => ({
        ...e,
        image: img(e.image),
      })),
    },
  };
}
