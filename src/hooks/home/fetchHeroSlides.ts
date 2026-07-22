import fetchHomePage from "@/hooks/home/fetchHomePage";
import { FAKE_HERO_SLIDES } from "@/data/fake-data/heroSlides";
import type { ISlideData } from "@/types/home.types";

/** @deprecated Prefer `fetchHomePage` — kept for callers that only need slides. */
export async function fetchHeroSlides(): Promise<ISlideData[]> {
  try {
    const home = await fetchHomePage();
    return home.hero.slides?.length ? home.hero.slides : FAKE_HERO_SLIDES;
  } catch {
    return FAKE_HERO_SLIDES;
  }
}

export default fetchHeroSlides;
