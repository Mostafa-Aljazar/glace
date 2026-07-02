"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import EventsBackground from "@/components/Events/EventsBackground";
import { EVENTS } from "@/data/Events";
import type { EventData } from "@/data/Events";

interface EventDetailClientPageProps {
  id: number;
}

function RelatedCard({ event }: { event: EventData }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col bg-white/[.12] hover:bg-white/[.18] border border-white/15 hover:border-white/25 rounded-[20px] overflow-hidden transition-all hover:-translate-y-1 duration-300"
    >
      <div className="relative w-full h-40 overflow-hidden">
        <Image
          src={event.listImage}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <div className="flex items-center gap-1.5 text-[12px] text-white/50">
          <Calendar size={11} />
          {event.date}
        </div>
        <h3 className="font-bold text-[14px] text-white line-clamp-2 leading-snug">
          {event.title}
        </h3>
        <span className="flex items-center gap-1 group-hover:gap-2 text-[12px] text-glace-yellow transition-all">
          اقرأ المزيد <ChevronLeft size={11} />
        </span>
      </div>
    </Link>
  );
}

export default function EventDetailClientPage({
  id,
}: EventDetailClientPageProps) {
  const event = EVENTS.find((e) => e.id === id);
  const otherEvents = EVENTS.filter((e) => e.id !== id).slice(0, 6);

  if (!event) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen">
        <p className="font-bold text-[32px] text-white">الفعالية غير موجودة</p>
        <Link
          href="/events"
          className="flex items-center gap-2 bg-glace-yellow px-6 py-2.5 rounded-full font-bold text-[#1e6a7f] text-[16px]"
        >
          <ArrowRight size={16} />
          العودة للفعاليات
        </Link>
      </div>
    );
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-16 max-w-[1200px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mt-4 mb-7 text-[13px] text-white/50">
          <Link
            href="/events"
            className="hover:text-white/90 transition-colors"
          >
            الفعاليات
          </Link>
          <ChevronLeft size={13} />
          <span className="text-white/75 line-clamp-1">{event.title}</span>
        </div>

        {/* ── Main card ── */}
        <div className="relative bg-white/[.15] shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-[18px] border border-white/20 rounded-[28px] overflow-hidden">
          <div className="flex md:flex-row flex-col">
            {/* ── Right: Swiper — small fixed card, anchored to top ── */}
            <div className="self-start mt-16 p-5 w-full md:w-120 h-[220px] md:h-[220px] shrink-0">
              <div className="relative rounded-2xl w-full h-full overflow-hidden">
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  className="absolute inset-0 w-full h-full [--swiper-navigation-color:#fff] [--swiper-navigation-size:15px] [--swiper-pagination-color:#f4e451] [--swiper-pagination-bullet-inactive-color:rgba(255,255,255,0.35)] [--swiper-pagination-bullet-inactive-opacity:1]"
                >
                  {event.images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <Image
                        src={img}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Photo count pill */}
                <span className="top-2 right-2 z-20 absolute flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium text-[11px] text-white/90 pointer-events-none">
                  <span className="inline-block bg-glace-yellow rounded-full size-1.5" />
                  {event.images.length} صور
                </span>
              </div>
            </div>

            {/* ── Left: Text — grows freely ── */}
            <div className="flex flex-col flex-1 gap-5 px-7 sm:px-10 py-7 sm:py-9 text-white">
              {/* Date + back */}
              <div className="flex flex-wrap justify-between items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 border border-white/15 rounded-full text-[13px] text-white/65">
                  <Calendar size={13} className="text-glace-yellow" />
                  {event.date}
                </span>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-1.5 border border-white/15 rounded-full text-[13px] text-white/70 hover:text-white transition-all"
                >
                  <ArrowRight size={13} />
                  الفعاليات
                </Link>
              </div>

              {/* Title */}
              <div>
                <h1 className="mb-3 font-bold text-[22px] sm:text-[28px] leading-snug">
                  {event.title}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="bg-glace-yellow rounded-full w-10 h-[3px] shrink-0" />
                  <div className="flex-1 bg-white/10 h-px" />
                </div>
              </div>

              <p className="text-[14px] text-white/78 sm:text-[16px] text-justify leading-[200%]">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        {/* ── Related events ── */}
        {otherEvents.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-bold text-[22px] text-white sm:text-[28px] whitespace-nowrap">
                فعاليات أخرى
              </h2>
              <div className="flex-1 bg-white/15 h-px" />
              <Link
                href="/events"
                className="flex items-center gap-1 hover:gap-2 text-[13px] text-glace-yellow whitespace-nowrap transition-all"
              >
                عرض الكل <ChevronLeft size={13} />
              </Link>
            </div>

            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={14}
              slidesPerView={1}
              breakpoints={{
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="pb-10 [--swiper-pagination-color:#f4e451] [--swiper-pagination-bullet-inactive-color:rgba(255,255,255,0.3)] [--swiper-pagination-bullet-inactive-opacity:1]"
            >
              {otherEvents.map((ev) => (
                <SwiperSlide key={ev.id}>
                  <RelatedCard event={ev} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

    </div>
  );
}
