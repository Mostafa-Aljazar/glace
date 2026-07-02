"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  iceCreamImg1,
  iceCreamImg2,
  iceCreamImg3,
  iceCreamImg4,
  logo,
} from "@/assets/images";

export default function LoadingPage() {
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHiding(true), 2600);
    const t2 = setTimeout(() => setGone(true), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999999] overflow-hidden transition-transform duration-[900ms] ease-in-out ${
        hiding ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Brand gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#4db8d8_0%,#2d8ba8_50%,#1e6a7f_100%)]" />

      {/* Soft glow blobs */}
      <div className="top-[-10%] left-[-10%] absolute bg-white/[.06] blur-[80px] rounded-full w-[60vw] h-[60vw] pointer-events-none" />
      <div className="right-[-10%] bottom-[-15%] absolute bg-[#f4e451]/[.07] blur-[100px] rounded-full w-[55vw] h-[55vw] pointer-events-none" />

      {/* Floating ice cream images */}
      <Image
        src={iceCreamImg1}
        alt=""
        width={90}
        height={90}
        className="top-[12%] right-[8%] splash-float-1 absolute opacity-60 w-16 sm:w-20 pointer-events-none select-none"
      />
      <Image
        src={iceCreamImg2}
        alt=""
        width={75}
        height={75}
        className="top-[20%] left-[7%] splash-float-2 absolute opacity-50 w-14 sm:w-18 pointer-events-none select-none"
      />
      <Image
        src={iceCreamImg3}
        alt=""
        width={80}
        height={80}
        className="right-[10%] bottom-[22%] splash-float-3 absolute opacity-55 w-14 sm:w-18 pointer-events-none select-none"
      />
      <Image
        src={iceCreamImg4}
        alt=""
        width={70}
        height={70}
        className="bottom-[18%] left-[9%] splash-float-1 absolute opacity-45 w-12 sm:w-16 pointer-events-none select-none"
      />

      {/* Center content */}
      <div className="z-10 relative flex flex-col justify-center items-center gap-6 px-6 h-full text-center">
        {/* Pulse ring behind logo */}
        <div className="relative flex justify-center items-center">
          <div className="absolute border-2 border-white/25 rounded-full splash-ring w-28 h-28" />
          <div
            className="absolute border-2 border-white/15 rounded-full splash-ring w-28 h-28"
            style={{ animationDelay: "0.5s" }}
          />

          {/* Logo images */}
          <div className="relative flex flex-col items-center gap-3 splash-logo">
            <Image
              src={logo}
              alt="جلاسيه الأمير"
              width={320}
              height={120}
              className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] w-36 sm:w-52 md:w-64 lg:w-72 object-contain"
            />
          </div>
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center gap-1.5 splash-text">
          <h1 className="drop-shadow-md font-bold text-[28px] text-white sm:text-[36px] tracking-wide">
            جلاسيه الأمير
          </h1>
          <p className="text-[14px] text-white/60 sm:text-[16px] tracking-widest splash-sub">
            أفضل البوظة والمثلجات
          </p>
        </div>

        {/* Yellow accent line */}
        <div className="bg-[#f4e451] opacity-80 rounded-full w-10 h-[3px] splash-text" />

        {/* Progress bar */}
        <div className="bg-white/15 rounded-full w-[180px] sm:w-[240px] h-[3px] overflow-hidden">
          <div className="bg-[#f4e451] rounded-full h-full splash-bar" />
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="bg-white/40 rounded-full size-1.5"
              style={{
                animation: `splash-float-2 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
