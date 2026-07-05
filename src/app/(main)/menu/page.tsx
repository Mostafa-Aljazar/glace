import type { Metadata } from "next";
import { Suspense } from "react";
import MenuClientPage from "@/components/Menu/MenuClientPage";

export const metadata: Metadata = {
  title: "المنيو | جلاسيه الأمير",
  description: "تصفح قائمة منتجاتنا المتنوعة من الآيس كريم والعصائر والحلويات",
};

export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuClientPage />
    </Suspense>
  );
}
