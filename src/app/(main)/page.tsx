import HomeClientPage from "@/components/Home/HomeClientPage";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import fetchHeroSlides from "@/hooks/home/fetchHeroSlides";
import { queryClient } from "@/lib/reactQuery";

export default async function Home() {
  try {
    await queryClient.prefetchQuery({
      queryKey: ["heroSlides"],
      queryFn: () => fetchHeroSlides(),
    });
  } catch (e) {
    // ignore prefetch errors — client will fall back to fake data
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <HomeClientPage />
    </HydrationBoundary>
  );
}
