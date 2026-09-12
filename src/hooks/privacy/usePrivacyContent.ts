"use client";

import { useQuery } from "@tanstack/react-query";
import { PRIVACY_CONTENT_QUERY_KEY, fetchPrivacyContent } from "./fetchPrivacyContent";

/** Loads the privacy-policy HTML (`GET /privacy`) — static content, rarely changes. */
export function usePrivacyContent() {
  return useQuery({
    queryKey: PRIVACY_CONTENT_QUERY_KEY,
    queryFn: fetchPrivacyContent,
    staleTime: 1000 * 60 * 30,
  });
}
