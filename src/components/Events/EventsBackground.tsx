import Image from "next/image";
import { imgL } from "@/assets/images";

export default function EventsBackground() {
  return (
    <>
      {/* .imgS — background blob (static, no rotation) */}
      <div className="z-0 absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <Image src={imgL} alt="" fill className="object-cover scale-300" />
      </div>

      {/* .imageHeaderT */}
      <div
        className="imageHeaderT"
        style={{ left: "0", width: "100vw", maxWidth: "none", height: "100vh" }}
      />
    </>
  );
}
