import Link from "next/link";
import Image from "next/image";
import { bgWA } from "@/assets/images";
import { resolveHomeImageSrc, type IHomeAboutData } from "@/types/home.types";

export default function AboutSection({
  bgColor = "#BEBB49",
  about,
}: {
  bgColor?: string;
  about: IHomeAboutData;
}) {
  return (
    <section
      id="about"
      className="z-[2] relative min-h-0 lg:min-h-[730px] xl:min-h-[770px] overflow-hidden transition-[background-color] duration-2000 ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex lg:flex-row flex-col-reverse items-center gap-0 lg:gap-[30px] mx-auto lg:py-5 pt-8 pb-28 max-lg:pb-32 w-[90%] max-w-[1600px]">
        {/* Character image — desktop only; on mobile the striped circle dominates the section */}
        <div className="hidden lg:block mt-0 w-full lg:w-[40%]">
          <Image
            src={resolveHomeImageSrc(about.image)}
            alt="جلاسيه الأمير"
            width={550}
            height={600}
            className="block mx-auto w-full max-w-137.5 h-auto"
          />
        </div>

        {/* Text */}
        <div className="z-10 relative w-full lg:w-[60%] text-white">
          <div className="max-w-[700px]">
            <h1
              className="mb-5 text-[#f4e451] text-[24px] md:text-[30px] lg:text-[36px] leading-snug"
              style={{ textShadow: "2px 2px #00000046" }}
            >
              {about.title}
            </h1>
            {about.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 24)}
                className="mb-3 text-[20px] md:text-[24px] lg:text-[26px] text-justify"
              >
                {paragraph}
              </p>
            ))}
            <Link
              href={about.ctaHref}
              className="group inline-flex relative justify-center items-center mt-8 w-[210px] sm:w-[230px] h-[72px] hover:scale-[1.04] active:scale-[0.97] transition-transform duration-200"
            >
              <svg
                viewBox="0 0 280 96"
                className="absolute inset-0 drop-shadow-[0_8px_18px_rgba(0,0,0,0.2)] group-hover:brightness-110 w-full h-full transition-[filter] duration-200"
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
                  fill="rgba(255,255,255,0.88)"
                />
                <path
                  d="M30 50
                     C26 32 56 16 90 20
                     C120 12 152 24 184 16
                     C218 10 250 26 248 50
                     C250 72 218 84 184 78
                     C152 86 120 74 90 80
                     C56 88 28 70 30 50 Z"
                  fill="#f4e451"
                />
              </svg>
              <span className="z-10 relative font-bold text-[#1a4a5a] text-[20px] sm:text-[22px] -rotate-[2deg]">
                {about.ctaLabel}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Wave — crop the PNG's bottom hairline, then a white strip hides the seam */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgWA.src}
        alt=""
        className="right-0 bottom-0 left-0 z-[6] absolute w-full h-auto object-bottom object-cover pointer-events-none select-none [clip-path:inset(0_0_4px_0)]"
      />
      <div
        aria-hidden
        className="right-0 bottom-0 left-0 z-[7] absolute bg-white h-2 pointer-events-none"
      />
    </section>
  );
}
