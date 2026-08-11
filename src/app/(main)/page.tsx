import HomeClientPage from "@/components/Home/HomeClientPage";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { fetchHomePage, HOME_PAGE_QUERY_KEY } from "@/hooks/home/fetchHomePage";
import { createQueryClient } from "@/lib/reactQuery";

// Backend data changes without a redeploy (prices, products, events), so the
// prerendered HTML is refreshed on an interval instead of frozen at build
// time. Matches the client query `staleTime`.
export const revalidate = 300;


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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClientPage />
    </HydrationBoundary>
  );
}
