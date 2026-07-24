import { guestApi } from "@/lib/axios";
import { FAKE_HOME_PAGE } from "@/data/fake-data/homePage";
import type { IHomePageData } from "@/types/home.types";

function isHomePageData(value: unknown): value is IHomePageData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<IHomePageData>;
  return (
    !!data.hero?.slides &&
    Array.isArray(data.hero.slides) &&
    !!data.about &&
    !!data.whyGlace &&
    !!data.branches?.branches &&
    !!data.events?.items
  );
}

/**
 * Fetches the full home page content from `GET /home`.
 * Falls back to `FAKE_HOME_PAGE` when the API fails or returns invalid data.
 */
export async function fetchHomePage(): Promise<IHomePageData> {
  try {
    const res = await guestApi.get<IHomePageData>("/home");
    if (isHomePageData(res?.data)) return res.data;
    return FAKE_HOME_PAGE;
  } catch (e) {
    console.error("[fetchHomePage]", e);
    return FAKE_HOME_PAGE;
  }
}

export default fetchHomePage;
