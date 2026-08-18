"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  IceCreamCone,
  ShoppingCart,
  Heart,
  CalendarDays,
  User,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const LEFT_NAV = [
  { label: "طلباتي", href: "/my-orders", icon: CalendarDays },
  { label: "المنيو", href: "/menu", icon: IceCreamCone },
];
const RIGHT_NAV = [
  { label: "المفضلة", href: "/favorites", icon: Heart },
  { label: "حسابي", href: "/my-account", icon: User },
];

function NavItem({
  label,
  href,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  href: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <span className="relative flex flex-col justify-center items-center gap-1 w-full h-full active:scale-90 transition-all duration-200">
      <Icon
        size={21}
        strokeWidth={active ? 2.3 : 1.6}
        className={active ? "text-glace-yellow" : "text-white/55"}
      />
      <span
        className={`text-[13px] sm:text-[14px] leading-snug font-medium ${active ? "text-glace-yellow" : "text-white/50"}`}
      >
        {label}
      </span>
      {active && (
        <span className="-bottom-0.5 left-1/2 absolute bg-glace-yellow/70 rounded-full w-4 h-[2px] -translate-x-1/2" />
      )}
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col justify-center items-center bg-transparent border-0 w-full h-full cursor-pointer"
      >
        {inner}
      </button>
    );
  }
  return (
    <Link
      href={href}
      className="flex flex-col justify-center items-center w-full h-full"
    >
      {inner}
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.items.length);

  const cartActive = pathname === "/cart";

  return (
    <nav className="lg:hidden bottom-0 z-[9999997] fixed inset-x-0 bg-transparent">
      {/* outer wrapper gives the cart bubble room to pop above */}
      <div className="relative">
        {/* cart bubble — pops up above the bar */}
        <Link
          href="/cart"
          className={`absolute left-1/2 -translate-x-1/2 -top-6 z-10
              flex flex-col items-center gap-0.5 transition-all duration-200 active:scale-90
              ${cartActive ? "scale-105" : ""}`}
        >
          <span
            className={`flex items-center justify-center w-[52px] h-[52px] rounded-full
              shadow-[0_10px_24px_rgba(0,0,0,0.24)]
              transition-all duration-200
              ${
                cartActive
                  ? "bg-glace-yellow shadow-[0_10px_32px_rgba(244,228,81,0.5)]"
                  : "bg-gradient-to-br from-[#13b4d9] to-[#0e7f99] border border-white/20"
              }`}
          >
            <ShoppingCart
              size={22}
              strokeWidth={cartActive ? 2.4 : 1.8}
              className={cartActive ? "text-[#1a4a5a]" : "text-white"}
            />
            {cartCount > 0 && (
              <span className="-top-1 -right-1 absolute flex justify-center items-center bg-glace-yellow px-0.5 border border-white/30 rounded-full min-w-[18px] h-[18px] font-black text-[#1a4a5a] text-[9px]">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </span>
          <span
            className={`text-[13px] sm:text-[14px] font-medium leading-snug
              ${cartActive ? "text-glace-yellow" : "text-white/60"}`}
          >
            السلة
          </span>
        </Link>

        {/* the bar itself */}
        <div className="bg-[#0b5f72]/95 shadow-[0_-8px_28px_rgba(0,0,0,0.18)] backdrop-blur-2xl border-white/10 border-t rounded-t-[28px] pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="flex items-center h-[62px]">
            {/* left side */}
            <div className="flex flex-1">
              {LEFT_NAV.map(({ label, href, icon }) => (
                <NavItem
                  key={href}
                  label={label}
                  href={href}
                  icon={icon}
                  active={
                    pathname === href ||
                    (href !== "/" && pathname.startsWith(href))
                  }
                />
              ))}
            </div>

            {/* center gap for cart bubble */}
            <div className="w-[64px] shrink-0" />

            {/* right side */}
            <div className="flex flex-1">
              {RIGHT_NAV.map(({ label, href, icon }) => (
                <NavItem
                  key={href}
                  label={label}
                  href={href}
                  icon={icon}
                  active={
                    pathname === href ||
                    (href !== "/" && pathname.startsWith(href))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
