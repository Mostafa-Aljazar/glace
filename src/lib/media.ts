import { getBackendApiUrl } from "@/lib/dataSource";

/**
 * Neutral placeholder served from `public/` — shown whenever the backend has
 * no usable image for a record. Deliberately generic: it must never stand in
 * for a real product/event photo, only signal "no image yet".
 */
export const MEDIA_PLACEHOLDER = "/media-placeholder.svg";

/** Laravel serves uploads from `{origin}/storage/...`. */
const BACKEND_STORAGE_PREFIX = "/storage/";

/**
 * Detects placeholder / non-resolvable media hosts returned by the API
 * (e.g. `https://cdn.example.com/...`, whose domain does not resolve).
 *
 * Remove the `example.com` checks once the backend serves only real uploads —
 * any other host is already passed through untouched.
 */
export function isPlaceholderMediaUrl(src: unknown): boolean {
  if (typeof src !== "string") return false;
  const value = src.trim();
  if (!value) return true;

  try {
    const { hostname } = new URL(value);
    return (
      hostname === "example.com" ||
      hostname === "cdn.example.com" ||
      hostname.endsWith(".example.com")
    );
  } catch {
    // Not absolute — a backend storage path, handled by resolveMediaSrc.
    return false;
  }
}

/**
 * True when `src` is a value `resolveMediaSrc` would turn into an actual
 * image rather than the placeholder — i.e. a non-empty string that isn't a
 * dead `example.com` host. Lets a caller fall back to a different field (e.g.
 * an event's `listImage`) when every entry in a gallery array is unusable.
 */
export function hasRealMedia(src: unknown): src is string {
  return typeof src === "string" && src.trim() !== "" && !isPlaceholderMediaUrl(src);
}

/** Origin of the API (`http://host/api` → `http://host`), for storage paths. */
function apiOrigin(): string {
  try {
    return new URL(getBackendApiUrl()).origin;
  } catch {
    return "";
  }
}

/**
 * Resolves any backend media value to something `next/image` accepts.
 *
 * Contract (handoff 04): uploads are **absolute** URLs
 * (`http(s)://…/storage/…`). Absolute URLs pass through unchanged.
 * Relative storage paths are still normalised against the API origin so older
 * or partial payloads do not crash `next/image`.
 *
 * | input                          | output                          |
 * |--------------------------------|---------------------------------|
 * | `https://host/storage/a.png`   | unchanged                       |
 * | `hero-slides/a.png`            | `{apiOrigin}/storage/hero-slides/a.png` |
 * | `/storage/hero-slides/a.png`   | `{apiOrigin}/storage/hero-slides/a.png` |
 * | `/media-placeholder.svg`       | unchanged (our own public asset) |
 * | `https://cdn.example.com/a.png`| placeholder (dead host)         |
 * | `null` / `""`                  | placeholder                     |
 */
export function resolveMediaSrc(src: unknown): string {
  if (typeof src !== "string") return MEDIA_PLACEHOLDER;

  const value = src.trim();
  if (!value) return MEDIA_PLACEHOLDER;

  // Absolute URL — pass through unless it's the known-dead placeholder host.
  if (/^https?:\/\//i.test(value)) {
    return isPlaceholderMediaUrl(value) ? MEDIA_PLACEHOLDER : value;
  }
  if (value.startsWith("data:")) return value;

  const origin = apiOrigin();

  // Backend storage path, with or without the `/storage` prefix.
  const storageRelative = value.startsWith(BACKEND_STORAGE_PREFIX)
    ? value.slice(BACKEND_STORAGE_PREFIX.length)
    : value.startsWith("storage/")
      ? value.slice("storage/".length)
      : !value.startsWith("/")
        ? value
        : null;

  if (storageRelative !== null) {
    // Without an origin we cannot build a valid URL — placeholder beats a crash.
    if (!origin) return MEDIA_PLACEHOLDER;
    return origin + BACKEND_STORAGE_PREFIX + storageRelative;
  }

  // Root-relative path served by this app (e.g. the placeholder itself).
  return value;
}

/**
 * Google-issued "Embed a map" URLs (`google.com/maps/embed?pb=...`) for
 * specific places, keyed by the place's CID (the hex pair after `!1s` in a
 * Maps place URL, e.g. `0x...:0x63812dcdb0e703ee` for فرع الرمال). These are
 * copied verbatim from Google's own Share > Embed a map dialog, so they carry
 * a proper zoom/viewport instead of the generic `?q=lat,lng` fallback below.
 */
const KNOWN_PLACE_EMBEDS: Record<string, string> = {
  "0x63812dcdb0e703ee":
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.1532118478494!2d34.43874291119057!3d31.519951674106565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14fd7fa668193343%3A0x63812dcdb0e703ee!2zZ2xhY2UgZWxhbWVlciDYrNmE2KfYs9mK2Ycg2KfZhNij2YXZitixINmB2LHYuSDYp9mE2LHZhdin2YQ!5e0!3m2!1sen!2str!4v1789583836753!5m2!1sen!2str",
};

/**
 * The backend sends `branch.mapSrc` as a normal Google Maps "place" page URL
 * (`google.com/maps/place/...`), copied from a browser address bar. Google
 * refuses to render those inside an `<iframe>` (X-Frame-Options), so the
 * embed would show a blank box. This turns that URL into the
 * `google.com/maps/embed` form Google actually allows to be framed:
 *
 * 1. Already-embeddable URLs (`/maps/embed`, `output=embed`) pass through
 *    unchanged.
 * 2. A recognised place CID (see `KNOWN_PLACE_EMBEDS`) uses Google's own
 *    embed URL for that exact place.
 * 3. Otherwise falls back to a `@lat,lng` or place-name search embed built
 *    from the URL itself.
 *
 * Remove the known-place table once the backend sends embed-ready URLs
 * directly.
 */
export function resolveMapEmbedSrc(src: unknown): string {
  if (typeof src !== "string" || !src.trim()) return "";
  const value = src.trim();

  if (value.includes("/maps/embed") || value.includes("output=embed")) {
    return value;
  }

  const cidMatch = value.match(/:(0x[0-9a-f]+)/i);
  if (cidMatch && KNOWN_PLACE_EMBEDS[cidMatch[1]]) {
    return KNOWN_PLACE_EMBEDS[cidMatch[1]];
  }

  const coords = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coords) {
    const [, lat, lng] = coords;
    return `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
  }

  const placeMatch = value.match(/\/maps\/place\/([^/?]+)/);
  if (placeMatch) {
    return `https://www.google.com/maps?q=${placeMatch[1]}&z=17&output=embed`;
  }

  return value;
}
