"use client";

import Image from "next/image";
import Link from "next/link";
import { logo, iceCreamImg1, iceCreamImg2, iceCreamImg3, iceCreamImg4 } from "@/assets/images";

export default function ComingSoonClientPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center py-10">

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,#2a8fad_0%,#1a6278_50%,#0f3f52_100%)]" />
      <div className="absolute top-[-15%] right-[-8%] w-[55vw] h-[55vw] max-w-150 max-h-150 rounded-full bg-[#51c9f4]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-8%] w-[55vw] h-[55vw] max-w-150 max-h-150 rounded-full bg-[#51c9f4]/15 blur-[100px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />

      {/* ── Floating ice creams ── */}
      <div className="pointer-events-none select-none absolute inset-0">
        <div className="absolute top-[6%] right-[3%] w-[12vw] min-w-20 max-w-40 opacity-45 splash-float-1">
          <Image src={iceCreamImg1} alt="" width={160} height={160} className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]" />
        </div>
        <div className="absolute top-[4%] left-[3%] w-[10vw] min-w-[70px] max-w-35 opacity-35 splash-float-3">
          <Image src={iceCreamImg2} alt="" width={140} height={140} className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]" />
        </div>
        <div className="absolute bottom-[5%] right-[3%] w-[10vw] min-w-[70px] max-w-35 opacity-35 splash-float-2">
          <Image src={iceCreamImg3} alt="" width={140} height={140} className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]" />
        </div>
        <div className="absolute bottom-[4%] left-[2%] w-[12vw] min-w-20 max-w-40 opacity-45 splash-float-1" style={{ animationDelay: "1.2s" }}>
          <Image src={iceCreamImg4} alt="" width={160} height={160} className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-160 px-6">

        {/* Logo */}
        <div className="mb-6 sm:mb-8">
          <Image
            src={logo}
            alt="جلاسيه الأمير"
            width={240}
            height={92}
            className="w-36 sm:w-52 md:w-64 object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.4)]"
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-glace-yellow/15 border border-glace-yellow/30 rounded-full px-5 py-1.5 mb-5 sm:mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-glace-yellow animate-pulse" />
          <span className="text-glace-yellow text-[12px] sm:text-[13px] font-semibold tracking-widest">قيد التطوير</span>
        </div>

        {/* Headline */}
        <h1 className="text-white font-bold text-[48px] sm:text-[64px] md:text-[76px] leading-[1.05] mb-4 sm:mb-5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          قريباً
        </h1>

        {/* Subtitle */}
        <p className="text-white/55 text-[14px] sm:text-[16px] md:text-[17px] leading-relaxed mb-10 sm:mb-12 max-w-100">
          نعمل على شيء رائع ومميز لكم
          <br />
          ترقبوا انطلاقنا قريباً
        </p>

        {/* Yellow rule */}
        <div className="w-20 h-0.5 rounded-full bg-linear-to-r from-transparent via-glace-yellow to-transparent mb-10 sm:mb-12 opacity-60" />

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1a5f74] font-bold text-[15px] sm:text-[16px] px-10 sm:px-12 py-3.5 sm:py-4 rounded-full transition-all duration-200 shadow-[0_6px_28px_rgba(244,228,81,0.4)] hover:shadow-[0_8px_36px_rgba(244,228,81,0.6)] hover:-translate-y-0.5 active:translate-y-0"
        >
          العودة للرئيسية
        </Link>

        {/* Footer note */}
        <p className="text-white/20 text-[11px] sm:text-[12px] mt-8 sm:mt-10 tracking-wide">
          © 2026 جلاسيه الأمير — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
