import type { Metadata } from "next";
import { Suspense } from "react";
import FavoritesClientPage from "@/components/Favorites/FavoritesClientPage";

export const metadata: Metadata = {
  title: "المفضلة | جلاسيه الأمير",
  description: "عرض العناصر المفضلة لديك",
};

export default function FavoritesPage() {
  return (
    <Suspense fallback={null}>
      <FavoritesClientPage />
    </Suspense>
  );
}
