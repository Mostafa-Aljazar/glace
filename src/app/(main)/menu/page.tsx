import type { Metadata } from "next";
import MenuClientPage from "@/components/Menu/MenuClientPage";

export const metadata: Metadata = {
  title: "المنيو | جلاسيه الأمير",
  description: "تصفح قائمة منتجاتنا المتنوعة من الآيس كريم والعصائر والحلويات",
};

export default function MenuPage() {
  return <MenuClientPage />;
}
