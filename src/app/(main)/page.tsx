import type { Metadata } from "next";
import HomeClientPage from "@/components/Home/HomeClientPage";
import JsonLd from "@/components/Common/JsonLd";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { branchJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import type { IHomePageData } from "@/types/home.types";

import { fetchHomePage, HOME_PAGE_QUERY_KEY } from "@/hooks/home/fetchHomePage";
import { createQueryClient } from "@/lib/reactQuery";

// Backend data changes without a redeploy (prices, products, events), so the
// prerendered HTML is refreshed on an interval instead of frozen at build
// time. Matches the client query `staleTime`.
export const revalidate = 300;

// No title: the root layout's default ("جلاسيه الأمير — …") is the home title.
export const metadata: Metadata = pageMetadata({ path: "/" });

export default async function Home() {
  // One client per request — a shared instance would leak cache between visitors.
  const queryClient = createQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: HOME_PAGE_QUERY_KEY,
      queryFn: fetchHomePage,
    });
  } catch {
    // Ignore prefetch errors — the client query retries on mount and renders
    // its own error state.
  }

  // One IceCreamShop per branch, so Google can show the address, hours and
  // map pin in local results.
  const branches =
    queryClient.getQueryData<IHomePageData>(HOME_PAGE_QUERY_KEY)?.branches
      ?.branches ?? [];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {branches.length > 0 && <JsonLd data={branches.map(branchJsonLd)} />}
      {/* The page's single h1. The hero slides and sections use h2 so the
          carousel doesn't produce one h1 per slide. */}
      <h1 className="sr-only">
        {SITE_NAME} {SITE_TAGLINE}
      </h1>
      <HomeClientPage />
    </HydrationBoundary>
  );
}
