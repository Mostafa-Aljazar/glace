import Image from "next/image";
import { imgIesPP, imgIesC } from "@/assets/images";

export default function EventsHeader() {
  return (
    <>
      {/* .titleHeaderPage */}
      <div className="mx-auto w-62.5 sm:w-75 text-center">
        <h1 className="text-white text-4xl sm:text-5xl">
          الفعاليات و المناسبات
        </h1>
      </div>

      {/* .imgIesPP / .imgIesC — side decorations at mid-viewport height */}
      <Image
        src={imgIesPP}
        alt=""
        width={90}
        className="top-1/2 right-2.5 sm:right-7.5 lg:right-15 absolute w-10 sm:w-12.5 lg:w-15 pointer-events-none"
      />
      <Image
        src={imgIesC}
        alt=""
        width={110}
        className="top-1/2 left-2.5 sm:left-7.5 lg:left-15 absolute w-10 sm:w-12.5 lg:w-15 pointer-events-none"
      />
    </>
  );
}
