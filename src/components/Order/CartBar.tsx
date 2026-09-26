"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { useCartHydrated } from "@/hooks/cart/useCartHydrated";
import { useCartStore } from "@/store/cartStore";

/**
 * The one "عرض السلة" entry point shared by the menu and every order page:
 * piece count + running total, updated live as items are added or stepped.
 * Hidden while the cart is empty.
 *
 * `floating` (default) pins it above the mobile bottom nav on its own; pass
 * `floating={false}` to render just the pill inside a page's existing fixed
 * bottom area (e.g. stacked above the builder's add button).
 */
export default function CartBar({ floating = true }: { floating?: boolean }) {
  const hydrated = useCartHydrated();
  const count = useCartStore((s) => s.itemCount());
  const subtotal = useCartStore((s) => s.subtotal());

  // Brief pulse whenever the count changes, so an add/step registers even
  // though the page itself doesn't navigate or show a toast.
  const [pulse, setPulse] = useState(false);
  const prevCount = useRef(count);
  useEffect(() => {
    if (prevCount.current === count) return;
    prevCount.current = count;
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 250);
    return () => window.clearTimeout(t);
  }, [count]);

  if (!hydrated || count === 0) return null;

  const pill = (
    <Link
      href="/cart"
      className={`flex items-center gap-3 bg-glace-yellow hover:bg-yellow-300 shadow-[0_8px_28px_rgba(0,0,0,0.22)] mx-auto px-4 sm:px-5 py-3 rounded-full w-full max-w-3xl font-bold text-[#1e6a7f] transition-transform duration-200 pointer-events-auto ${
        pulse ? "scale-[1.03]" : "scale-100"
      }`}
    >
      <span className="relative shrink-0">
        <ShoppingCart size={22} />
        <span className="-top-2 -right-2.5 absolute flex justify-center items-center bg-[#1e6a7f] px-1 rounded-full min-w-5 h-5 font-black text-[11px] text-white tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      </span>
      <span className="flex-1 text-[15px] sm:text-[16px]">
        عرض السلة
        <span className="font-medium text-[#1e6a7f]/70 text-[13px]">
          {" "}
          · {count} {count === 1 ? "منتج" : "منتجات"}
        </span>
      </span>
      <span className="tabular-nums text-[16px] sm:text-[18px] whitespace-nowrap">
        {subtotal.toFixed(2)} ₪
      </span>
      <ChevronLeft size={20} className="shrink-0" />
    </Link>
  );

  if (!floating) return pill;

  return (
    <div className="bottom-28 lg:bottom-0 z-9999997 fixed inset-x-0 px-3 sm:px-4 pb-4 pointer-events-none">
      {pill}
    </div>
  );
}
