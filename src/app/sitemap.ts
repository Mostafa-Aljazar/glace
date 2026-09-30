import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_ROUTES } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";
// Import from the fetch modules, not the `"use client"` hooks.
import { fetchMenuProducts } from "@/hooks/menu/fetchMenuProducts";
import { fetchEvents } from "@/hooks/events/fetchEvents";
import { resolveMenuImageSrc } from "@/types/menu.types";
import { resolveEventImageSrc, type IEvent } from "@/types/events.types";

// Products and events are added from the dashboard without a redeploy.
export const revalidate = 3600;

const STATIC_PRIORITY: Record<string, number> = {
  "/": 1,
  "/menu": 0.9,
  "/events": 0.6,
  "/contact": 0.5,
};

async function productEntries(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchMenuProducts().catch(() => []);
  return products.map((product) => {
    const image = resolveMenuImageSrc(product.image);
    return {
      url: absoluteUrl(`/menu/order/${product.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      ...(image ? { images: [absoluteUrl(image)] } : {}),
    };
  });
}

async function allEvents(): Promise<IEvent[]> {
  const perPage = 50;
  const first = await fetchEvents({ page: 1, perPage }).catch(() => null);
  if (!first) return [];
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) =>
      fetchEvents({ page: i + 2, perPage })
        .then((res) => res.items)
        .catch(() => [] as IEvent[]),
    ),
  );
  return [...first.items, ...rest.flat()];
}

async function eventEntries(): Promise<MetadataRoute.Sitemap> {
  const events = await allEvents();
  return events.map((event) => {
    const images = [event.listImage, ...event.images]
      .filter(Boolean)
      .map((image) => absoluteUrl(resolveEventImageSrc(image)));
    return {
      url: absoluteUrl(`/events/${event.id}`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      ...(images.length ? { images: [...new Set(images)] } : {}),
    };
  });
}

// No `lastModified`: the API exposes no update times, and Google ignores
// lastmod values that are not consistently accurate.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, events] = await Promise.all([
    productEntries(),
    eventEntries(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    // Next emits the home canonical without a trailing slash; match it.
    url: route === "/" ? SITE_URL : absoluteUrl(route),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: STATIC_PRIORITY[route] ?? 0.5,
  }));

  return [...staticEntries, ...products, ...events];
}
