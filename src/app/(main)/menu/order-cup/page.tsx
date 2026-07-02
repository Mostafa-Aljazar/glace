import type { Metadata } from "next";
import { Suspense } from "react";
import CupOrderClientPage from "@/components/Order/CupOrderClientPage";

export const metadata: Metadata = {
  title: "طلب بوظة كاسة | جلاسيه الأمير",
};

export default function CupOrderPage() {
  return (
    <Suspense>
      <CupOrderClientPage />
    </Suspense>
  );
}
