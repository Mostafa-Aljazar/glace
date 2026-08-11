"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EventsBackground from "@/components/Events/EventsBackground";
import EventsPagination from "./EventsPagination";
import {
  imgIesPP,
  imgIesC,
  imgIcee,
  imgIesP,
  calendarIcon,
} from "@/assets/images";
import { EVENTS_PER_PAGE, resolveEventImageSrc } from "@/types/events.types";
import DataError from "@/components/Common/DataError";
import { useEvents } from "@/hooks/events/useEvents";
import { CalendarX, Sparkles, ArrowLeft } from "lucide-react";
import type { IEvent } from "@/types/events.types";

function EventCard({ event }: { event: IEvent }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col bg-white/[.17] hover:bg-white/[.22] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-[15px] rounded-[20px] overflow-hidden transition-all hover:-translate-y-1 duration-300"
    >
      <div className="relative w-full h-[180px] overflow-hidden">
        <Image
          src={resolveEventImageSrc(event.listImage)}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-1.5 text-[12px] text-white/55">
          <Image
            src={calendarIcon}
            alt=""
            width={13}
            height={13}
            className="opacity-70"
          />
          {event.date}
        </div>
        <h3 className="font-bold text-[18px] text-white line-clamp-2 leading-snug">
          {event.title}
        </h3>
        <span className="flex items-center gap-1 group-hover:gap-2 mt-0.5 text-[13px] text-glace-yellow transition-all">
          اقرأ المزيد
          <ArrowLeft size={13} />
        </span>
      </div>
    </Link>
  );
}

function EventsSkeleton() {
  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: EVENTS_PER_PAGE }).map((_, i) => (
        <div
          key={i}
          className="bg-white/10 rounded-[20px] h-[268px] animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-[15px] mx-auto py-20 border border-white/15 rounded-[30px] w-full text-center">
      <div className="flex justify-center items-center bg-white/15 rounded-full size-20">
        <CalendarX className="size-10 text-white" strokeWidth={1.5} />
      </div>
      <h3 className="font-bold text-white text-2xl">لا توجد فعاليات حالياً</h3>
      <p className="px-6 max-w-sm text-white/60 text-base">
        تابعنا لمعرفة أحدث فعاليات ومناسبات جلاسيه الأمير
      </p>
    </div>
  );
}

export default function EventsClientPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError, refetch } = useEvents({
    page: currentPage,
    perPage: EVENTS_PER_PAGE,
  });

  const pageItems = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  function handlePageChange(p: number) {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
      <Image
        src={imgIcee}
        alt=""
        width={40}
        className="hidden lg:block top-[220px] right-[24%] absolute opacity-50 w-9 rotate-[-200deg] pointer-events-none"
      />
      <Image
        src={imgIesP}
        alt=""
        width={80}
        className="hidden lg:block top-[200px] left-14 absolute opacity-50 w-16 pointer-events-none"
      />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-12 max-w-[1300px]">
        <div className="flex flex-col items-center pt-4 sm:pt-6 pb-5 sm:pb-6 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm mb-3 px-4 py-1 border border-white/20 rounded-full text-[13px] text-white/80">
            <Sparkles size={12} className="text-glace-yellow" />
            أحدث فعالياتنا
          </span>
          <h1 className="drop-shadow-lg font-bold text-[32px] text-white sm:text-[44px] lg:text-[52px] leading-tight">
            الفعاليات والمناسبات
          </h1>
          <p className="mt-2 max-w-[440px] text-[16px] text-white/65 leading-relaxed">
            اكتشف أبرز الأحداث والمناسبات الخاصة في جلاسيه الأمير
          </p>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 bg-white/15 h-px" />
          <span className="text-[13px] text-white/40 whitespace-nowrap">
            الصفحة {currentPage} من {totalPages}
          </span>
          <div className="flex-1 bg-white/15 h-px" />
        </div>

        {isLoading ? (
          <EventsSkeleton />
        ) : isError ? (
          <DataError
            title="تعذّر تحميل الفعاليات"
            description="لم نتمكن من الوصول إلى الخادم، حاول مرة أخرى"
            onRetry={() => void refetch()}
          />
        ) : pageItems.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
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
