"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";

import { resolveHomeImageSrc, type IHomeEventsData } from "@/types/home.types";

export default function EventsSection({
  eventsData,
}: {
  eventsData: IHomeEventsData;
}) {
  const swiperRef = useRef<SwiperType | null>(null);
  const canLoop = eventsData.items.length > 4;

  return (
    <section className="z-[1] relative bg-white -mt-[1px] pt-2.5 pb-6 lg:pb-8 min-h-0 overflow-hidden">
      <div className="mx-auto w-[90%] max-w-400">
        <div className="text-center">
          <h1 className="text-[#53352a] text-[24px] sm:text-[36px] lg:text-[52px] leading-snug">
            {eventsData.title}
          </h1>

          <div className="relative flex flex-col mt-6 pb-2 md:pb-4 lg:pb-6">
            <div className="relative px-0 sm:px-12" dir="ltr">
              {/* Mobile arrows */}
              <div className="sm:hidden flex justify-end items-center gap-2 mb-3 px-1">
                <button
                  type="button"
                  aria-label="التالي"
                  onClick={() => swiperRef.current?.slideNext()}
                  className="flex justify-center items-center bg-[#53352a]/10 hover:bg-[#53352a] border-0 rounded-full size-9 text-[#53352a] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="السابق"
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="flex justify-center items-center bg-[#53352a]/10 hover:bg-[#53352a] border-0 rounded-full size-9 text-[#53352a] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <Swiper
                modules={[Autoplay, Pagination]}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  swiper.changeLanguageDirection("ltr");
                  swiper.update();
                }}
                dir="ltr"
                loop={canLoop}
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                spaceBetween={20}
                slidesPerView={1}
                slidesPerGroup={1}
                watchOverflow
                observer
                observeParents
                // Built-in pagination (not external el) so bullets stay in sync
                // with arrows, autoplay, and drag.
                pagination={{
                  clickable: true,
                  dynamicBullets: false,
                }}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 18 },
                  1024: { slidesPerView: 4, spaceBetween: 20 },
                }}
                className="[&_.swiper-slide]:box-border [&_.swiper-slide]:flex [&_.swiper-wrapper]:items-stretch [&_.swiper-slide]:py-3 !pb-0 [&_.swiper-slide]:!h-auto !overflow-visible events-swiper"
              >
                {eventsData.items.map((ev) => (
                  <SwiperSlide key={ev.id} className="!h-auto">
                    <Link
                      href={ev.href}
                      className="group flex flex-col gap-2.5 bg-white shadow-[0_8px_24px_rgba(83,53,42,0.12)] hover:shadow-[0_12px_32px_rgba(83,53,42,0.18)] p-2.5 rounded-[24px] w-full h-full no-underline transition-shadow duration-300"
                    >
                      <div className="rounded-[20px] w-full h-[170px] sm:h-[200px] overflow-hidden shrink-0">
                        <Image
                          src={resolveHomeImageSrc(ev.image)}
                          alt={ev.title}
                          width={330}
                          height={200}
                          className="rounded-[20px] w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3
                        className="px-1 pb-1 overflow-hidden text-[#53352a] sm:text-[18px] text-start leading-[1.25]"
                        dir="rtl"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          maxHeight: "2.5em",
                        }}
                      >
                        {ev.title}
                      </h3>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Tablet / desktop: side arrows */}
              <button
                type="button"
                aria-label="التالي"
                onClick={() => swiperRef.current?.slideNext()}
                className="hidden top-1/2 left-0 z-10 absolute sm:flex justify-center items-center bg-[#53352a]/10 hover:bg-[#53352a] border-0 rounded-full size-10 text-[#53352a] hover:text-white transition-colors -translate-y-[70%] cursor-pointer"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                aria-label="السابق"
                onClick={() => swiperRef.current?.slidePrev()}
                className="hidden top-1/2 right-0 z-10 absolute sm:flex justify-center items-center bg-[#53352a]/10 hover:bg-[#53352a] border-0 rounded-full size-10 text-[#53352a] hover:text-white transition-colors -translate-y-[70%] cursor-pointer"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* View more — bottom of section */}
            <div className="z-[8] relative flex justify-center mt-6 sm:mt-6 mb-2 lg:mb-2 w-full">
              <Link
                href={eventsData.moreHref}
                className="group inline-flex relative justify-center items-center w-[210px] sm:w-[230px] h-[72px] hover:scale-[1.04] active:scale-[0.97] transition-transform duration-200"
              >
                <svg
                  viewBox="0 0 280 96"
                  className="absolute inset-0 drop-shadow-[0_8px_18px_rgba(0,0,0,0.2)] group-hover:brightness-110 w-full h-full transition-[filter] duration-200"
                  aria-hidden
                  preserveAspectRatio="none"
                >
                  <path
                    d="M24 50
                       C18 28 52 10 88 16
                       C118 6 152 20 186 12
                       C224 4 262 22 260 50
                       C262 76 226 90 188 82
                       C154 92 118 78 86 86
                       C50 94 20 74 24 50 Z"
                    fill="rgba(83,53,42,0.18)"
                  />
                  <path
                    d="M30 50
                       C26 32 56 16 90 20
                       C120 12 152 24 184 16
                       C218 10 250 26 248 50
                       C250 72 218 84 184 78
                       C152 86 120 74 90 80
                       C56 88 28 70 30 50 Z"
                    fill="#f4e451"
                  />
                </svg>
                <span className="z-10 relative font-bold text-[#1a4a5a] text-[20px] sm:text-[22px] -rotate-[2deg]">
                  {eventsData.moreLabel}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .events-swiper {
              padding-bottom: 28px !important;
            }
            .events-swiper .swiper-pagination {
              position: relative !important;
              bottom: 0 !important;
              top: auto !important;
              margin-top: 12px;
              width: 100% !important;
              display: flex !important;
              justify-content: center;
              align-items: center;
              gap: 0;
            }
            .events-swiper .swiper-pagination-bullet {
              background: rgba(83, 53, 42, 0.28) !important;
              opacity: 1 !important;
              width: 8px !important;
              height: 8px !important;
              border-radius: 999px !important;
              margin: 0 3px !important;
              display: inline-block !important;
              transition: width 0.2s ease, background 0.2s ease;
            }
            .events-swiper .swiper-pagination-bullet-active {
              background: #53352a !important;
              width: 18px !important;
            }
          `,
        }}
      />
    </section>
  );
}
