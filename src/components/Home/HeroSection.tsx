"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, IceCreamCone } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";

import {
  imgL,
  happinessExpertsImg,
  iceC,
  sunImg,
} from "@/assets/images";
import HeaderWave from "@/components/Common/HeaderWave";
import { resolveHomeImageSrc, type ISlideData } from "@/types/home.types";

function contrastOn(bg: string): string {
  const hex = bg.trim().replace("#", "");
  const full =
    hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return "#ffffff";
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 165 ? "#1a4a5a" : "#ffffff";
}

const ICE_C_SHIFT = "translate(-62%, 52%)";

interface HeroSectionProps {
  slides: ISlideData[];
  bgColor: string;
  onColorChange?: (color: string) => void;
}

export default function HeroSection({
  slides,
  bgColor,
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
        iceCRef.current.style.transform = `${ICE_C_SHIFT} rotate(${rotationDegreeIceRef.current}deg)`;
      }
      if (headerTRef.current) {
        headerTRef.current.style.color = slide.headerBgColor;
      }

      onColorChange?.(slide.bgColor);
    },
    [onColorChange, slidesData],
  );

  return (
    <div className="relative min-h-screen overflow-hidden pb-0">
      {/* overlay + blob fade into the about section color */}
      <div
        className="z-[80] absolute inset-0 overflow-hidden pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.14)_48%,rgba(0,0,0,0.44)_96%)]" />
        <img
          ref={bgImgRef}
          src={imgL.src}
          alt=""
          className="top-0 left-0 absolute w-full h-full object-cover transition-[transform] duration-[3000ms] ease-linear"
          style={{ transform: "scale(3)" }}
        />
      </div>

      <div
        ref={headerTRef}
        className="absolute top-0 left-0 z-[80] w-full pointer-events-none"
        style={{ color: slidesData[0]?.headerBgColor ?? "#51c9f48a" }}
      >
        <HeaderWave />
      </div>

      {/* .iceC — bottom ice cream (boza) */}
      <img
        ref={iceCRef}
        src={iceC.src}
        alt=""
        className="bottom-2 left-2 z-[98] absolute w-[85%] sm:w-[100%] md:w-[110%] lg:w-full max-w-none 2xl:max-w-[1100px] xl:max-w-[900px] transition-[transform] duration-[1400ms] ease-in-out pointer-events-none"
        style={{ transform: ICE_C_SHIFT }}
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
          dir="ltr"
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={handleSlideChange}
          className="w-full h-full"
        >
          {slidesData.map((slide: ISlideData, i: number) => (
            <SwiperSlide key={i}>
              <div className="flex items-center w-full h-full overflow-hidden">
                {/* .centerImageH — no min-width on phones; side padding keeps skew/badges on-screen */}
                <div className="relative mx-auto w-full max-w-[465px] min-w-0 px-8 sm:px-10 md:px-0 md:min-w-[290px] lg:min-w-[395px] 2xl:min-w-[465px]">
                  {/* sun */}
                  <Image
                    src={sunImg}
                    alt=""
                    width={170}
                    height={170}
                    className="top-[-22px] sm:top-0 left-[40%] right-auto md:left-[-170px] lg:left-[-170px] z-[1099] absolute w-[64px] sm:w-[80px] md:w-[120px] lg:w-[140px] 2xl:w-[150px]"
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
                    className="top-[44px] sm:top-[50px] md:top-[35px] lg:top-[50px] 2xl:top-[55px] xl:top-[50px] right-0 sm:right-[-66px] md:right-[-80px] lg:right-[-107px] 2xl:right-[-110px] xl:right-[-107px] z-[1099] absolute w-[86px] sm:w-[104px] md:w-[130px] lg:w-[145px] 2xl:w-[160px] xl:w-[150px] hover:rotate-2 transition-transform duration-300"
                  />

                  {/* character */}
                  <Image
                    src={resolveHomeImageSrc(slide.manImg)}
                    alt=""
                    width={260}
                    height={200}
                    className="flex mb-[-5px] w-full h-[130px] sm:h-[150px] md:h-[150px] lg:h-[170px] 2xl:h-[200px] xl:h-[180px] object-bottom-left object-contain"
                  />

                  {/* title blocks */}
                  <div className="mx-auto w-full max-w-full text-center">
                    <div
                      className="z-[199] relative flex justify-center items-center mx-auto px-3 sm:px-5 h-[52px] sm:h-[70px] md:h-[80px] 2xl:h-[74px] text-white -rotate-[1deg] skew-x-[10deg] sm:skew-x-[15deg]"
                      style={{
                        backgroundColor: slide.h1BgColor,
                      }}
                    >
                      <h1
                        className="font-bold text-[clamp(1.45rem,7.4vw,2.6rem)] sm:text-[45px] md:text-[64px] lg:text-[75px] 2xl:text-[85px] leading-none rotate-[1deg] -skew-x-[10deg] sm:-skew-x-[15deg]"
                        style={{ textShadow: "2px 2px #0000006c" }}
                      >
                        {slide.titleH1}
                      </h1>
                    </div>
                    <div
                      className="mx-auto -mt-[18px] sm:-mt-[30px] px-3 sm:px-[25px] py-5 sm:py-[35px] pb-2.5 sm:pb-[15px] sm:pl-[15px] text-white -rotate-[4deg] skew-x-[8deg] sm:skew-x-[10deg] [clip-path:polygon(0%_0%,96%_0%,100%_100%,0%_90%)]"
                      style={{
                        backgroundColor: slide.h2BgColor,
                      }}
                    >
                      <h2
                        className="text-[14px] sm:text-[20px] md:text-[27px] lg:text-[30px] 2xl:text-[35px] leading-snug text-center rotate-[4deg] -skew-x-[8deg] sm:-skew-x-[10deg]"
                        style={{ textShadow: "2px 2px #0000001e" }}
                      >
                        {slide.titleH2}
                      </h2>
                    </div>
                  </div>

                  {/* piece ice — desktop/tablet only (avoids overlapping the CTA on mobile) */}
                  <Image
                    src={resolveHomeImageSrc(slide.pieceImg)}
                    alt=""
                    width={155}
                    height={155}
                    className="hidden md:block right-[-79px] md:right-[-123px] lg:right-[-230px] 2xl:right-[-230px] absolute w-[80px] md:w-[85px] lg:w-[120px] 2xl:w-[130px] h-[80px] md:h-[85px] lg:h-[120px] 2xl:h-[130px] object-contain hover:scale-105 transition-transform -translate-y-[10px] md:-translate-y-[25px] lg:-translate-y-[50px] 2xl:-translate-y-[25px] duration-[1500ms]"
                  />

                  {/* order now — wavy blob button */}
                  <div className="z-[200] relative flex justify-center mt-6 sm:mt-10 lg:mt-12 mb-6 sm:mb-8 lg:mb-10">
                    <Link
                      href="/menu"
                      className="group relative inline-flex items-center justify-center w-[250px] sm:w-[270px] h-[84px] sm:h-[90px] hover:scale-[1.04] active:scale-[0.97] transition-transform duration-200"
                    >
                      <svg
                        viewBox="0 0 280 96"
                        className="absolute inset-0 w-full h-full drop-shadow-[0_10px_22px_rgba(0,0,0,0.22)] group-hover:brightness-110 transition-[filter] duration-200"
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
                          fill={slide.h2BgColor}
                        />
                        <path
                          d="M30 50
                             C26 32 56 16 90 20
                             C120 12 152 24 184 16
                             C218 10 250 26 248 50
                             C250 72 218 84 184 78
                             C152 86 120 74 90 80
                             C56 88 28 70 30 50 Z"
                          fill={slide.h1BgColor}
                        />
                      </svg>
                      <span
                        className="relative z-10 flex items-center gap-2 font-bold text-[22px] sm:text-[24px] lg:text-[26px] -rotate-[2deg]"
                        style={{ color: contrastOn(slide.h1BgColor) }}
                      >
                        <IceCreamCone size={22} strokeWidth={2.4} className="shrink-0" />
                        اطلب الان
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* swiper nav buttons — sit beside the character on phones so they don't clip the titles */}
      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="الشريحة التالية"
        className="top-[34%] sm:top-1/2 left-1.5 sm:left-5 z-[9999] absolute flex justify-center items-center bg-white/50 hover:bg-white/65 rounded-full w-8 sm:w-9.5 h-8 sm:h-9.5 transition-colors -translate-y-1/2 duration-200 cursor-pointer"
      >
        <ChevronLeft size={16} strokeWidth={2.5} className="text-white" />
      </button>
      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="الشريحة السابقة"
        className="top-[34%] sm:top-1/2 right-1.5 sm:right-5 z-[9999] absolute flex justify-center items-center bg-white/50 hover:bg-white/65 rounded-full w-8 sm:w-9.5 h-8 sm:h-9.5 transition-colors -translate-y-1/2 duration-200 cursor-pointer"
      >
        <ChevronRight size={16} strokeWidth={2.5} className="text-white" />
      </button>

      <svg
        className="bottom-[-1px] left-0 z-[97] absolute w-full h-14 sm:h-16 pointer-events-none"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 32C240 72 480 8 720 36C960 64 1200 16 1440 40V80H0Z"
          fill={bgColor}
          style={{ transition: "fill 2s ease-in-out" }}
        />
      </svg>
    </div>
  );
}
