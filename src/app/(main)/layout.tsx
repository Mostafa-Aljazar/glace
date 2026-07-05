"use client";

import LogoNav from "@/components/Common/LogoNav";
import BottomNav from "@/components/Common/BottomNav";
import FloatingFavoritesButton from "@/components/Common/FloatingFavoritesButton";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LogoNav />
      <div className="pb-14lg:pb-0">{children}</div>
      <BottomNav />
      <FloatingFavoritesButton />
    </>
  );
}
