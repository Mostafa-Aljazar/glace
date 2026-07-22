"use client";

import { FAKE_HERO_SLIDES } from "@/data/fake-data/heroSlides";
import { useHomePage } from "@/hooks/home/useHomePage";

/** Hero slides from the shared `GET /home` query. */
export function useHeroSlides() {
  const query = useHomePage();
  return {
    ...query,
    data: query.data?.hero.slides ?? FAKE_HERO_SLIDES,
  };
}
