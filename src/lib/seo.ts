import type { Metadata } from "next";
import {
  SITE_URL,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_PHONE,
  SITE_LOGO,
  SITE_OG_IMAGE,
  SITE_SOCIAL_LINKS,
} from "@/lib/site";
import type { IHomeBranch } from "@/types/home.types";
import type { IEvent } from "@/types/events.types";
import type { IProduct } from "@/types/menu.types";

/** Open Graph locale for Arabic content (language_TERRITORY). */
export const OG_LOCALE = "ar_AR";

/** Absolute URL for a site path or an already-absolute URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Collapse whitespace, cut to a search-snippet-friendly length on a word
 * boundary, and drop trailing punctuation. SEO copy on this site never ends
 * with a period or an ellipsis.
 */
export function toMetaDescription(text: string | null | undefined, max = 160) {
  let clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length > max) {
    const cut = clean.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    clean = lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut;
  }
  return clean.replace(/[\s.,،؛:;…\-–—]+$/u, "");
}

interface PageMetadataOptions {
  /** Page title without the brand — the root layout's template appends it. */
  title?: string;
  description?: string;
  /** Site-relative path of this page, e.g. `/menu`. Becomes the canonical. */
  path: string;
  /** Share image (absolute or site-relative). Defaults to the site OG image. */
  image?: string | null;
  imageAlt?: string;
  ogType?: "website" | "article";
}

/**
 * Metadata for a public, indexable page.
 *
 * Next merges metadata shallowly, so a page that sets `openGraph` replaces the
 * root one wholesale. This builds the full Open Graph / Twitter objects every
 * time, and gives each page its own canonical instead of inheriting `/`.
 */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  image,
  imageAlt,
  ogType = "website",
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const socialTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const images = [
    image
      ? { url: absoluteUrl(image), alt: imageAlt ?? title ?? SITE_NAME }
      : { url: SITE_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME },
  ];

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url },
    openGraph: {
      type: ogType,
      locale: OG_LOCALE,
      siteName: SITE_NAME,
      url,
      title: socialTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: images.map((i) => i.url),
    },
  };
}

/**
 * Metadata for pages that belong to one visitor (cart, account, order
 * tracking…). They are also disallowed in robots.txt; `noindex` covers links
 * Google finds elsewhere, which robots.txt alone cannot keep out of results.
 */
export function privatePageMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}

/* ───────────────────────────── JSON-LD ───────────────────────────── */

type JsonLd = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url: SITE_URL,
    logo: SITE_LOGO,
    image: SITE_OG_IMAGE,
    description: SITE_DESCRIPTION,
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    sameAs: SITE_SOCIAL_LINKS,
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    inLanguage: "ar",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Pin coordinates from any Google Maps URL shape the backend may send. */
export function extractMapCoords(
  mapSrc: string | null | undefined,
): { latitude: number; longitude: number } | null {
  if (!mapSrc) return null;
  const patterns: [RegExp, "latlng" | "embed"][] = [
    [/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/, "latlng"], // place data
    [/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/, "embed"], // embed pb (lng, lat)
    [/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, "latlng"],
    [/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, "latlng"],
  ];
  for (const [pattern, order] of patterns) {
    const m = mapSrc.match(pattern);
    if (!m) continue;
    const [a, b] = [Number(m[1]), Number(m[2])];
    const [latitude, longitude] = order === "latlng" ? [a, b] : [b, a];
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { latitude, longitude };
    }
  }
  return null;
}

/**
 * Turns the dashboard's free-text hours ("PM 10:30 – AM 11:00", written in
 * RTL order) into `["11:00", "22:30"]`. The earlier time is the opening one.
 * Returns null when the text isn't two clear times, so a typo in the
 * dashboard drops the hours from the schema rather than publishing wrong ones.
 */
export function parseOpeningHours(
  text: string | null | undefined,
): [opens: string, closes: string] | null {
  if (!text) return null;
  const times = [
    ...text.matchAll(/(AM|PM|ص|م)?\s*(\d{1,2}):(\d{2})\s*(AM|PM|ص|م)?/gi),
  ].map((m) => {
    const meridiem = (m[1] ?? m[4] ?? "").toUpperCase();
    let hours = Number(m[2]);
    const minutes = Number(m[3]);
    if (meridiem === "PM" || meridiem === "م") {
      if (hours < 12) hours += 12;
    } else if ((meridiem === "AM" || meridiem === "ص") && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  });
  if (times.length !== 2 || times.some((t) => t >= 24 * 60)) return null;

  const [opens, closes] = [Math.min(...times), Math.max(...times)];
  const fmt = (t: number) =>
    `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  return [fmt(opens), fmt(closes)];
}

/** Gaza's weekend is Friday — "weekday" hours cover Saturday to Thursday. */
const WEEKDAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

/** Normalise a local mobile number ("0592 226 522") to E.164 (+970…). */
function toInternationalPhone(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return SITE_PHONE;
  if (digits.startsWith("970") || digits.startsWith("972")) return `+${digits}`;
  return `+970${digits.replace(/^0/, "")}`;
}

/** One `IceCreamShop` (a LocalBusiness) per branch, for Google's local results. */
export function branchJsonLd(branch: IHomeBranch): JsonLd {
  const coords = extractMapCoords(branch.mapSrc);
  const weekday = parseOpeningHours(branch.weekdayHours);
  const friday = parseOpeningHours(branch.fridayHours);

  const openingHoursSpecification = [
    weekday && {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: WEEKDAYS,
      opens: weekday[0],
      closes: weekday[1],
    },
    friday && {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: friday[0],
      closes: friday[1],
    },
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "IceCreamShop",
    "@id": `${SITE_URL}/#branch-${branch.id}`,
    name: `${SITE_NAME} ${branch.label}`,
    url: SITE_URL,
    image: SITE_OG_IMAGE,
    logo: SITE_LOGO,
    telephone: toInternationalPhone(branch.phone),
    priceRange: "₪",
    currenciesAccepted: "ILS",
    servesCuisine: ["آيس كريم", "حلويات", "عصائر", "Ice cream", "Desserts"],
    hasMenu: `${SITE_URL}/menu`,
    acceptsReservations: false,
    parentOrganization: { "@id": ORGANIZATION_ID },
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: "غزة",
      addressCountry: "PS",
    },
    ...(coords
      ? { geo: { "@type": "GeoCoordinates", ...coords } }
      : {}),
    ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
  };
}

/** Every price a product can be ordered at, across items, sizes and mixes. */
function productPrices(product: IProduct): number[] {
  const prices: number[] =
    product.kind === "flat-list"
      ? [
          ...product.items.filter((i) => i.available).map((i) => i.price),
          ...(product.mixes ?? [])
            .filter((m) => m.available !== false)
            .map((m) => m.basePrice),
        ]
      : product.sizes
          .filter((s) => s.available !== false)
          .flatMap((s) => s.prices.map((p) => p.price));
  return prices.filter((p) => Number.isFinite(p) && p > 0);
}

export function productJsonLd(product: IProduct, imageUrl: string): JsonLd {
  const url = absoluteUrl(`/menu/order/${product.slug}`);
  const prices = productPrices(product);
  const availability = product.available
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: toMetaDescription(product.description) || product.name,
    image: absoluteUrl(imageUrl),
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(prices.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "ILS",
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: prices.length,
            availability,
            url,
            seller: { "@id": ORGANIZATION_ID },
          },
        }
      : {}),
  };
}

/** ISO date from the event's `date` when it parses; null otherwise. */
function toIsoDate(value: string): string | null {
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

export function eventJsonLd(event: IEvent, imageUrls: string[]): JsonLd {
  const startDate = toIsoDate(event.date);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: toMetaDescription(event.description, 300) || event.title,
    url: absoluteUrl(`/events/${event.id}`),
    image: imageUrls.map(absoluteUrl),
    ...(startDate ? { startDate } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@id": ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL },
  };
}

/** Breadcrumb trail; the first crumb is always the home page. */
export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
): JsonLd {
  const trail = [{ name: SITE_NAME, path: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
