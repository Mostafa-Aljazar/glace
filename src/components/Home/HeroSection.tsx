"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";

import {
  imgL,
  happinessExpertsImg,
  imgBtn,
  iceC,
  sunImg,
} from "@/assets/images";
import type { ISlideData } from "@/types/home.types";

interface HeroSectionProps {
  slides: ISlideData[];
  onColorChange?: (color: string) => void;
}

export default function HeroSection({
  slides,
  onColorChange,
}: HeroSectionProps) {
  const iceCRef = useRef<HTMLImageElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const headerTRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(0);
  const rotationDegreeRef = useRef(0);
  const rotationDegreeIceRef = useRef(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const slidesData = slides;

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const prev = prevIndexRef.current;
      const active = swiper.activeIndex;

      if (prev < active) {
        rotationDegreeIceRef.current += 60;
        rotationDegreeRef.current += 40;
      } else {
        rotationDegreeIceRef.current -= 60;
        rotationDegreeRef.current -= 40;
      }

      let rd = rotationDegreeRef.current % 360;
      if (rd < 0) rd += 360;
      rotationDegreeRef.current = rd;

      prevIndexRef.current = active;

      const slide = slidesData[swiper.realIndex];
      if (!slide) return;

      if (bgImgRef.current) {
        bgImgRef.current.style.transform = `rotate(${rotationDegreeRef.current}deg) scale(3)`;
      }
      if (iceCRef.current) {
        iceCRef.current.style.transform = `translate(-58%, 50%) rotate(${rotationDegreeIceRef.current}deg)`;
      }
      if (headerTRef.current) {
        headerTRef.current.style.backgroundColor = slide.headerBgColor;
      }

      onColorChange?.(slide.bgColor);
    },
    [onColorChange, slidesData],
  );

  return (
    <div className="relative bg-[radial-gradient(circle,rgba(0,0,0,0.14)_48%,rgba(0,0,0,0.44)_96%)] pb-16 sm:pb-20 lg:pb-24 min-h-screen overflow-hidden">
      {/* .imgS — rotating background blob */}
      <div className="z-[80] absolute inset-0 w-full h-full overflow-hidden">
        <img
          ref={bgImgRef}
          src={imgL.src}
          alt=""
          className="top-0 left-0 absolute w-full h-full object-cover transition-[transform] duration-[3000ms] ease-linear"
          style={{ transform: "scale(3)" }}
        />
      </div>

      {/* .imageHeaderT */}
      <div
        ref={headerTRef}
        className="imageHeaderT"
        style={{ left: "0", width: "100vw", maxWidth: "none" }}
      />

      {/* .iceC — bottom ice cream (boza) */}
      <img
        ref={iceCRef}
        src={iceC.src}
        alt=""
        className="bottom-0 left-0 z-[98] absolute w-[85%] sm:w-[100%] md:w-[110%] lg:w-full max-w-none 2xl:max-w-[1100px] xl:max-w-[900px] transition-[transform] duration-[1400ms] ease-in-out pointer-events-none"
        style={{ transform: "translate(-58%, 50%)" }}
      />

      {/* .swiperHeader */}
      <div className="z-[90] absolute inset-0">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 7000, disableOnInteraction: false }}
          speed={500}
          loop
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={handleSlideChange}
          className="w-full h-full"
        >
          {slidesData.map((slide: ISlideData, i: number) => (
            <SwiperSlide key={i}>
              <div className="flex items-center w-full h-full overflow-hidden">
                {/* .centerImageH */}
                <div className="relative mx-auto min-w-[290px] md:min-w-[290px] lg:min-w-[395px] 2xl:min-w-[465px]">
                  {/* sun */}
                  <Image
                    src={sunImg}
                    alt=""
                    width={170}
                    height={170}
                    className="top-[-25px] sm:top-0 right-[55px] sm:right-auto left-auto md:left-[-170px] lg:left-[-170px] z-[1099] absolute w-[80px] sm:w-[95px] md:w-[120px] lg:w-[140px] 2xl:w-[150px]"
                    style={{
                      animation: "rotateS 20s normal linear infinite",
                    }}
                  />

                  {/* happiness experts badge */}
                  <Image
                    src={happinessExpertsImg}
                    alt=""
                    width={200}
                    height={160}
                    className="top-[55px] sm:top-[50px] md:top-[35px] lg:top-[50px] 2xl:top-[55px] xl:top-[50px] right-[-30px] sm:right-[-66px] md:right-[-80px] lg:right-[-107px] 2xl:right-[-110px] xl:right-[-107px] z-[1099] absolute w-[104px] sm:w-[120px] md:w-[130px] lg:w-[145px] 2xl:w-[160px] xl:w-[150px] hover:rotate-2 transition-transform duration-300"
                  />

                  {/* character */}
                  <Image
                    src={slide.manImg}
                    alt=""
                    width={260}
                    height={200}
                    className="flex mb-[-5px] w-full h-[150px] md:h-[150px] lg:h-[170px] 2xl:h-[200px] xl:h-[180px] object-bottom-left object-contain"
                  />

                  {/* title blocks */}
                  <div className="mx-auto text-center">
                    <div
                      className="z-[199] relative flex justify-center items-center mx-auto px-5 h-[80px] 2xl:h-[74px] text-white -rotate-[1deg] skew-x-[15deg]"
                      style={{
                        backgroundColor: slide.h1BgColor,
                      }}
                    >
                      <h1
                        className="font-bold text-[45px] sm:text-[64px] lg:text-[75px] 2xl:text-[85px] rotate-[1deg] -skew-x-[15deg]"
                        style={{ textShadow: "2px 2px #0000006c" }}
                      >
                        {slide.titleH1}
                      </h1>
                    </div>
                    <div
                      className="mx-auto -mt-[30px] px-[10px] sm:px-[25px] py-[35px] pb-[15px] sm:pl-[15px] text-white -rotate-[4deg] skew-x-[10deg] [clip-path:polygon(0%_0%,96%_0%,100%_100%,0%_90%)]"
                      style={{
                        backgroundColor: slide.h2BgColor,
                      }}
                    >
                      <h2
                        className="text-[20px] sm:text-[27px] lg:text-[30px] 2xl:text-[35px] text-center rotate-[4deg] -skew-x-[10deg]"
                        style={{ textShadow: "2px 2px #0000001e" }}
                      >
                        {slide.titleH2}
                      </h2>
                    </div>
                  </div>

                  {/* piece ice — desktop/tablet only (avoids overlapping the CTA on mobile) */}
                  <Image
                    src={slide.pieceImg}
                    alt=""
                    width={155}
                    height={155}
                    className="hidden md:block right-[-79px] md:right-[-123px] lg:right-[-230px] 2xl:right-[-230px] absolute w-[80px] md:w-[85px] lg:w-[120px] 2xl:w-[130px] h-[80px] md:h-[85px] lg:h-[120px] 2xl:h-[130px] object-contain hover:scale-105 transition-transform -translate-y-[10px] md:-translate-y-[25px] lg:-translate-y-[50px] 2xl:-translate-y-[25px] duration-[1500ms]"
                  />

                  {/* order now button — centered in flow */}
                  <div className="z-[200] relative flex justify-center mt-8 sm:mt-10 lg:mt-12 mb-6 sm:mb-8 lg:mb-10">
                    <Link href="/menu" className="inline-flex">
                      <div className="relative flex justify-center items-center w-[300px] sm:w-[270px] lg:w-[260px] 2xl:w-[300px] h-[96px] sm:h-[82px] lg:h-[92px] 2xl:h-[110px]">
                        <Image
                          src={imgBtn}
                          alt=""
                          fill
                          className="object-fill"
                        />
                        <h2
                          className="z-10 relative mb-0 text-[#f4e451] text-[38px] sm:text-[32px] lg:text-[36px] 2xl:text-[40px]"
                          style={{ textShadow: "1px 1px #00000071" }}
                        >
                          اطلب الان
                        </h2>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* swiper nav buttons */}
      <button
        onClick={() => swiperRef.current?.slideNext()}
        className="top-1/2 left-3 sm:left-5 z-[9999] absolute flex justify-center items-center bg-white/50 hover:bg-white/65 rounded-full w-9.5 sm:w-11.5 h-9.5 sm:h-11.5 transition-colors -translate-y-1/2 duration-200 cursor-pointer"
      >
        <ChevronLeft size={18} strokeWidth={2.5} className="text-white" />
      </button>
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className="top-1/2 right-3 sm:right-5 z-[9999] absolute flex justify-center items-center bg-white/50 hover:bg-white/65 rounded-full w-9.5 sm:w-11.5 h-9.5 sm:h-11.5 transition-colors -translate-y-1/2 duration-200 cursor-pointer"
      >
        <ChevronRight size={18} strokeWidth={2.5} className="text-white" />
      </button>
    </div>
  );
}
