import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import FavoritesClientPage from "@/components/Favorites/FavoritesClientPage";

export const metadata: Metadata = privatePageMetadata("المفضلة");

export default function FavoritesPage() {
  return (
    <Suspense fallback={null}>
      <FavoritesClientPage />
    </Suspense>
  );
}
