"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronRight,
  X,
  Menu,
  ShoppingCart,
  Wallet,
  User,
  ChevronLeft,
  Home,
  UtensilsCrossed,
  Tag,
  CalendarDays,
  MapPin,
  Phone,
} from "lucide-react";
import { logo } from "@/assets/images";
import { useCartStore } from "@/store/cartStore";
import { useWalletStore } from "@/store/walletStore";
import {
  ORDER_OPEN_MENU,
  ORDER_PROTECTED_LINK_CLICK,
  ORDER_BEFORE_BACK_REQUEST,
} from "@/hooks/order/useLeavePageGuard";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { label: "الرئيسية", href: "/", icon: Home },
  { label: "المنيو", href: "/menu", icon: UtensilsCrossed },
  { label: "العروض", href: "/offers", icon: Tag },
  { label: "موقعنا و ساعات العمل", href: "/#location", icon: MapPin },
  { label: "الفعاليات", href: "/events", icon: CalendarDays },
  { label: "تواصل معنا", href: "/contact", icon: Phone },
];

export default function LogoNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const showBack = pathname !== "/";

  const cartCount = useCartStore((s) => s.items.length);
  const walletBalance = useWalletStore((s) => s.balance);
  const isMenuPage = pathname === "/menu";

  useEffect(() => {
    const handleProtectedLink = () => setDrawerOpen(false);
    document.addEventListener(ORDER_PROTECTED_LINK_CLICK, handleProtectedLink);
    return () =>
      document.removeEventListener(
        ORDER_PROTECTED_LINK_CLICK,
        handleProtectedLink,
      );
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  useEffect(() => {
    const handleOpenMenu = () => setDrawerOpen(true);
    document.addEventListener(ORDER_OPEN_MENU, handleOpenMenu);
    return () => document.removeEventListener(ORDER_OPEN_MENU, handleOpenMenu);
  }, []);

  const handleMobileMenuClick = () => {
    const event = new CustomEvent(ORDER_MENU_OPEN_REQUEST, {
      cancelable: true,
    });
    const allowed = document.dispatchEvent(event);
    if (allowed) {
      setDrawerOpen(true);
    }
  };

  return (
    <>
      {/* ── Mobile full-screen drawer ─────────────────────────────── */}
      <div
        className={`lg:hidden fixed inset-0 z-[999999999] transition-all duration-300
          ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
          onClick={() => setDrawerOpen(false)}
        />

        {/* panel slides in from right (RTL) */}
        <div
          role="dialog"
          aria-hidden={!drawerOpen}
          className={`absolute top-0 right-0 h-full w-[320px] bg-gradient-to-l from-[#145c6c]/95 via-[#196c7b]/90 to-[#0d3c48]/95 backdrop-blur-xl
            flex flex-col pt-6 pb-6 px-5 shadow-2xl transition-transform duration-300 rounded-l-[28px] overflow-hidden border border-white/10
            ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* logo inside drawer */}
          <div className="flex justify-between items-center mb-4">
            <Image
              src={logo}
              alt="جلاسيه الأمير"
              width={140}
              height={52}
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex justify-center items-center bg-white/10 hover:bg-white/20 rounded-full w-9 h-9 text-white"
              aria-label="إغلاق القائمة"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mb-3 font-semibold text-[15px] text-white/90">
            القائمة
          </div>

          {/* nav links */}
          <ul className="flex flex-col gap-2 m-0 p-0 list-none">
            {navItems.map((item) => {
              const DrawerIcon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-end gap-3 px-4 py-3 rounded-[16px] text-[16px] font-semibold transition-all touch-manipulation
                      ${
                        isActive(item.href)
                          ? "bg-glace-yellow text-[#1e6a7f] font-bold"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                  >
                    <span className="flex-1 text-right whitespace-nowrap">
                      {item.label}
                    </span>
                    {DrawerIcon && (
                      <DrawerIcon size={20} className="text-white" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-3 border-white/12 border-t" />

          {/* account and cart links placed under the nav links (mobile drawer) */}
          <div className="flex flex-col gap-3 mt-4">
            <Link
              href="/my-account"
              onClick={() => setDrawerOpen(false)}
              className="flex justify-between items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-[16px] text-[17px] text-white hover:text-white transition-all"
            >
              <span className="font-semibold">حسابي</span>
              <User size={18} className="text-white" />
            </Link>
            <Link
              href="/my-wallet"
              onClick={() => setDrawerOpen(false)}
              className="flex justify-end items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-[16px] text-[17px] text-white hover:text-white transition-all"
            >
              <span className="font-medium">محفظتي</span>
              {walletBalance > 0 && (
                <span className="bg-white/20 mr-auto px-2 py-0.5 rounded-full text-[12px]">
                  {walletBalance.toFixed(0)} ₪
                </span>
              )}
              <Wallet size={17} className="text-white/90" />
            </Link>
            <Link
              href="/cart"
              onClick={() => setDrawerOpen(false)}
              className="flex justify-between items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-[16px] text-[17px] text-white hover:text-white transition-all"
            >
              <span className="font-semibold">السلة</span>
              <div className="relative">
                <ShoppingCart size={18} className="text-white" />
                {cartCount > 0 && (
                  <span className="-top-2 -left-2 absolute flex justify-center items-center bg-glace-yellow rounded-full w-4 h-4 font-bold text-[#1e6a7f] text-[9px]">
                    {cartCount}
                  </span>
                )}
              </div>
              {cartCount > 0 && (
                <span className="bg-glace-yellow/20 mr-auto px-2 py-0.5 rounded-full font-bold text-[13px] text-glace-yellow">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main header bar ──────────────────────────────────────── */}
      <header
        className={`${isMenuPage ? "absolute top-4 inset-x-0" : "top-4 fixed inset-x-0"} z-[9999999] px-4 lg:px-6 w-full`}
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="flex items-center gap-3 bg-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl px-4 py-2.5 border border-white/25 rounded-[24px] transition-all duration-200">
            {/* ── RIGHT: logo (first in DOM = right in RTL) ── */}
            <Link href="/" className="shrink-0">
              <Image
                src={logo}
                alt="جلاسيه الأمير"
                height={64}
                className="w-auto h-[54px] lg:h-[64px] object-contain"
              />
            </Link>

            {/* ── CENTER: desktop nav links ── */}
            <nav className="hidden lg:flex flex-1 justify-center items-center gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-[14px] font-medium transition-all flex items-center gap-2
                    ${
                      isActive(item.href)
                        ? "bg-glace-yellow text-[#1e6a7f] font-bold shadow-[0_2px_12px_rgba(244,228,81,0.4)]"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {item.icon && <item.icon size={16} className="text-white" />}
                  <span className="text-white">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* flex-1 pushes actions to the left on mobile */}
            <div className="lg:hidden flex-1" />

            {/* ── LEFT: action icons ── */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mobile hamburger to open drawer */}
              <button
                type="button"
                onClick={handleMobileMenuClick}
                className="lg:hidden flex justify-center items-center bg-white/10 hover:bg-white/20 mr-1 p-2 border border-white/10 rounded-full text-white/85 pointer-events-auto"
                aria-label="فتح القائمة"
              >
                <Menu size={18} />
              </button>
              {/* Cart — visible on desktop only; hidden on mobile */}
              <Link
                href="/cart"
                className="hidden relative lg:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 p-2 lg:px-3 lg:py-1.5 border border-white/15 rounded-full text-white/80 hover:text-white transition-all"
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

              {/* Wallet — visible on desktop only; hidden on mobile */}
              <Link
                href="/my-wallet"
                className="hidden lg:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 p-2 lg:px-3 lg:py-1.5 border border-white/15 rounded-full text-white/80 hover:text-white transition-all"
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

              {/* Account — visible on desktop only; hidden on mobile */}
              <Link
                href="/my-account"
                className="hidden lg:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 p-2 lg:px-3 lg:py-1.5 border border-white/15 rounded-full text-white/80 hover:text-white transition-all"
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
                  onClick={() => {
                    const event = new CustomEvent(ORDER_BEFORE_BACK_REQUEST, {
                      cancelable: true,
                    });
                    const allowed = document.dispatchEvent(event);
                    if (allowed) {
                      router.back();
                    }
                  }}
                  className="hidden lg:flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 lg:px-3 py-1.5 border border-white/15 rounded-full text-white/80 hover:text-white transition-all cursor-pointer"
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
