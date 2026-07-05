"use client";

import { useQuery } from "@tanstack/react-query";
import type { SlideData } from "@/types/home.types";
import fetchHeroSlides from "@/hooks/home/fetchHeroSlides";
import { FAKE_HERO_SLIDES } from "@/data/fake-data/heroSlides";

export function useHeroSlides(initialData?: SlideData[]) {
    return useQuery<SlideData[]>({
        queryKey: ["heroSlides"],
        queryFn: fetchHeroSlides,
        initialData: initialData ?? FAKE_HERO_SLIDES,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}
