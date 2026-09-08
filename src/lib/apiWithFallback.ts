import { AxiosError } from "axios";

/** True when the failure looks like "backend/endpoint doesn't exist yet"
 *  (network error, 404, 501, 5xx) rather than a genuine business error. */
export function isBackendUnavailable(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return true;
  if (!error.response) return true;
  const status = error.response.status;
  return status === 404 || status === 501 || status >= 500;
}

/** True when a reachable backend rejected the request for a real business
 *  reason (validation, conflict, auth) that must be shown to the user. */
export function isRealValidationError(error: unknown): boolean {
  return !isBackendUnavailable(error);
}

/** Surfaces a reachable backend's actual 422 validation message instead of a
 *  generic failure text, so real rejection reasons (invalid email, missing
 *  field, etc.) are visible rather than hidden behind "try again". */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError && error.response?.status === 422) {
    const data = error.response.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;
    const firstFieldError = data?.errors
      ? Object.values(data.errors)[0]?.[0]
      : undefined;
    if (firstFieldError) return firstFieldError;
    if (data?.message) return data.message;
  }
  return fallback;
}

/** Query-side wrapper: try the real call, fall back to local/fake data on
 *  "backend not ready" failures. Real validation errors still propagate. */
export async function withQueryFallback<T>(
  realCall: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  try {
    return await realCall();
  } catch (error) {
    if (isBackendUnavailable(error)) return await fallback();
    throw error;
  }
}

/** Mutation-side wrapper: try the real call; on "backend not ready" failure,
 *  run the fallback so the mutation appears to succeed locally. A genuine
 *  validation/conflict error from a reachable backend still rejects. The
 *  fallback itself may still legitimately throw (e.g. insufficient wallet
 *  balance) — that throw is never caught here, it propagates to the caller. */
export async function withMutationFallback<T>(
  realCall: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  try {
    return await realCall();
  } catch (error) {
    if (isBackendUnavailable(error)) return await fallback();
    throw error;
  }
}
