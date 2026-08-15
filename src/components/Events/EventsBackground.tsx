import Image from "next/image";
import { imgL } from "@/assets/images";
import HeaderWave from "@/components/Common/HeaderWave";

export default function EventsBackground() {
  return (
    <>
      <div className="z-0 absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <Image src={imgL} alt="" fill className="object-cover scale-300" />
      </div>
      <div className="absolute top-0 left-0 z-[80] w-full pointer-events-none">
        <HeaderWave fill="#51c9f48a" />
      </div>
    </>
  );
}
