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
 * specific places. A place is recognised either by its CID (the hex pair
 * after `!1s` in a Maps place URL, e.g. `0x...:0x63812dcdb0e703ee` for فرع
 * الرمال) or by its pin coordinates. The `pb` embed pins the actual business,
 * so Google shows its name and info card; a bare `?q=lat,lng&output=embed`
 * drops an anonymous pin and shows "تعذّر تحميل معلومات المكان" instead.
 */
const KNOWN_PLACES: { cid: string; lat: string; lng: string; embed: string }[] = [
  {
    // glace elameer — فرع الرمال (https://maps.app.goo.gl/rvAARRPZinuLgV827)
    cid: "0x63812dcdb0e703ee",
    lat: "31.5199517",
    lng: "34.4413232",
    embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1700!2d34.4413232!3d31.5199517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14fd7fa668193343%3A0x63812dcdb0e703ee!2zZ2xhY2UgZWxhbWVlciDYrNmE2KfYs9mK2Ycg2KfZhNij2YXZitixINmB2LHYuSDYp9mE2LHZhdin2YQ!5e0!3m2!1sar!2sps!4v1789583836753!5m2!1sar!2sps",
  },
];

/**
 * The backend sends `branch.mapSrc` either as a Google Maps "place" page URL
 * (`google.com/maps/place/...`) or as a coordinate-only embed
 * (`google.com/maps?q=lat,lng&output=embed`). Google refuses to frame the
 * first (X-Frame-Options), and the second renders an anonymous pin with a
 * "couldn't load place info" card. This resolves both to the best embed:
 *
 * 1. Google-issued `/maps/embed?pb=...` URLs pass through unchanged.
 * 2. A recognised place (by CID or pin coordinates, see `KNOWN_PLACES`) uses
 *    Google's own embed for that exact business.
 * 3. Other `output=embed` URLs pass through unchanged.
 * 4. Otherwise falls back to a `@lat,lng` or place-name search embed built
 *    from the URL itself.
 *
 * Remove the known-place table once the backend sends `pb` embed URLs
 * directly (Maps > Share > Embed a map).
 */
export function resolveMapEmbedSrc(src: unknown): string {
  if (typeof src !== "string" || !src.trim()) return "";
  const value = src.trim();

  if (value.includes("/maps/embed")) return value;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Malformed escapes — match against the raw string instead.
  }
  const known = KNOWN_PLACES.find(
    (place) =>
      decoded.includes(place.cid) ||
      decoded.includes(`${place.lat},${place.lng}`),
  );
  if (known) return known.embed;

  if (value.includes("output=embed")) return value;

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
