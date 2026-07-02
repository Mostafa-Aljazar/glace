"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EventsBackground from "@/components/Events/EventsBackground";
import EventsPagination from "./EventsPagination";
import { imgIesPP, imgIesC, imgIcee, imgIesP, calendarIcon } from "@/assets/images";
import { EVENTS, ITEMS_PER_PAGE } from "@/data/Events";
import { CalendarX, Sparkles, ArrowLeft } from "lucide-react";
import type { EventData } from "@/data/Events";

// ── Event card ───────────────────────────────────────────────────────
function EventCard({ event }: { event: EventData }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col bg-white/[.17] hover:bg-white/[.22] backdrop-blur-[15px] rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
    >
      {/* Image */}
      <div className="relative w-full h-[180px] overflow-hidden">
        <Image
          src={event.listImage}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-1.5 text-white/55 text-[12px]">
          <Image src={calendarIcon} alt="" width={13} height={13} className="opacity-70" />
          {event.date}
        </div>
        <h3 className="text-white text-[18px] font-bold leading-snug line-clamp-2">
          {event.title}
        </h3>
        <span className="flex items-center gap-1 text-glace-yellow text-[13px] group-hover:gap-2 transition-all mt-0.5">
          اقرأ المزيد
          <ArrowLeft size={13} />
        </span>
      </div>
    </Link>
  );
}

// ── Empty state ──────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-[15px] mx-auto py-20 rounded-[30px] w-full text-center border border-white/15">
      <div className="flex justify-center items-center bg-white/15 rounded-full size-20">
        <CalendarX className="size-10 text-white" strokeWidth={1.5} />
      </div>
      <h3 className="text-white text-2xl font-bold">لا توجد فعاليات حالياً</h3>
      <p className="px-6 text-white/60 text-base max-w-sm">
        تابعنا لمعرفة أحدث فعاليات ومناسبات جلاسيه الأمير
      </p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────
export default function EventsClientPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(EVENTS.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = EVENTS.slice(start, start + ITEMS_PER_PAGE);

  function handlePageChange(p: number) {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      {/* Floating decorations */}
      <Image src={imgIesPP} alt="" width={90}
        className="top-1/2 right-2.5 sm:right-7.5 lg:right-15 absolute w-10 sm:w-[52px] lg:w-[60px] pointer-events-none opacity-60" />
      <Image src={imgIesC} alt="" width={110}
        className="top-1/2 left-2.5 sm:left-7.5 lg:left-15 absolute w-10 sm:w-[52px] lg:w-[60px] pointer-events-none opacity-60" />
      <Image src={imgIcee} alt="" width={40}
        className="hidden lg:block top-[220px] right-[24%] absolute w-9 rotate-[-200deg] pointer-events-none opacity-50" />
      <Image src={imgIesP} alt="" width={80}
        className="hidden lg:block top-[200px] left-14 absolute w-16 pointer-events-none opacity-50" />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-12 max-w-[1300px]">

        {/* ── Header ── */}
        <div className="flex flex-col items-center text-center pt-4 sm:pt-6 pb-5 sm:pb-6">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1 text-white/80 text-[13px] mb-3">
            <Sparkles size={12} className="text-glace-yellow" />
            أحدث فعالياتنا
          </span>
          <h1 className="text-white text-[32px] sm:text-[44px] lg:text-[52px] font-bold leading-tight drop-shadow-lg">
            الفعاليات والمناسبات
          </h1>
          <p className="text-white/65 text-[15px] sm:text-[16px] mt-2 max-w-[440px] leading-relaxed">
            اكتشف أبرز الأحداث والمناسبات الخاصة في جلاسيه الأمير
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-white/40 text-[13px] whitespace-nowrap">
            الصفحة {currentPage} من {totalPages}
          </span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* ── Grid ── */}
        {pageItems.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pageItems.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>

            <EventsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

    </div>
  );
}
