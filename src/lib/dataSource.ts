/**
 * Real Laravel origin (`https://host/api` or `http://host/api`).
 * Used on the server and as the rewrite destination.
 */
export function getBackendApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://back.glaceelameer.com/api"
  );
}

/**
 * Same-origin prefix the Next.js rewrite forwards to {@link getBackendApiUrl}.
 * Browsers on the HTTPS storefront cannot call an HTTP API (mixed content) —
 * client navigations then fail while a full refresh (SSR) still works.
 */
export const API_PROXY_PREFIX = "/backend-api";

/**
 * Axios base URL. The browser always goes through the same-origin proxy;
 * the server talks to the backend directly.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") return API_PROXY_PREFIX;
  return getBackendApiUrl();
}
