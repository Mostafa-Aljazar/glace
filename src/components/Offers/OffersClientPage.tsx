"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tag, Sparkles, ArrowLeft, Ticket, Clock } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import { imgIesPP, imgIesC, imgIcee, imgIesP } from "@/assets/images";
import {
  OFFERS,
  OFFER_CATEGORIES,
  type Offer,
  type OfferCategory,
} from "@/data/OffersData";

// ── Discount badge ───────────────────────────────────────────────────
function DiscountPill({ original, sale }: { original: number; sale: number }) {
  const pct = Math.round(((original - sale) / original) * 100);
  return (
    <div className="top-3 left-3 z-10 absolute flex items-center gap-1 bg-red-500 shadow-lg px-2.5 py-1 rounded-full font-bold text-[12px] text-white">
      <Tag size={10} />
      -{pct}%
    </div>
  );
}

// ── Offer card ───────────────────────────────────────────────────────
function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="group relative flex flex-col bg-white/[.17] hover:bg-white/[.22] backdrop-blur-[15px] border border-white/15 hover:border-white/35 rounded-[22px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_35px_rgba(0,0,0,0.25)]">
      {/* Discount badge */}
      <DiscountPill original={offer.originalPrice} sale={offer.salePrice} />

      {/* Custom badge */}
      {offer.badge && (
        <div className="top-3 right-3 z-10 absolute bg-glace-yellow px-2.5 py-1 rounded-full font-bold text-[#1e6a7f] text-[11px]">
          {offer.badge}
        </div>
      )}

      {/* Image */}
      <div className="relative flex justify-center items-center bg-white/10 w-full h-[160px] overflow-hidden">
        <Image
          src={offer.image}
          alt={offer.title}
          width={130}
          height={130}
          className="group-hover:scale-110 w-[120px] sm:w-[130px] h-[120px] sm:h-[130px] object-contain transition-transform duration-500 drop-shadow-xl"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 gap-3 p-4">
        <div>
          <h3 className="font-bold text-[16px] text-white leading-snug line-clamp-1">
            {offer.title}
          </h3>
          <p className="mt-1 text-[12px] text-white/60 leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        </div>

        {/* Coupon code */}
        {offer.couponCode && (
          <div className="flex items-center gap-2 bg-glace-yellow/10 px-3 py-1.5 border border-glace-yellow/30 rounded-[10px]">
            <Ticket size={13} className="text-glace-yellow shrink-0" />
            <span className="font-bold text-[12px] text-glace-yellow tracking-wider">
              {offer.couponCode}
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex justify-between items-center mt-auto">
          <div>
            <span className="line-through text-[12px] text-white/35">
              {offer.originalPrice} ₪
            </span>
            <p className="font-bold text-[20px] text-glace-yellow leading-none">
              {offer.salePrice} ₪
            </p>
          </div>

          {offer.orderHref ? (
            <Link
              href={offer.orderHref}
              className="flex items-center gap-1.5 bg-glace-yellow hover:bg-yellow-300 px-3.5 py-2 rounded-[12px] font-bold text-[#1e6a7f] text-[13px] transition-all"
            >
              اطلب الآن
              <ArrowLeft size={13} />
            </Link>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3.5 py-2 border border-white/20 rounded-[12px] font-medium text-[13px] text-white transition-all cursor-pointer"
            >
              التفاصيل
              <ArrowLeft size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Featured card (wide) ─────────────────────────────────────────────
function FeaturedCard({ offer }: { offer: Offer }) {
  return (
    <div className="group relative flex sm:flex-row flex-col bg-white/[.17] hover:bg-white/[.22] backdrop-blur-[15px] border border-glace-yellow/25 hover:border-glace-yellow/50 rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(244,228,81,0.15)]">
      <DiscountPill original={offer.originalPrice} sale={offer.salePrice} />

      {offer.badge && (
        <div className="top-3 right-3 z-10 absolute bg-glace-yellow px-3 py-1 rounded-full font-bold text-[#1e6a7f] text-[12px]">
          {offer.badge}
        </div>
      )}

      {/* Image side */}
      <div className="relative flex justify-center items-center bg-white/10 sm:w-[200px] w-full sm:h-auto h-[180px] overflow-hidden shrink-0">
        <Image
          src={offer.image}
          alt={offer.title}
          width={160}
          height={160}
          className="group-hover:scale-110 w-[140px] sm:w-[160px] h-[140px] sm:h-[160px] object-contain transition-transform duration-500 drop-shadow-xl"
        />
      </div>

      {/* Text side */}
      <div className="flex flex-col flex-1 justify-center gap-3 p-5">
        <span className="inline-flex items-center gap-1.5 bg-glace-yellow/15 px-3 py-1 rounded-full w-fit font-medium text-[12px] text-glace-yellow">
          <Sparkles size={11} />
          عرض مميز
        </span>
        <h3 className="font-bold text-[20px] sm:text-[22px] text-white leading-snug">
          {offer.title}
        </h3>
        <p className="text-[13px] text-white/65 leading-relaxed">
          {offer.description}
        </p>

        {offer.couponCode && (
          <div className="flex items-center gap-2 bg-glace-yellow/10 px-3 py-1.5 border border-glace-yellow/30 rounded-[10px] w-fit">
            <Ticket size={13} className="text-glace-yellow" />
            <span className="font-bold text-[12px] text-glace-yellow tracking-wider">
              {offer.couponCode}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 mt-1">
          <div>
            <span className="line-through text-[12px] text-white/35">
              {offer.originalPrice} ₪
            </span>
            <p className="font-bold text-[24px] text-glace-yellow leading-none">
              {offer.salePrice} ₪
            </p>
          </div>
          {offer.orderHref ? (
            <Link
              href={offer.orderHref}
              className="flex items-center gap-1.5 bg-glace-yellow hover:bg-yellow-300 px-4 py-2.5 rounded-[14px] font-bold text-[#1e6a7f] text-[14px] shadow-[0_4px_14px_rgba(244,228,81,0.35)] transition-all"
            >
              اطلب الآن
              <ArrowLeft size={14} />
            </Link>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-4 py-2.5 border border-white/20 rounded-[14px] font-medium text-[14px] text-white transition-all cursor-pointer"
            >
              التفاصيل
              <ArrowLeft size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-[15px] mx-auto py-20 border border-white/15 rounded-[30px] w-full text-center">
      <div className="flex justify-center items-center bg-white/15 rounded-full size-20">
        <Tag className="size-10 text-white" strokeWidth={1.5} />
      </div>
      <h3 className="font-bold text-2xl text-white">لا توجد عروض في هذا القسم</h3>
      <p className="px-6 max-w-sm text-base text-white/60">
        تابعنا لمعرفة أحدث عروض وتخفيضات جلاسيه الأمير
      </p>
    </div>
  );
}

// ── Category pills ───────────────────────────────────────────────────
function CategoryPill({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200 cursor-pointer shrink-0
        ${
          active
            ? "bg-glace-yellow text-[#1e6a7f] font-bold shadow-[0_4px_14px_rgba(244,228,81,0.4)]"
            : "bg-white/12 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white"
        }`}
    >
      {label}
      <span
        className={`text-[11px] rounded-full px-1.5 py-0.5 font-bold
          ${active ? "bg-[#1e6a7f]/20 text-[#1e6a7f]" : "bg-white/15 text-white/60"}`}
      >
        {count}
      </span>
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────────
export default function OffersClientPage() {
  const [activeCategory, setActiveCategory] = useState<OfferCategory>("الكل");

  const featured = useMemo(
    () => OFFERS.filter((o) => o.featured),
    [],
  );

  const filtered = useMemo(() => {
    if (activeCategory === "الكل") return OFFERS;
    return OFFERS.filter((o) => o.category === activeCategory);
  }, [activeCategory]);

  const regularOffers = filtered.filter((o) => !o.featured || activeCategory !== "الكل");

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        OFFER_CATEGORIES.map((cat) => [
          cat,
          cat === "الكل" ? OFFERS.length : OFFERS.filter((o) => o.category === cat).length,
        ]),
      ),
    [],
  );

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      {/* Floating decorations */}
      <Image
        src={imgIesPP}
        alt=""
        width={90}
        className="top-1/2 right-2.5 sm:right-7.5 lg:right-15 absolute opacity-60 w-10 sm:w-[52px] lg:w-[60px] pointer-events-none"
      />
      <Image
        src={imgIesC}
        alt=""
        width={110}
        className="top-1/2 left-2.5 sm:left-7.5 lg:left-15 absolute opacity-60 w-10 sm:w-[52px] lg:w-[60px] pointer-events-none"
      />
      <Image
        src={imgIcee}
        alt=""
        width={40}
        className="top-[220px] right-[24%] absolute hidden lg:block opacity-50 w-9 rotate-[-200deg] pointer-events-none"
      />
      <Image
        src={imgIesP}
        alt=""
        width={80}
        className="top-[200px] left-14 absolute hidden lg:block opacity-50 w-16 pointer-events-none"
      />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-12 max-w-[1300px]">

        {/* ── Header ── */}
        <div className="flex flex-col items-center pt-4 sm:pt-6 pb-6 sm:pb-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1 rounded-full text-[13px] text-white/80 mb-3">
            <Tag size={12} className="text-glace-yellow" />
            عروض حصرية لفترة محدودة
          </span>
          <h1 className="font-bold text-[32px] sm:text-[44px] lg:text-[52px] text-white leading-tight drop-shadow-lg">
            العروض والتخفيضات
          </h1>
          <p className="mt-2 max-w-[460px] text-[15px] sm:text-[16px] text-white/65 leading-relaxed">
            اكتشف أحدث عروضنا وتخفيضاتنا على المنتجات المميزة — لفترة محدودة فقط
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-5">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Sparkles size={13} className="text-glace-yellow" />
              <span className="font-medium text-[13px] text-white">{OFFERS.length} عرض متاح</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Clock size={13} className="text-glace-yellow" />
              <span className="font-medium text-[13px] text-white">عروض محدودة</span>
            </div>
          </div>
        </div>

        {/* ── Featured offers ── */}
        {activeCategory === "الكل" && featured.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/15" />
              <span className="flex items-center gap-1.5 font-semibold text-[14px] text-glace-yellow whitespace-nowrap">
                <Sparkles size={14} />
                العروض المميزة
              </span>
              <div className="flex-1 h-px bg-white/15" />
            </div>
            <div className="flex flex-col gap-4">
              {featured.map((offer) => (
                <FeaturedCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        )}

        {/* ── Category filter ── */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {OFFER_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              count={categoryCounts[cat] ?? 0}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-[13px] text-white/40 whitespace-nowrap">
            {activeCategory === "الكل" ? "جميع العروض" : activeCategory}
            {" "}({filtered.length})
          </span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* ── Grid ── */}
        {regularOffers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {regularOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
