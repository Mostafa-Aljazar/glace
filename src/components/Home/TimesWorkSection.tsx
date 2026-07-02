"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { imgTimesWorkSec, imgbgBS, imgpp, imgpp2 } from "@/assets/images";
import type { Branch } from "@/types";

const branches: Branch[] = [
  {
    id: "ramal",
    label: "فرع الرمال",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.134069155089!2d34.442460474075105!3d31.52047749458951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14fd7fa668193343%3A0x63812dcdb0e703ee!2zZ2xhY2UgZWxhbWVlciDYrNmE2KfYs9mK2Ycg2KfZhNij2YXZitixINmB2LHYuSDYp9mG2LHYuSDYp9mE2LHZhdan2YQ!5e0!3m2!1sar!2s!4v1692262174549!5m2!1sar!2s",
    address:
      "غزة، الرمال، شارع الشهداء، غرب شركة الإتصالات بالجهة المقابلة للطابون، شرقي بنده مول",
    phone: "0592 226 522",
    whatsapp: "0592 226 522",
    weekdayHours: "PM 11:45 – AM 10:00",
    fridayHours: "PM 11:45 – PM02:00",
    borderRadius: "32% 68% 69% 31% / 30% 28% 72% 70%",
  },
  {
    id: "nasr",
    label: "فرع النصر",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d802.3957364051882!2d34.46570501521984!3d31.539686489519603!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14fd7f5edd3f91d9%3A0xc83c9ac2a734d616!2zZ2xhY2UgZWxhbWVlciDYrNmE2KfYs9mK2Ycg2KfZhNij2YXZitixINmB2LHYuSDYp9mG2LYdtixg!5e0!3m2!1sar!2s!4v1692271440799!5m2!1sar!2s",
    address:
      "غزة، شارع النصر، مفترق الأمن العام، بجانب مكتبة عودة، بالقرب من الساب واي",
    phone: "0592226577",
    whatsapp: "00970592226577",
    weekdayHours: "PM 11:45 – AM 10:00",
    fridayHours: "PM 11:45 – PM02:00",
    borderRadius: "56% 44% 69% 31% / 70% 61% 39% 30%",
  },
  {
    id: "bahr",
    label: "فرع البحر",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13602.987559794487!2d34.46657431482985!3d31.531111026597035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14fd7ff1aaf9de67%3A0x7d0a7e3df1fa9c76!2z2KzZhNin2LPZitmHINin2YTYo9mF2YrYsSDZgdix2Lkg2KfZhNio2K3Ysigz2YTYoCBnbGFjZSBl bGFtZWVy!5e0!3m2!1sar!2s!4v1692271505959!5m2!1sar!2s",
    address:
      "غزة، كورنيش بحر غزة، دوار ال17، أول موقف لسيارات، منتجع السي سايد",
    phone: "0592229892",
    whatsapp: "00970592229892",
    weekdayHours: "PM 11:45 – AM 10:00",
    fridayHours: "PM 11:45 – PM02:00",
    borderRadius: "56% 44% 69% 31% / 53% 63% 37% 47%",
  },
];

export default function TimesWorkSection() {
  const [activeBranch, setActiveBranch] = useState("ramal");
  const branch = branches.find((b) => b.id === activeBranch)!;

  return (
    <section
      id="timesWork"
      className="relative -mt-[50px] lg:-mt-[50px] max-lg:mt-0 pt-52 lg:pt-52 max-lg:pt-25 pb-48 max-lg:pb-36 min-h-125 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle, rgba(136,103,91,1) 6%, rgba(83,53,42,1) 100%)",
      }}
    >
      {/* top wave decoration */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgTimesWorkSec.src}
        alt=""
        className="top-0 left-0 absolute w-full"
      />

      <div className="z-[1] relative mx-auto w-[90%] max-w-400">
        {/* Branch tabs */}
        <ul className="flex gap-4 m-0 mb-3 p-0 list-none">
          {branches.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => setActiveBranch(b.id)}
                className={`relative border-0 bg-transparent pb-1 transition-all duration-300
                  lg:text-[38px] sm:text-[30px] text-[25px]
                  ${activeBranch === b.id ? "text-white opacity-100" : "text-white opacity-50"}`}
              >
                {b.label}
                <span
                  className="top-1/2 left-1/2 z-[-1] absolute bg-cover bg-no-repeat w-[50px] h-[50px] transition-all -translate-x-1/2 -translate-y-1/2 duration-300"
                  style={{
                    backgroundImage:
                      activeBranch === b.id
                        ? "url(/images/checkImg.png)"
                        : "url(/images/checkImgB.png)",
                  }}
                />
              </button>
            </li>
          ))}
        </ul>

        {/* Title row */}
        <div className="relative">
          <h1 className="text-[38px] text-white sm:text-[45px] lg:text-[45px] xl:text-[55px]">
            ننتظركم في المواعيد التالية
          </h1>
          {/* imgpp2 — hidden on mobile per original */}
          <Image
            src={imgpp2}
            alt=""
            width={150}
            height={120}
            className="hidden lg:block top-[10px] right-1/2 absolute w-[150px] h-[120px] object-contain"
          />
        </div>

        {/* Content: text + map */}
        <div className="flex lg:flex-row flex-col justify-between items-start gap-5">
          {/* Hours & address — constrained width so text wraps */}
          <div className="w-full lg:max-w-[55%] text-white">
            <div className="flex gap-3.75 lg:gap-7.5 mb-4">
              <div>
                <p className="mb-0 text-[24px] sm:text-[25px] lg:text-[27px]">
                  من السبت وحتى الخميس
                </p>
                <p className="mb-0 text-[24px] sm:text-[25px] lg:text-[27px]">
                  {branch.weekdayHours}
                </p>
              </div>
              <div>
                <p className="mb-0 text-[24px] sm:text-[25px] lg:text-[27px]">
                  يوم الجمعة
                </p>
                <p className="mb-0 text-[24px] sm:text-[25px] lg:text-[27px]">
                  {branch.fridayHours}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-[5px] max-w-105">
              <MapPin size={20} className="mt-1 shrink-0" />
              <span className="text-[24px] lg:text-[30px] wrap-break-word">
                {branch.address}
              </span>
            </div>
            <div className="flex items-center gap-[5px]">
              <Phone size={20} className="shrink-0" />
              <span className="text-[24px] lg:text-[30px]">{branch.phone}</span>
            </div>
            <div className="flex items-center gap-[5px]">
              <MessageCircle size={20} className="shrink-0" />
              <span className="text-[24px] lg:text-[30px]">
                {branch.whatsapp}
              </span>
            </div>
          </div>

          {/* Map */}
          <div className="z-[1] relative mx-auto lg:mx-0 lg:ml-50 w-full lg:w-105 md:max-w-112.5 lg:max-w-none h-82.5 md:h-100 lg:h-96 shrink-0">
            <iframe
              src={branch.mapSrc}
              width="600"
              height="450"
              style={{
                border: 0,
                borderRadius: branch.borderRadius,
                boxShadow: "#43281e 8px 3px 0px",
                overflow: "hidden",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="bg-[#43281e] w-full h-full"
            />
            <Image
              src={imgpp}
              alt=""
              width={160}
              height={160}
              className="right-[30px] bottom-[20px] z-[-1] absolute w-[160px] h-[160px]"
            />
          </div>
        </div>
      </div>

      {/* bottom wave */}
      <Image
        src={imgbgBS}
        alt=""
        width={1920}
        height={200}
        className="bottom-[-20px] absolute w-full h-auto"
      />
    </section>
  );
}
