"use client";

import { LayoutDashboard, ShoppingBag, Wallet, UserCircle, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/auth/useLogout";

export type Section = "overview" | "orders" | "wallet" | "profile" | "security";

const NAV_ITEMS: { section: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { section: "overview", label: "نظرة عامة",  icon: LayoutDashboard },
  { section: "orders",   label: "طلباتي",      icon: ShoppingBag    },
  { section: "wallet",   label: "محفظتي",      icon: Wallet         },
  { section: "profile",  label: "بياناتي",     icon: UserCircle     },
  { section: "security", label: "الأمان",      icon: Shield         },
];

interface Props {
  active: Section;
  onChange: (s: Section) => void;
}

export default function AccountSidebar({ active, onChange }: Props) {
  const logout = useLogout();

  return (
    <>
      {/* Desktop: vertical column on the right (RTL first child) */}
      <aside className="hidden lg:flex flex-col gap-2 w-[220px] shrink-0">
        {NAV_ITEMS.map(({ section, label, icon: Icon }) => (
          <button
            key={section}
            type="button"
            onClick={() => onChange(section)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-[20px] text-[17px] w-full transition-colors cursor-pointer",
              active === section
                ? "bg-white/30 text-glace-yellow font-bold"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon size={20} className="shrink-0" />
            {label}
          </button>
        ))}

        {/* Logout pinned to bottom */}
        <button
          type="button"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          className="flex items-center gap-3 px-4 py-3 mt-auto rounded-[20px] text-[17px] w-full text-white/70 hover:text-white bg-red-500/20 hover:bg-red-500/40 border border-red-400/30 transition-colors cursor-pointer disabled:opacity-50"
        >
          <LogOut size={20} className="shrink-0" />
          {logout.isPending ? "جاري الخروج..." : "تسجيل الخروج"}
        </button>
      </aside>

      {/* Mobile: horizontal pill strip */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {NAV_ITEMS.map(({ section, label, icon: Icon }) => (
          <button
            key={section}
            type="button"
            onClick={() => onChange(section)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-[14px] whitespace-nowrap shrink-0 cursor-pointer transition-colors",
              active === section
                ? "bg-white/30 text-glace-yellow font-bold"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
        {/* Logout pill on mobile */}
        <button
          type="button"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[14px] whitespace-nowrap shrink-0 cursor-pointer bg-red-500/20 hover:bg-red-500/40 text-white/80 border border-red-400/30 transition-colors disabled:opacity-50"
        >
          <LogOut size={16} />
          خروج
        </button>
      </div>
    </>
  );
}
