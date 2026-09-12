"use client";

import { useQuery } from "@tanstack/react-query";
import { TERMS_CONTENT_QUERY_KEY, fetchTermsContent } from "./fetchTermsContent";

/** Loads the terms-and-conditions HTML (`GET /terms`) — static content, rarely changes. */
export function useTermsContent() {
  return useQuery({
    queryKey: TERMS_CONTENT_QUERY_KEY,
    queryFn: fetchTermsContent,
    staleTime: 1000 * 60 * 30,
  });
}
