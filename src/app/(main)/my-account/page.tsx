import type { Metadata } from "next";
import { Suspense } from "react";
import MyAccountClientPage from "@/components/Account/MyAccountClientPage";

export const metadata: Metadata = {
  title: "حسابي | جلاسيه الأمير",
};

export default function MyAccountPage() {
  return (
    <Suspense>
      <MyAccountClientPage />
    </Suspense>
  );
}
