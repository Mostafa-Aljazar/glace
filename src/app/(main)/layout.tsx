"use client";

import LogoNav from "@/components/Common/LogoNav";
import BottomNav from "@/components/Common/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LogoNav />
      <div>{children}</div>
      <BottomNav />
    </>
  );
}
