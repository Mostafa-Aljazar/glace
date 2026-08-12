import { guestApi } from "@/lib/axios";
import type { IHomeEvent, IHomePageData } from "@/types/home.types";

export const HOME_PAGE_QUERY_KEY = ["home-page"] as const;

const isStr = (v: unknown): v is string => typeof v === "string";
const isArr = Array.isArray;

/**
 * Defensive normalisers for known backend shape quirks.
 *
 * - `about.paragraphs`: contract is `string[]`; older payloads wrapped
 *   `{ text }` — unwrap if that form ever reappears.
 * - `events.items[].image`: home cards use `image`; some payloads may send
 *   `listImage` (same absolute `/storage/...` URL as `/events`). Prefer
 *   `image`, fall back to `listImage`.
 */
function normalizeHomePage(data: IHomePageData): IHomePageData {
  const rawParagraphs = data.about?.paragraphs as unknown;
  const paragraphs = isArr(rawParagraphs)
    ? rawParagraphs.map((p) =>
        isStr(p)
          ? p
          : isStr((p as { text?: unknown })?.text)
            ? (p as { text: string }).text
            : "",
      )
    : data.about?.paragraphs;

  const items = isArr(data.events?.items)
    ? data.events.items.map((ev) => {
        const raw = ev as IHomeEvent & { listImage?: unknown };
        const image =
          (isStr(raw.image) && raw.image.trim() !== "" ? raw.image : null) ??
          (isStr(raw.listImage) && raw.listImage.trim() !== ""
            ? raw.listImage
            : null);
        return { ...ev, image };
      })
    : data.events?.items;

  return {
    ...data,
    about: data.about ? { ...data.about, paragraphs: paragraphs ?? [] } : data.about,
    events: data.events ? { ...data.events, items: items ?? [] } : data.events,
  };
}

/**
 * Validates the whole payload, not just its top level — a shallow check let a
 * wrongly-shaped `about.paragraphs` through and crashed `AboutSection` deep in
 * the render instead of surfacing a clear error at the boundary.
 *
 * Images may be `null` (the backend has no upload yet); `resolveHomeImageSrc`
 * turns those into the neutral placeholder.
 */
function isHomePageData(value: unknown): value is IHomePageData {
  if (!value || typeof value !== "object") return false;
  const d = value as IHomePageData;

  const slidesOk =
    isArr(d.hero?.slides) &&
    d.hero.slides.every(
      (s) =>
        isStr(s?.titleH1) &&
        isStr(s?.titleH2) &&
        isStr(s?.bgColor) &&
        isStr(s?.headerBgColor) &&
        isStr(s?.h1BgColor) &&
        isStr(s?.h2BgColor),
    );

  const aboutOk =
    !!d.about &&
    isStr(d.about.title) &&
    isArr(d.about.paragraphs) &&
    d.about.paragraphs.every(isStr) &&
    isStr(d.about.ctaLabel) &&
    isStr(d.about.ctaHref);

  const whyOk =
    !!d.whyGlace &&
    isStr(d.whyGlace.title) &&
    isStr(d.whyGlace.description) &&
    isStr(d.whyGlace.videoUrl) &&
    isArr(d.whyGlace.features) &&
    d.whyGlace.features.every((f) => isStr(f?.label));

  const branchesOk =
    isArr(d.branches?.branches) &&
    d.branches.branches.every(
      (b) => isStr(b?.id) && isStr(b?.label) && isStr(b?.address),
    );

  const eventsOk =
    isArr(d.events?.items) &&
    d.events.items.every(
      (e) => typeof e?.id === "number" && isStr(e?.title) && isStr(e?.href),
    );

  return slidesOk && aboutOk && whyOk && branchesOk && eventsOk;
}

/** Fetches the full home page content from `GET /home`. Backend is the only source. */
export async function fetchHomePage(): Promise<IHomePageData> {
  const res = await guestApi.get<IHomePageData>("/home");

  // Normalise first — the shim fixes a known shape quirk, then validation
  // catches anything genuinely broken.
  const data = normalizeHomePage(res?.data);

  if (!isHomePageData(data)) {
    throw new Error("Invalid /home response shape");
  }
  return data;
}

export default fetchHomePage;
