import Image from "next/image";
import Link from "next/link";
import { imgbgI, imgBtn } from "@/assets/images";
import type { IHomeEventsData } from "@/types/home.types";

export default function EventsSection({
  eventsData,
}: {
  eventsData: IHomeEventsData;
}) {
  return (
    <section
      className="relative -mt-px pt-2.5 pb-4 lg:pb-0 min-h-125 overflow-hidden"
      style={{ backgroundColor: "#51c9f4" }}
    >
      <div className="mx-auto w-[90%] max-w-400">
        <div className="text-center">
          <h1 className="text-[38px] text-white md:text-[45px] lg:text-[60px]">
            {eventsData.title}
          </h1>

          <div className="mt-6 pb-8 md:pb-16 lg:pb-20">
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {eventsData.items.map((ev) => (
                <Link
                  key={ev.id}
                  href={ev.href}
                  className="group flex flex-col gap-2.5 mx-auto mb-3.75 max-w-[330px] no-underline"
                >
                  <div className="rounded-[20px] w-full h-[200px] overflow-hidden">
                    <Image
                      src={ev.image}
                      alt={ev.title}
                      width={330}
                      height={200}
                      className="rounded-[20px] w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3
                    className="overflow-hidden text-[25px] text-white lg:text-[28px] text-start"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {ev.title}
                  </h3>
                </Link>
              ))}
            </div>

            {/* Show more button */}
            <div className="z-[8] relative flex justify-center mt-5 mb-22 w-full">
              <Link
                href={eventsData.moreHref}
                className="relative flex justify-center items-center"
              >
                <Image
                  src={imgBtn}
                  alt=""
                  width={260}
                  className="top-1/2 left-1/2 absolute w-65 -translate-x-1/2 -translate-y-1/2"
                />
                <h2
                  className="relative mb-0 px-6 text-[36px] text-glace-yellow whitespace-nowrap"
                  style={{ textShadow: "1px 1px #00000071" }}
                >
                  {eventsData.moreLabel}
                </h2>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgbgI.src}
        alt=""
        className="-bottom-px left-0 absolute w-full"
      />
    </section>
  );
}
