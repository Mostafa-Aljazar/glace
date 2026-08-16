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
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1a5f74] font-bold text-[15px] sm:text-[16px] px-10 sm:px-12 py-3.5 sm:py-4 rounded-full transition-all duration-200 shadow-[0_6px_28px_rgba(244,228,81,0.4)] hover:shadow-[0_8px_36px_rgba(244,228,81,0.6)] hover:-translate-y-0.5 active:translate-y-0"
          >
            العودة للرئيسية
          </Link>

          <Link
            href="https://wa.me/972592226522"
            target="_blank"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white font-bold text-[15px] sm:text-[16px] px-8 sm:px-10 py-3.5 sm:py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.551 4.103 1.515 5.83L0 24l6.335-1.654A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.893 0-3.673-.513-5.201-1.407L3.6 21.6l1.04-3.107A9.956 9.956 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
            </svg>
            تواصل عبر واتساب
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-white/20 text-[11px] sm:text-[12px] mt-8 sm:mt-10 tracking-wide">
          © 2026 جلاسيه الأمير — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
