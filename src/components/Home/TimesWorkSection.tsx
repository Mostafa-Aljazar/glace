"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { imgTimesWorkSec, imgbgBS, imgpp, imgpp2 } from "@/assets/images";
import type { IHomeBranchesData } from "@/types/home.types";

function contactDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Palestinian/local display numbers → `tel:` href for one-tap calling. */
function toTelHref(phone: string): string {
  const digits = contactDigits(phone);
  if (!digits) return "#";
  if (digits.startsWith("00")) return `tel:+${digits.slice(2)}`;
  if (digits.startsWith("970")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+970${digits.slice(1)}`;
  return `tel:+${digits}`;
}

/** WhatsApp display numbers → `wa.me` chat link. */
function toWhatsAppHref(whatsapp: string): string {
  const digits = contactDigits(whatsapp);
  if (!digits) return "#";
  let num = digits;
  if (num.startsWith("00")) num = num.slice(2);
  else if (num.startsWith("0")) num = `970${num.slice(1)}`;
  return `https://wa.me/${num}`;
}

/** Compact type scale for branch info cards. */
const sectionTitle =
  "text-[22px] sm:text-[28px] lg:text-[32px] text-white leading-snug";
const branchTab =
  "font-bold text-[14px] sm:text-[15px] lg:text-[16px] leading-tight";
const cardLabel =
  "text-[13px] sm:text-[14px] text-white/75 leading-snug";
const cardValue =
  "text-[15px] sm:text-[16px] font-bold leading-snug";
const cardAddress =
  "text-[15px] sm:text-[16px] leading-relaxed";

function BranchWave({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 176 58"
      className={`absolute inset-0 w-full h-full transition-[filter,opacity] duration-300 ${
        active
          ? "opacity-100 drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)]"
          : "opacity-90"
      }`}
      aria-hidden
      preserveAspectRatio="none"
    >
      {active ? (
        <>
          <path
            d="M18 30 C14 14 38 4 62 8 C86 2 108 14 132 7 C154 2 170 14 168 30 C170 46 152 54 128 50 C104 56 84 46 62 52 C38 56 16 46 18 30 Z"
            fill="#e4c43a"
          />
          <path
            d="M22 30 C20 16 42 8 64 11 C86 6 108 16 130 10 C150 6 164 16 162 30 C164 44 148 50 128 47 C106 52 86 44 64 49 C42 52 22 44 22 30 Z"
            fill="#f4e451"
          />
        </>
      ) : (
        <path
          d="M18 30 C14 14 38 4 62 8 C86 2 108 14 132 7 C154 2 170 14 168 30 C170 46 152 54 128 50 C104 56 84 46 62 52 C38 56 16 46 18 30 Z"
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

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
      id="location"
      className="z-[2] relative max-lg:mt-0 lg:-mt-[50px] pt-36 lg:pt-52 max-lg:pt-28 pb-28 max-lg:pb-36 min-h-125 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle, rgba(136,103,91,1) 6%, rgba(83,53,42,1) 100%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgTimesWorkSec.src}
        alt=""
        className="top-0 left-0 absolute w-full pointer-events-none select-none"
      />

      <div className="z-[1] relative mx-auto w-[90%] max-w-400">
        <ul className="flex items-center gap-2 sm:gap-3 m-0 mb-5 p-0 list-none">
          {branches.map((b) => {
            const active = activeBranch === b.id;
            return (
              <li key={b.id} className="flex-1 min-w-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setActiveBranch(b.id)}
                  className={`relative inline-flex items-center justify-center border-0 bg-transparent w-full sm:w-[158px] lg:w-[180px] h-[44px] sm:h-[52px] lg:h-[58px] cursor-pointer transition-transform duration-200 ${
                    active ? "scale-[1.06] z-[1]" : "hover:scale-[1.03]"
                  }`}
                >
                  <BranchWave active={active} />
                  <span
                    className={`relative z-10 whitespace-nowrap ${branchTab} ${
                      active ? "text-[#3a2a18]" : "text-white/90"
                    }`}
                  >
                    {b.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="relative mb-5">
          <h1 className={sectionTitle}>{branchesData.title}</h1>
          <Image
            src={imgpp2}
            alt=""
            width={150}
            height={120}
            className="hidden lg:block top-[10px] right-1/2 absolute w-[150px] h-[120px] object-contain"
          />
        </div>

        <div className="flex lg:flex-row flex-col justify-between items-stretch gap-6">
          <div className="flex flex-col gap-4 w-full lg:max-w-[55%] text-white">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-2xl px-3.5 py-3">
                <p className={`mb-1.5 ${cardLabel}`}>من السبت وحتى الخميس</p>
                <p className={`mb-0 ${cardValue}`}>{branch.weekdayHours}</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-3.5 py-3">
                <p className={`mb-1.5 ${cardLabel}`}>يوم الجمعة</p>
                <p className={`mb-0 ${cardValue}`}>{branch.fridayHours}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 bg-white/10 rounded-2xl px-3.5 py-3.5">
              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="mt-0.5 shrink-0 text-glace-yellow" />
                <span className={cardAddress}>{branch.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={18} className="shrink-0 text-glace-yellow" />
                <a
                  href={toTelHref(branch.phone)}
                  dir="ltr"
                  className={`${cardValue} tabular-nums underline-offset-2 hover:text-glace-yellow hover:underline transition-colors`}
                >
                  {branch.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle size={18} className="shrink-0 text-glace-yellow" />
                <a
                  href={toWhatsAppHref(branch.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className={`${cardValue} tabular-nums underline-offset-2 hover:text-glace-yellow hover:underline transition-colors`}
                >
                  {branch.whatsapp}
                </a>
              </div>
            </div>
          </div>

          <div className="z-[1] relative mx-auto lg:mx-0 lg:ml-50 w-full lg:w-105 md:max-w-112.5 lg:max-w-none h-72 sm:h-82.5 md:h-100 lg:h-96 shrink-0">
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

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgbgBS.src}
        alt=""
        className="-bottom-px left-0 z-[5] absolute brightness-0 invert w-full h-auto pointer-events-none select-none"
      />
    </section>
  );
}
