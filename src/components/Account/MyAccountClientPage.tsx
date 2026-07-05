"use client";

import { useSearchParams, useRouter } from "next/navigation";
import EventsBackground from "@/components/Events/EventsBackground";
import { useMe } from "@/hooks/auth/useMe";
import AccountHeroStrip from "./dashboard/AccountHeroStrip";
import { useAuthStore } from "@/store/authStore";
import AccountSidebar, { type Section } from "./dashboard/AccountSidebar";
import OverviewPanel from "./dashboard/panels/OverviewPanel";
import OrdersPanel from "./dashboard/panels/OrdersPanel";
import WalletPanel from "./dashboard/panels/WalletPanel";
import ProfilePanel from "./dashboard/panels/ProfilePanel";
import SecurityPanel from "./dashboard/panels/SecurityPanel";

const VALID: Section[] = [
  "overview",
  "orders",
  "wallet",
  "profile",
  "security",
];

export default function MyAccountClientPage() {
  const { isLoading } = useMe();
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const router = useRouter();

  const raw = searchParams.get("section") as Section | null;
  const section: Section = raw && VALID.includes(raw) ? raw : "overview";

  function handleChange(s: Section) {
    router.replace(`/my-account?section=${s}`, { scroll: false });
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-12 max-w-300">
        <h1 className="mb-5 text-[40px] text-white sm:text-[50px] text-center">
          حسابي
        </h1>

        {/* Hero strip — always visible */}
        <AccountHeroStrip user={user ?? null} isLoading={isLoading} />

        {/* Dashboard body */}
        <div className="flex lg:flex-row-reverse flex-col gap-6 mt-6">
          <AccountSidebar active={section} onChange={handleChange} />

          <main className="flex-1 min-w-0">
            {section === "overview" && (
              <OverviewPanel
                onGoToOrders={() => handleChange("orders")}
                onGoToWallet={() => handleChange("wallet")}
              />
            )}
            {section === "orders" && <OrdersPanel />}
            {section === "wallet" && <WalletPanel />}
            {section === "profile" && <ProfilePanel />}
            {section === "security" && <SecurityPanel />}
          </main>
        </div>
      </div>
    </div>
  );
}
