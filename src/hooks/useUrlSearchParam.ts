"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/**
 * One query-string value, read without `useSearchParams`.
 *
 * `useSearchParams` makes Next skip server rendering for everything up to the
 * nearest Suspense boundary, so a page using it ships empty HTML to search
 * engines. Here the server snapshot is `null`: the page renders fully on the
 * server, and the real value arrives right after hydration. The snapshot is
 * re-read on every render, so `router.replace` updates are picked up too.
 */
export function useUrlSearchParam(name: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}
