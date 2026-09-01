"use client";

import { useQuery } from "@tanstack/react-query";
import { HELP_FAQS_QUERY_KEY, fetchHelpFaqs } from "./fetchHelpFaqs";

/** Loads the FAQ list (`GET /help/faqs`) — static content, rarely changes. */
export function useHelpFaqs() {
  return useQuery({
    queryKey: HELP_FAQS_QUERY_KEY,
    queryFn: fetchHelpFaqs,
    staleTime: 1000 * 60 * 30,
  });
}
