import { guestApi } from "@/lib/axios";
import type { SlideData } from "@/types/home.types";
import { FAKE_HERO_SLIDES } from "@/data/fake-data/heroSlides";

export async function fetchHeroSlides(): Promise<SlideData[]> {
    try {
        const res = await guestApi.get<SlideData[]>("/hero-slides");
        if (res?.data && Array.isArray(res.data)) return res.data;
        return FAKE_HERO_SLIDES;
    } catch (e) {
        console.error("[fetchHeroSlides]", e);
        return FAKE_HERO_SLIDES;
    }
}

export default fetchHeroSlides;
