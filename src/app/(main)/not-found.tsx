import type { Metadata } from "next";
import Image from "next/image";
import LogoNav from "@/components/Common/LogoNav";
import { imgL, imgError404 } from "@/assets/images";

export const metadata: Metadata = {
  title: "404 | جلاسيه الأمير",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#51c9f4] relative overflow-x-hidden">
      {/* Background blob */}
      <div className="absolute top-0 right-0 w-[350px] h-full pointer-events-none z-0 max-[991px]:w-[200px] max-[700px]:w-[130px]">
        <Image src={imgL} alt="" fill className="object-contain object-top" />
      </div>

      <LogoNav />

      {/* Main content */}
      <div className="relative z-10 flex justify-center px-4 pt-[80px] pb-[50px]">
        <div className="w-[90%] max-w-[1017px]">
          <div className="flex items-center gap-[40px] max-[991px]:flex-col">

            {/* Right: text */}
            <div className="flex-1 text-white">
              <h2
                className="text-[70px] leading-[96%] max-[1400px]:text-[60px] max-[991px]:text-[50px] max-[500px]:text-[45px]"
              >
                عفوا هذه الصفحة غير متوفرة
              </h2>
            </div>

            {/* Left: error image */}
            <div className="flex-1 flex justify-center max-[991px]:w-full">
              <div className="relative w-full max-w-[450px] aspect-square">
                <Image src={imgError404} alt="404" fill className="object-contain" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
