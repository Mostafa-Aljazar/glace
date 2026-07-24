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

import { imgBtnBrown } from "@/assets/images";
import type { IHomeEventsData } from "@/types/home.types";

export default function EventsSection({
  eventsData,
}: {
  eventsData: IHomeEventsData;
}) {
  const swiperRef = useRef<SwiperType | null>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  return (
    <section className="z-[1] relative bg-white -mt-[1px] pt-2.5 pb-4 lg:pb-6 min-h-0 overflow-hidden">
      <div className="mx-auto w-[90%] max-w-400">
        <div className="text-center">
          <h1 className="text-[#53352a] text-[38px] md:text-[45px] lg:text-[60px]">
            {eventsData.title}
          </h1>

          <div className="relative flex flex-col mt-6 pb-2 md:pb-4 lg:pb-6">
            <div className="relative px-0 sm:px-12" dir="ltr">
              {/* Mobile: prev/next above the slider, on the left */}
              <div className="flex sm:hidden justify-start items-center gap-2 mb-3 px-1">
                <button
                  type="button"
                  aria-label="السابق"
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="flex justify-center items-center bg-[#53352a]/10 hover:bg-[#53352a] border-0 rounded-full size-9 text-[#53352a] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="التالي"
                  onClick={() => swiperRef.current?.slideNext()}
                  className="flex justify-center items-center bg-[#53352a]/10 hover:bg-[#53352a] border-0 rounded-full size-9 text-[#53352a] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <Swiper
                modules={[Autoplay, Pagination]}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  const pag = swiper.params.pagination;
                  if (
                    paginationRef.current &&
                    pag &&
                    typeof pag !== "boolean"
                  ) {
                    pag.el = paginationRef.current;
                    swiper.pagination.init();
                    swiper.pagination.render();
                    swiper.pagination.update();
                  }
                }}
                dir="ltr"
                loop={eventsData.items.length > 4}
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                spaceBetween={20}
                slidesPerView={1}
                slidesPerGroup={1}
                watchOverflow
                pagination={{
                  clickable: true,
                  el: paginationRef.current,
                }}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 18 },
                  1024: { slidesPerView: 4, spaceBetween: 20 },
                }}
                className="events-swiper !overflow-hidden !pb-0 [&_.swiper-wrapper]:items-stretch [&_.swiper-slide]:!h-auto [&_.swiper-slide]:flex [&_.swiper-slide]:box-border [&_.swiper-slide]:py-3"
              >
                {eventsData.items.map((ev) => (
                  <SwiperSlide key={ev.id} className="!h-auto">
                    <Link
                      href={ev.href}
                      className="group flex flex-col gap-2.5 bg-white shadow-[0_8px_24px_rgba(83,53,42,0.12)] hover:shadow-[0_12px_32px_rgba(83,53,42,0.18)] p-2.5 rounded-[24px] w-full h-full no-underline transition-shadow duration-300"
                    >
                      <div className="rounded-[20px] w-full h-[200px] shrink-0 overflow-hidden">
                        <Image
                          src={ev.image}
                          alt={ev.title}
                          width={330}
                          height={200}
                          className="rounded-[20px] w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3
                        className="px-1 pb-1 overflow-hidden text-[22px] sm:text-[24px] lg:text-[26px] text-[#53352a] text-start leading-[1.25]"
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
                aria-label="السابق"
                onClick={() => swiperRef.current?.slidePrev()}
                className="hidden sm:flex top-1/2 left-0 z-10 absolute justify-center items-center bg-[#53352a]/10 hover:bg-[#53352a] border-0 rounded-full size-10 text-[#53352a] hover:text-white transition-colors -translate-y-[70%] cursor-pointer"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                aria-label="التالي"
                onClick={() => swiperRef.current?.slideNext()}
                className="hidden sm:flex top-1/2 right-0 z-10 absolute justify-center items-center bg-[#53352a]/10 hover:bg-[#53352a] border-0 rounded-full size-10 text-[#53352a] hover:text-white transition-colors -translate-y-[70%] cursor-pointer"
              >
                <ChevronRight size={22} />
              </button>

              {/* Centered dots under the slider */}
              <div className="flex justify-center items-center mt-3 mb-2 px-1 w-full">
                <div
                  ref={paginationRef}
                  className="events-pagination flex justify-center items-center gap-1.5 min-h-4 w-full"
                />
              </div>
            </div>

            {/* View more — bottom of section */}
            <div className="z-[8] relative flex justify-center mt-8 sm:mt-6 mb-1 lg:mb-2 w-full">
              <Link
                href={eventsData.moreHref}
                className="relative flex justify-center items-center"
              >
                <Image
                  src={imgBtnBrown}
                  alt=""
                  width={260}
                  className="top-1/2 left-1/2 absolute w-65 -translate-x-1/2 -translate-y-1/2"
                />
                <h2 className="relative mb-0 px-6 text-[#53352a] text-[36px] whitespace-nowrap">
                  {eventsData.moreLabel}
                </h2>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .events-pagination .swiper-pagination-bullet {
              background: rgba(83, 53, 42, 0.28) !important;
              opacity: 1 !important;
              width: 8px !important;
              height: 8px !important;
              border-radius: 999px !important;
              margin: 0 3px !important;
              display: inline-block !important;
            }
            .events-pagination .swiper-pagination-bullet-active {
              background: #53352a !important;
              width: 18px !important;
            }
          `,
        }}
      />
    </section>
  );
}
