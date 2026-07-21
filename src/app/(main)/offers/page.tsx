import type { Metadata } from "next";
import OffersClientPage from "@/components/Offers/OffersClientPage";

export const metadata: Metadata = {
  title: "العروض والتخفيضات | جلاسيه الأمير",
  description:
    "اكتشف أحدث عروض وتخفيضات جلاسيه الأمير على البوظة والميلك شيك والحلويات",
};

export default function OffersPage() {
  return <OffersClientPage />;
}
