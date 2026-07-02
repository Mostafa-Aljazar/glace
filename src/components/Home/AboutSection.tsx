import Image from "next/image";
import Link from "next/link";
import { ppp, bgWA, imgBtn } from "@/assets/images";

export default function AboutSection({ bgColor = "#BEBB49" }: { bgColor?: string }) {
  return (
    <section
      id="about"
      className="relative min-h-[770px] lg:min-h-[730px] max-[1300px]:min-h-[700px] xl:min-h-[770px] overflow-hidden transition-[background-color] duration-2000 ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex lg:flex-row flex-col-reverse items-center gap-0 lg:gap-[30px] mx-auto py-5 max-lg:pb-[70px] w-[90%] max-w-[1600px]">
        {/* Character image */}
        <div className="mt-[47px] lg:mt-0 w-full lg:w-[40%]">
          <Image
            src={ppp}
            alt="جلاسيه الأمير"
            width={550}
            height={600}
            className="block mx-auto w-full max-w-85 md:max-w-107.5 lg:max-w-137.5 h-auto"
          />
        </div>

        {/* Text */}
        <div className="w-full lg:w-[60%] text-white">
          <div className="max-w-[700px]">
            <h1
              className="text-[#f4e451] text-[36px] md:text-[36px] lg:text-[45px] xl:text-[60px]"
              style={{ textShadow: "2px 2px #00000046" }}
            >
              موهوبون في صناعة الأيسكريم !
            </h1>
            <p className="text-[24px] md:text-[24px] lg:text-[26px]">
              تأسس جلاسيه الأمير عام 2015 كأحد أفرع شركة أسكمو الأمير التي تأسست
              على يد صاحبها السيد عماد الوادية عام 2000
            </p>
            <p className="text-[24px] md:text-[24px] lg:text-[26px]">
              تعمل الشركة على تقديم أجود أنواع الآيس كريم والبراد بالإضافة
              للعصائر والحلويات، ولديها خبرة طويلة في هذا المجال حيث تسعى الشركة
              دوماً على التطوير و تحسين الأداء للوصول الى خدمة ومنتج يرقى
              بزبائننا الكرام
            </p>
            <Link
              href="#"
              className="inline-block relative mt-5 cursor-pointer"
            >
              <Image
                src={imgBtn}
                alt=""
                width={250}
                className="top-1/2 left-1/2 z-0 absolute w-80 -translate-x-1/2 -translate-y-1/2"
              />
              <h2
                className="mb-0 px-[30px] text-[#f4e451] text-[30px]"
                style={{ textShadow: "1px 1px #00000071" }}
              >
                اعرف أكثر
              </h2>
            </Link>
          </div>
        </div>
      </div>

      {/* Wave background — covers the bottom of the section */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgWA.src}
        alt=""
        className="right-0 bottom-0 max-lg:bottom-[-10px] left-0 absolute w-full max-lg:object-contain"
      />
    </section>
  );
}
