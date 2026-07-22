import Image from "next/image";
import Link from "next/link";
import type { IHomeWhyGlaceData } from "@/types/home.types";

export default function WhyGlaceSection({
  whyGlace,
}: {
  whyGlace: IHomeWhyGlaceData;
}) {
  return (
    <section className="relative bg-white -mt-20 lg:-mt-20 max-lg:mt-0 min-h-125">
      <div className="flex lg:flex-row flex-col justify-between items-center gap-[30px] mx-auto py-5 lg:py-12 w-[90%] max-w-400">
        {/* Text side */}
        <div className="w-full lg:w-1/2">
          <h1 className="mb-0 text-[#53352a] text-[38px] sm:text-[45px] lg:text-[45px] xl:text-[55px]">
            {whyGlace.title}
          </h1>
          <p className="text-[25px] text-black/65 sm:text-[25px] lg:text-[30px]">
            {whyGlace.description}
          </p>

          {/* Features 2-column grid */}
          <div className="gap-x-8 gap-y-0 grid grid-cols-2 max-lg:mx-auto mt-5 max-w-117.5">
            {whyGlace.features.map((f) => (
              <div
                key={f.label}
                className="relative flex justify-center items-center bg-transparent mb-2.5 border-0 w-full h-17.5 max-lg:h-13.75"
              >
                <Image
                  src={f.image}
                  alt=""
                  fill
                  className="opacity-80 object-fill rotate-[-5deg]"
                />
                <h2 className="z-10 relative mb-0 text-[28px] text-white sm:text-[30px] lg:text-[40px]">
                  {f.label}
                </h2>
              </div>
            ))}
          </div>
        </div>

        {/* Video/image side */}
        <div className="flex max-lg:justify-center w-full lg:w-1/2">
          <Link
            href={whyGlace.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lg:mx-auto"
          >
            <Image
              src={whyGlace.videoThumbnail}
              alt="فيديو جلاسيه"
              width={650}
              height={650}
              className="z-[2] mx-auto w-full max-w-100 sm:max-w-125 lg:max-w-162.5 h-auto object-contain"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
