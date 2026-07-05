"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useCallback } from "react";
import { useHeroSlides } from "@/hooks/home/useHeroSlides";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";

import {
  imgL,
  happinessExpertsImg,
  ii1,
  ii5,
  man3,
  ii6,
  ii8,
  man5,
  pieceIceImg,
  pieceIceImg2,
  pieceIceImg3,
  pieceIceImg4,
  pieceIceImg5,
  pieceIceImg6,
  zigzagsImg,
  zigzagsImgSvg,
  squarePointsImg,
  wrigglingArrow,
  imgBtn,
  strawberryImg,
  iceImg1,
  iceImg2,
  iceC,
  sunImg,
} from "@/assets/images";
import type { SlideData } from "@/types/home.types";

const slides: SlideData[] = [
  {
    manImg: ii1,
    pieceImg: pieceIceImg,
    zigzagsImg: zigzagsImg,
    titleH1: "جلاسية الأمير",
    titleH2: "لإنتاج الآيس كريم و البراد و العصائر و الحلويات",
    bgColor: "#51C9F4",
    headerBgColor: "#51c9f4",
    h1BgColor: "#53352a",
    h2BgColor: "#51c9f4",
  },
  {
    manImg: ii5,
    pieceImg: pieceIceImg2,
    zigzagsImg: zigzagsImg,
    titleH1: "رحلة لذيذة",
    titleH2: "عالم من النكهات المبهجة والمتعة العالية",
    bgColor: "#3FBD59",
    headerBgColor: "#3FBD598a",
    h1BgColor: "#01580F",
    h2BgColor: "#01A41B",
  },
  {
    manImg: man3,
    pieceImg: pieceIceImg3,
    zigzagsImg: zigzagsImg,
    titleH1: "يومك منعش",
    titleH2: "لا شيء يضاهي البهجة مع المثلجات في يوم حار",
    bgColor: "#BEBB49",
    headerBgColor: "#BEBB498a",
    h1BgColor: "#F3900E",
    h2BgColor: "#F47251",
  },
  {
    manImg: ii6,
    pieceImg: pieceIceImg4,
    zigzagsImg: zigzagsImgSvg,
    titleH1: "بوظة شهية",
    titleH2: "بوظة لذيذة، استمتع بالانتعاش في كل لقمة",
    bgColor: "#DA51F4",
    headerBgColor: "#DA51F48a",
    h1BgColor: "#A506C4",
    h2BgColor: "#E883FB",
  },
  {
    manImg: ii8,
    pieceImg: pieceIceImg5,
    zigzagsImg: zigzagsImgSvg,
    titleH1: "تذوق واستمتع",
    titleH2: "استمتع باللحظة مع بوظة جلاسيه الأمير",
    bgColor: "#FF9900",
    headerBgColor: "#FF99008a",
    h1BgColor: "#005C5D",
    h2BgColor: "#F2A634",
  },
  {
    manImg: man5,
    pieceImg: pieceIceImg6,
    zigzagsImg: zigzagsImgSvg,
    titleH1: "كافئ نفسك",
    titleH2: "استرخ وتمتع بنكهات شهية ومنعشة",
    bgColor: "#6C5950",
    headerBgColor: "#6C59508a",
    h1BgColor: "#A66A2E",
    h2BgColor: "#F0C648",
  },
];

interface HeroSectionProps {
  onColorChange?: (color: string) => void;
}

export default function HeroSection({ onColorChange }: HeroSectionProps) {
  const iceCRef = useRef<HTMLImageElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const headerTRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(0);
  const rotationDegreeRef = useRef(0);
  const rotationDegreeIceRef = useRef(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const { data: slidesData = slides } = useHeroSlides();

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
    [onColorChange],
  );

  return (
    <div className="relative bg-[radial-gradient(circle,rgba(0,0,0,0.14)_48%,rgba(0,0,0,0.44)_96%)] h-screen overflow-hidden">
      {/* .imgS — rotating background blob */}
      <div className="z-[80] absolute inset-0 w-full h-screen overflow-hidden">
        <img
          ref={bgImgRef}
          src={imgL.src}
          alt=""
          className="top-0 left-0 absolute w-full h-screen object-cover transition-[transform] duration-[3000ms] ease-linear"
          style={{ transform: "scale(3)" }}
        />
      </div>

      {/* .imageHeaderT */}
      <div
        ref={headerTRef}
        className="imageHeaderT"
        style={{ left: "0", width: "100vw", maxWidth: "none" }}
      />

      {/* .iceC — desktop only */}
      <img
        ref={iceCRef}
        src={iceC.src}
        alt=""
        className="hidden lg:block bottom-0 left-0 z-[98] absolute w-full 2xl:max-w-[1100px] xl:max-w-[900px] transition-[transform] duration-[1400ms] ease-in-out"
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
          {slidesData.map((slide: SlideData, i: number) => (
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

                  {/* zigzags */}
                  <Image
                    src={slide.zigzagsImg}
                    alt=""
                    width={230}
                    height={40}
                    className="mt-[10px] mr-1 sm:-mr-[50px] w-[140px] lg:w-[230px] h-[15px] lg:h-[25px] object-contain"
                  />

                  {/* piece ice */}
                  <Image
                    src={slide.pieceImg}
                    alt=""
                    width={155}
                    height={155}
                    className="right-[-10px] sm:right-[-79px] md:right-[-123px] lg:right-[-230px] 2xl:right-[-230px] absolute w-[75px] sm:w-[80px] md:w-[85px] lg:w-[120px] 2xl:w-[130px] h-[75px] sm:h-[80px] md:h-[85px] lg:h-[120px] 2xl:h-[130px] object-contain hover:scale-105 transition-transform translate-y-[39px] sm:-translate-y-[10px] md:-translate-y-[25px] lg:-translate-y-[50px] 2xl:-translate-y-[25px] duration-[1500ms]"
                  />

                  {/* square points */}
                  <Image
                    src={squarePointsImg}
                    alt=""
                    width={85}
                    height={85}
                    className="flex mt-[5px] mr-auto ml-[10px] sm:-ml-[20px] w-[50px] lg:w-[80px] 2xl:w-[85px] h-[50px] lg:h-[80px] 2xl:h-[85px] object-contain"
                    style={{
                      animation: "rotateS 45s normal linear infinite",
                    }}
                  />

                  {/* wriggling arrow */}
                  <Image
                    src={wrigglingArrow}
                    alt=""
                    width={100}
                    height={140}
                    className="top-[291px] sm:top-[287px] lg:top-[200px] left-1/2 absolute h-[140px] sm:h-[189px] lg:h-[400px] 2xl:h-[250px] -rotate-[15deg] sm:-rotate-[30deg] -translate-x-1/2"
                  />

                  {/* browse menu button */}
                  <Link href="/menu">
                    <div className="bottom-[-150px] md:bottom-[-110px] lg:bottom-[-70px] absolute w-max -translate-x-[-50px] md:translate-x-[180px] lg:translate-x-[130px]">
                      <div className="relative flex justify-center items-center w-[250px] lg:w-[240px] 2xl:w-[280px] h-[70px] sm:h-[75px] lg:h-[90px] 2xl:h-[105px]">
                        <Image
                          src={imgBtn}
                          alt=""
                          fill
                          className="object-fill"
                        />
                        <h2
                          className="z-10 relative mb-0 text-[#f4e451] text-[30px] lg:text-[34px] 2xl:text-[38px]"
                          style={{ textShadow: "1px 1px #00000071" }}
                        >
                          اطلب الان
                        </h2>
                      </div>
                    </div>
                  </Link>

                  {/* strawberry */}
                  <Image
                    src={strawberryImg}
                    alt=""
                    width={50}
                    height={50}
                    className="bottom-[10px] sm:bottom-0 2xl:bottom-[10px] left-[56%] sm:left-[70%] 2xl:left-[75%] absolute w-[27px] sm:w-[30px] md:w-[35px] 2xl:w-[40px]"
                  />

                  {/* ice decoration 1 */}
                  <Image
                    src={iceImg1}
                    alt=""
                    width={70}
                    height={70}
                    className="bottom-[-84px] lg:bottom-[-60px] left-[-4px] lg:left-[-138px] absolute w-[32px] lg:w-[54px] 2xl:w-[60px]"
                    style={{
                      animation: "rotateU 15s normal linear infinite",
                    }}
                  />

                  {/* ice decoration 2 */}
                  <Image
                    src={iceImg2}
                    alt=""
                    width={110}
                    height={110}
                    className="hidden sm:block top-[171px] lg:top-[140px] 2xl:top-[220px] xl:top-[180px] right-[-125px] lg:right-[-250px] 2xl:right-[-290px] xl:right-[-250px] sm:absolute w-[55px] lg:w-[70px] 2xl:w-[85px] xl:w-[75px]"
                    style={{
                      animation: "rotateU 15s normal linear infinite",
                    }}
                  />
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
