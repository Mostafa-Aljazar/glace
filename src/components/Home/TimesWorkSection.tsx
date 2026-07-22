"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { imgTimesWorkSec, imgbgBS, imgpp, imgpp2 } from "@/assets/images";
import type { IHomeBranchesData } from "@/types/home.types";

export default function TimesWorkSection({
  branchesData,
}: {
  branchesData: IHomeBranchesData;
}) {
  const branches = branchesData.branches;
  const [activeBranch, setActiveBranch] = useState(branches[0]?.id ?? "ramal");
  const branch = branches.find((b) => b.id === activeBranch) ?? branches[0];
  if (!branch) return null;

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
            {branchesData.title}
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
