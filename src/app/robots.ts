import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private/user-specific flows and pages not yet live (see src/middleware.ts)
      // add no SEO value and shouldn't be crawled or shown as search results.
      disallow: [
        "/cart",
        "/checkout",
        "/payment",
        "/order-status",
        "/my-account",
        "/my-orders",
        "/my-wallet",
        "/favorites",
        "/auth",
        "/coming-soon",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
