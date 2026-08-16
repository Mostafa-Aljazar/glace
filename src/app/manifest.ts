import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_NAME_EN, SITE_TAGLINE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME_EN,
    description: SITE_TAGLINE,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0d3c48",
    theme_color: "#1c6b88",
    lang: "ar",
    dir: "rtl",
    categories: ["food", "shopping", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
