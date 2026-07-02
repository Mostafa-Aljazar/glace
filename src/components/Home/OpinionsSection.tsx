"use client";

import { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";

import { Button } from "@/components/ui/button";
import { imgppO, imgp, islamSobhi, imgPL, imgPR } from "@/assets/images";
import type { Opinion } from "@/types";

const opinions: Opinion[] = [
  {
    id: 1,
    name: "Ibrahim S. Alfayoumi",
    text: "جلاسيه الأمير، عندما تلتقي الفخامة بألذ النكهات",
    image: imgp,
  },
  {
    id: 2,
    name: "Islam Sobhi",
    text: "جلاسيه الأمير، عندما تلتقي الفخامة بألذ النكهات",
    image: islamSobhi,
  },
  {
    id: 3,
    name: "Ibrahim S. Alfayoumi",
    text: "جلاسيه الأمير، عندما تلتقي الفخامة بألذ النكهات",
    image: imgp,
  },
];

export default function OpinionsSection() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="relative -mt-px bg-white w-full min-h-112.5 md:min-h-125 overflow-hidden">
      <div className="z-10 relative mx-auto py-10 w-full">
        {/* Title */}
        <div className="text-[#53352a] text-center">
          <h1 className="text-[38px] md:text-[45px] lg:text-[60px]">
            رأيك يهمنا!
          </h1>
        </div>

        {/* Slider row — side decorations are flex siblings of the slider, so they share its vertical center exactly */}
        <div className="flex justify-center items-center gap-0 sm:gap-1 mt-12.5 w-full">
          <Image
            src={imgPL}
            alt=""
            width={350}
            className="z-0 m-0 w-12 sm:w-auto h-27.5 sm:h-37.5 md:h-50 lg:h-87.5 object-contain shrink-0"
          />

          <div className="relative sm:flex-initial flex-1 mx-auto min-w-0 sm:max-w-162.5">
            <Button
              size="icon"
              onClick={() => swiperRef.current?.slidePrev()}
              className="top-1/2 -right-3 lg:-right-5 z-10 absolute flex justify-center items-center bg-[#7dd3f0] hover:bg-[#7dd3f0]/90 shadow-none p-0 rounded-full size-8.75 lg:size-11.25 aspect-square text-white -translate-y-1/2"
              aria-label="السابق"
            >
              <ChevronRight
                className="block size-4 lg:size-5"
                strokeWidth={3}
              />
            </Button>
            <Button
              size="icon"
              onClick={() => swiperRef.current?.slideNext()}
              className="top-1/2 -left-3 lg:-left-5 z-10 absolute flex justify-center items-center bg-[#7dd3f0] hover:bg-[#7dd3f0]/90 shadow-none p-0 rounded-full size-8.75 lg:size-11.25 aspect-square text-white -translate-y-1/2"
              aria-label="التالي"
            >
              <ChevronLeft className="block size-4 lg:size-5" strokeWidth={3} />
            </Button>

            <Swiper
              modules={[Navigation, Autoplay]}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              loop
              className="w-full"
            >
              {opinions.map((op) => (
                <SwiperSlide key={op.id}>
                  <div className="mx-auto text-center maskOpCard">
                    {/* Avatar */}
                    <div className="relative mx-auto w-max imgPo">
                      <Image
                        src={imgppO}
                        alt=""
                        width={180}
                        className="top-4 -right-0.75 absolute w-40 sm:w-35 md:w-45 lg:w-45 imgppO"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={op.image.src}
                        alt={op.name}
                        className="block w-40 sm:w-35 md:w-45 lg:w-45 h-40 sm:h-35 md:h-45 lg:h-45 mask1"
                      />
                    </div>

                    {/* Name */}
                    <p
                      dir="ltr"
                      className="mt-2 text-[#000000d5] text-[30px] nameM"
                    >
                      {op.name}
                    </p>

                    {/* Quote */}
                    <div className="before:top-[-15px] after:top-[-15px] before:right-0 after:left-0 before:absolute after:absolute relative before:bg-[url('/images/imgI.png')] after:bg-[url('/images/imgI.png')] before:bg-cover after:bg-cover mx-auto w-full before:w-7 after:w-7 max-w-100 before:h-6.25 after:h-6.25 text-[#000000ab] before:content-[''] after:content-[''] bodyText after:[transform:rotateY(180deg)]">
                      <p className="mb-0 text-[18px] sm:text-[23px] lg:text-[28px]">
                        {op.text}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <Image
            src={imgPR}
            alt=""
            width={380}
            className="z-0 m-0 w-12 sm:w-auto h-31.75 sm:h-37.5 md:h-55 lg:h-95 object-contain shrink-0"
          />
        </div>
      </div>
    </section>
  );
}
