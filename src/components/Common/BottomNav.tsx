"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  UtensilsCrossed,
  ShoppingCart,
  Tag,
  MoreHorizontal,
  CalendarDays,
  MapPin,
  Phone,
  Wallet,
  User,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const LEFT_NAV  = [
  { label: "الرئيسية", href: "/",      icon: Home            },
  { label: "المنيو",   href: "/menu",   icon: UtensilsCrossed },
];
const RIGHT_NAV = [
  { label: "العروض",   href: "/offers", icon: Tag             },
  { label: "المزيد",   href: "__more",  icon: MoreHorizontal  },
];

const SHEET_LINKS = [
  { label: "الفعاليات",  href: "/events",     icon: CalendarDays },
  { label: "موقعنا",     href: "/#location",  icon: MapPin       },
  { label: "تواصل معنا", href: "/contact",    icon: Phone        },
  { label: "محفظتي",    href: "/my-wallet",  icon: Wallet       },
  { label: "حسابي",     href: "/my-account", icon: User         },
];

const SHEET_PATHS = ["/events", "/contact", "/my-wallet", "/my-account"];

function NavItem({
  label, href, icon: Icon, active, onClick,
}: {
  label: string; href: string; icon: React.ElementType;
  active: boolean; onClick?: () => void;
}) {
  const inner = (
    <span className="relative flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-200 active:scale-90">
      <Icon
        size={21}
        strokeWidth={active ? 2.3 : 1.6}
        className={active ? "text-glace-yellow" : "text-white/55"}
      />
      <span className={`text-[10px] leading-none font-medium ${active ? "text-glace-yellow" : "text-white/50"}`}>
        {label}
      </span>
      {active && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-glace-yellow/70" />
      )}
    </span>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick}
        className="flex flex-col items-center justify-center w-full h-full cursor-pointer border-0 bg-transparent">
        {inner}
      </button>
    );
  }
  return (
    <Link href={href} className="flex flex-col items-center justify-center w-full h-full">
      {inner}
    </Link>
  );
}

export default function BottomNav() {
  const pathname  = usePathname();
  const cartCount = useCartStore((s) => s.items.length);
  const [open, setOpen] = useState(false);

  const cartActive  = pathname === "/cart";
  const moreActive  = SHEET_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  return (
    <>
      {/* backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[9999995] bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* slide-up sheet */}
      <div className={`lg:hidden fixed inset-x-0 bottom-[64px] z-[9999996]
        bg-gradient-to-b from-[#0e7490] to-[#075f78]
        backdrop-blur-2xl
        border-t border-white/20 rounded-t-[30px]
        px-5 pt-3 pb-8
        transition-transform duration-300 ease-out
        ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto mb-3 w-8 h-[3px] rounded-full bg-white/30" />
        <p className="mb-4 text-[11px] text-white/50 text-center tracking-widest">كل الصفحات</p>
        <div className="grid grid-cols-2 gap-2.5">
          {SHEET_LINKS.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href ||
              (!href.includes("#") && href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[18px] transition-all duration-150 active:scale-[.97]
                  ${active
                    ? "bg-glace-yellow text-[#075f78] font-semibold shadow-[0_4px_16px_rgba(244,228,81,0.35)]"
                    : "bg-white/15 text-white hover:bg-white/22"
                  }`}
              >
                <Icon size={17} strokeWidth={active ? 2.3 : 1.8} />
                <span className="text-[13px]">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* nav bar */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-[9999997] bg-[#0e7490]">
        {/* outer wrapper gives the cart bubble room to pop above */}
        <div className="relative">

          {/* cart bubble — pops up above the bar */}
          <Link href="/cart"
            className={`absolute left-1/2 -translate-x-1/2 -top-7 z-10
              flex flex-col items-center gap-0.5 transition-all duration-200 active:scale-90
              ${cartActive ? "scale-110" : ""}`}
          >
            <span className={`flex items-center justify-center w-[54px] h-[54px] rounded-full
              shadow-[0_8px_24px_rgba(0,0,0,0.25)]
              transition-all duration-200
              ${cartActive
                ? "bg-glace-yellow shadow-[0_8px_28px_rgba(244,228,81,0.6)]"
                : "bg-gradient-to-br from-[#0891b2] to-[#075f78] border-2 border-white/25 shadow-[0_8px_24px_rgba(8,145,178,0.5)]"
              }`}
            >
              <ShoppingCart
                size={22}
                strokeWidth={cartActive ? 2.4 : 1.8}
                className={cartActive ? "text-[#1a4a5a]" : "text-white"}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-0.5 rounded-full bg-glace-yellow text-[#1a4a5a] text-[9px] font-black border border-white/30">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-medium leading-none
              ${cartActive ? "text-glace-yellow" : "text-white/60"}`}>
              السلة
            </span>
          </Link>

          {/* the bar itself */}
          <div className="bg-gradient-to-r from-[#0e7490] via-[#0891b2] to-[#0e7490]
            backdrop-blur-2xl border-t border-white/20
            rounded-t-[28px] shadow-[0_-8px_40px_rgba(8,145,178,0.5)]">
            <div className="flex items-center h-[64px]">

              {/* left side */}
              <div className="flex flex-1">
                {LEFT_NAV.map(({ label, href, icon }) => (
                  <NavItem key={href} label={label} href={href} icon={icon}
                    active={pathname === href || (href !== "/" && pathname.startsWith(href))} />
                ))}
              </div>

              {/* center gap for cart bubble */}
              <div className="w-[64px] shrink-0" />

              {/* right side */}
              <div className="flex flex-1">
                <NavItem label="العروض" href="/offers" icon={Tag}
                  active={pathname === "/offers"} />
                <NavItem label="المزيد" href="__more" icon={MoreHorizontal}
                  active={moreActive || open}
                  onClick={() => setOpen((v) => !v)} />
              </div>

            </div>
            <div className="h-safe-b" />
          </div>
        </div>
      </nav>
    </>
  );
}
