import type { MetadataRoute } from "next";
import { SITE_URL, PRIVATE_ROUTES } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Per-visitor flows, account pages and API docs add no search value.
      // They also carry `noindex` (see privatePageMetadata in src/lib/seo.ts).
      disallow: PRIVATE_ROUTES,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
