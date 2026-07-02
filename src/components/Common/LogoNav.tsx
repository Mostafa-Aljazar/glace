"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronRight,
  X,
  Menu,
  ShoppingCart,
  Wallet,
  User,
  ChevronLeft,
} from "lucide-react";
import { logo } from "@/assets/images";
import { useCartStore } from "@/store/cartStore";
import { useWalletStore } from "@/store/walletStore";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  { label: "المنيو", href: "/menu" },
  { label: "العروض", href: "/offers" },
  { label: "الفعاليات", href: "/events" },
  { label: "موقعنا", href: "/#location" },
  { label: "تواصل معنا", href: "/contact" },
];

export default function LogoNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const showBack = pathname !== "/";

  const cartCount = useCartStore((s) => s.items.length);
  const walletBalance = useWalletStore((s) => s.balance);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* ── Mobile full-screen drawer ─────────────────────────────── */}
      <div
        className={`lg:hidden fixed inset-0 z-[999999] transition-all duration-300
          ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
          onClick={() => setDrawerOpen(false)}
        />

        {/* panel slides in from right (RTL) */}
        <div
          className={`absolute top-0 right-0 h-full w-[280px] bg-[#1a6278]/95 backdrop-blur-xl
            flex flex-col pt-8 pb-10 px-6 shadow-2xl transition-transform duration-300
            ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* close */}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="flex justify-center items-center self-start bg-white/10 mb-8 border border-white/20 rounded-full w-9 h-9 text-white cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* logo inside drawer */}
          <Image
            src={logo}
            alt="جلاسيه الأمير"
            width={130}
            height={48}
            className="self-end mb-8 object-contain"
          />

          {/* nav links */}
          <ul className="flex flex-col flex-1 gap-1 m-0 p-0 list-none">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`block px-4 py-3 rounded-[14px] text-[17px] font-medium text-right transition-all
                    ${
                      isActive(item.href)
                        ? "bg-glace-yellow text-[#1e6a7f] font-bold"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* account links at bottom */}
          <div className="flex flex-col gap-2 mt-6 pt-5 border-white/15 border-t">
            <Link
              href="/my-account"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 hover:bg-white/10 px-4 py-2.5 rounded-[14px] text-[15px] text-white/80 hover:text-white transition-all"
            >
              <User size={17} />
              <span>حسابي</span>
            </Link>
            <Link
              href="/my-wallet"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 hover:bg-white/10 px-4 py-2.5 rounded-[14px] text-[15px] text-white/80 hover:text-white transition-all"
            >
              <Wallet size={17} />
              <span>محفظتي</span>
              {walletBalance > 0 && (
                <span className="bg-white/20 mr-auto px-2 py-0.5 rounded-full text-[12px]">
                  {walletBalance.toFixed(0)} ₪
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 hover:bg-white/10 px-4 py-2.5 rounded-[14px] text-[15px] text-white/80 hover:text-white transition-all"
            >
              <div className="relative">
                <ShoppingCart size={17} />
                {cartCount > 0 && (
                  <span className="-top-2 -left-2 absolute flex justify-center items-center bg-glace-yellow rounded-full w-4 h-4 font-bold text-[#1e6a7f] text-[9px]">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>السلة</span>
              {cartCount > 0 && (
                <span className="bg-glace-yellow/20 mr-auto px-2 py-0.5 rounded-full font-bold text-[12px] text-glace-yellow">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main header bar ──────────────────────────────────────── */}
      <header className="absolute top-0 inset-x-0 z-[9999999] px-4 pt-4 lg:pt-6 pb-2 w-full">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex items-center gap-3 bg-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl px-4 py-2.5 border border-white/25 rounded-[24px]">
            {/* ── RIGHT: logo (first in DOM = right in RTL) ── */}
            <Link href="/" className="shrink-0">
              <Image
                src={logo}
                alt="جلاسيه الأمير"
                height={54}
                className="w-auto h-[46px] lg:h-[54px] object-contain"
              />
            </Link>

            {/* ── CENTER: desktop nav links ── */}
            <nav className="hidden lg:flex flex-1 justify-center items-center gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-[14px] font-medium transition-all
                    ${
                      isActive(item.href)
                        ? "bg-glace-yellow text-[#1e6a7f] font-bold shadow-[0_2px_12px_rgba(244,228,81,0.4)]"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* flex-1 pushes actions to the left on mobile */}
            <div className="lg:hidden flex-1" />

            {/* ── LEFT: action icons ── */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Cart — icon only on mobile, label on desktop */}
              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 bg-white/10 hover:bg-white/20 p-2 lg:px-3 lg:py-1.5 border border-white/15 rounded-full text-white/80 hover:text-white transition-all"
              >
                <div className="relative">
                  <ShoppingCart size={16} />
                  {cartCount > 0 && (
                    <span className="-top-2 -left-2 absolute flex justify-center items-center bg-glace-yellow rounded-full w-4 h-4 font-bold text-[#1e6a7f] text-[9px]">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline font-medium text-[13px]">
                  السلة
                </span>
              </Link>

              {/* Wallet — icon only on mobile, label+balance on desktop */}
              <Link
                href="/my-wallet"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 p-2 lg:px-3 lg:py-1.5 border border-white/15 rounded-full text-white/80 hover:text-white transition-all"
              >
                <Wallet size={16} />
                <span className="hidden lg:inline font-medium text-[13px]">
                  {walletBalance > 0 ? (
                    <span className="font-bold text-glace-yellow">
                      {walletBalance.toFixed(0)} ₪
                    </span>
                  ) : (
                    "محفظتي"
                  )}
                </span>
              </Link>

              {/* Account — icon only on mobile, label on desktop */}
              <Link
                href="/my-account"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 p-2 lg:px-3 lg:py-1.5 border border-white/15 rounded-full text-white/80 hover:text-white transition-all"
              >
                <User size={16} />
                <span className="hidden lg:inline font-medium text-[13px]">
                  حسابي
                </span>
              </Link>

              {/* Back — all screens, inner pages only */}
              {showBack && (
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 lg:px-3 py-1.5 border border-white/15 rounded-full text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  <span className="hidden lg:inline font-medium text-[13px]">
                    رجوع
                  </span>
                  <ChevronLeft size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

    </>
  );
}
