import { getApiBaseUrl } from "@/lib/dataSource";

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
    return new URL(getApiBaseUrl()).origin;
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
