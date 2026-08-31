"use client";

import EventsBackground from "@/components/Events/EventsBackground";
import { useMe } from "@/hooks/auth/useMe";
import AccountHeroStrip from "./dashboard/AccountHeroStrip";
import { useAuthStore } from "@/store/authStore";

export default function MyAccountClientPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useMe();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-28 lg:pb-12 max-w-300">
        <h1 className="mb-5 text-[40px] text-white sm:text-[50px] text-center">
          حسابي
        </h1>

        {/* Hero strip — always visible */}
        <AccountHeroStrip user={user ?? null} isLoading={isLoading} />

        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
