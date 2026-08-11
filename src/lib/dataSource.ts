/**
 * API origin for every request. The backend is the single source of truth for
 * home, events and menu data — there is no local fake-data mode.
 */
export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://glace-bzjj.onrender.com/api"
  );
}
