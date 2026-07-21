"use client";

import Link from "next/link";
import Image from "next/image";
import { Tag, Sparkles, Clock, ArrowLeft } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import { imgIesPP, imgIesC } from "@/assets/images";

export default function OffersClientPage() {
  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

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

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-16 max-w-[900px]">

        {/* ── Header ── */}
        <div className="flex flex-col items-center pt-4 sm:pt-6 pb-8 sm:pb-10 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1 rounded-full text-[13px] text-white/80 mb-3">
            <Tag size={12} className="text-glace-yellow" />
            العروض والتخفيضات
          </span>
          <h1 className="font-bold text-[32px] sm:text-[44px] text-white leading-tight drop-shadow-lg">
            عروض جلاسيه الأمير
          </h1>
        </div>

        {/* ── Empty state ── */}
        <div className="bg-white/[.17] backdrop-blur-[15px] border border-white/15 rounded-[30px] overflow-hidden">
          <div className="flex flex-col items-center gap-6 px-6 py-16 sm:py-20 text-center">

            <div className="relative">
              <div className="flex items-center justify-center size-24 sm:size-28 rounded-full bg-white/10 border border-white/15">
                <Tag size={40} className="text-white/45" strokeWidth={1.5} />
              </div>
              <span className="absolute -top-1 -right-1 flex items-center justify-center size-8 rounded-full bg-glace-yellow shadow-[0_4px_12px_rgba(244,228,81,0.4)]">
                <Clock size={15} className="text-[#1e6a7f]" />
              </span>
            </div>

            <div className="max-w-md">
              <h2 className="text-white text-[24px] sm:text-[28px] font-bold mb-3">
                لا توجد عروض متاحة حالياً
              </h2>
              <p className="text-white/60 text-[15px] sm:text-[16px] leading-relaxed">
                نعمل على تجهيز عروض جديدة ومميزة لكم قريباً. تابعونا لمعرفة أحدث التخفيضات والعروض الحصرية.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-4 py-2 rounded-full text-[13px] text-white/70">
                <Sparkles size={13} className="text-glace-yellow" />
                عروض قادمة قريباً
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-4 py-2 rounded-full text-[13px] text-white/70">
                <Clock size={13} className="text-glace-yellow" />
                ترقبوا المفاجآت
              </span>
            </div>

            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[15px] px-7 py-3 rounded-full transition-all shadow-[0_4px_16px_rgba(244,228,81,0.35)] hover:shadow-[0_6px_24px_rgba(244,228,81,0.45)] hover:-translate-y-0.5 mt-2"
            >
              تصفح المنيو
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
