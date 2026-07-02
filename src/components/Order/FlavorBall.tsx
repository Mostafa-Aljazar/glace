"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { Flavor } from "@/data/OrderData";

interface FlavorBallProps {
  flavor: Flavor;
  count: number;
  isFull: boolean;
  onAdd: () => void;
  onRemove: (e: React.MouseEvent) => void;
}

export default function FlavorBall({
  flavor,
  count,
  isFull,
  onAdd,
  onRemove,
}: FlavorBallProps) {
  const unavailable = flavor.available === false;
  const dimmed = !unavailable && isFull && count === 0;

  return (
    <div
      className={`flex flex-col items-center gap-1 ${unavailable ? "cursor-not-allowed" : dimmed ? "opacity-35 cursor-default" : "cursor-pointer"}`}
      onClick={() => {
        if (!unavailable && !isFull) onAdd();
      }}
    >
      <div
        className={`relative transition-all duration-150 ${count > 0 ? "ring-2 ring-glace-yellow scale-110 rounded-full" : !unavailable && !isFull ? "hover:scale-105" : ""}`}
      >
        {/* Remove / count badges */}
        {count > 0 && (
          <>
            <button
              type="button"
              onClick={onRemove}
              className="-top-1 -right-1 z-30 absolute flex justify-center items-center bg-red-500 p-0 border-0 rounded-full w-5 h-5 text-white cursor-pointer"
            >
              <X size={10} />
            </button>
            <div className="-top-2 -left-2 z-30 absolute flex justify-center items-center bg-glace-yellow px-1 rounded-full min-w-5 h-5 font-bold text-[#1e6a7f] text-[10px]">
              +{count}
            </div>
          </>
        )}

        <Image
          src={flavor.image}
          alt={flavor.name}
          width={52}
          height={52}
          className={`w-13 h-13 object-contain ${unavailable ? "opacity-30" : ""}`}
        />

        {/* "غير متوفر" badge — bottom of the ball */}
        {unavailable && (
          <div className="bottom-0 z-20 absolute inset-x-0 flex justify-center">
            <span className="bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full font-bold text-[8px] text-white whitespace-nowrap">
              غير متوفر
            </span>
          </div>
        )}
      </div>

      <span
        className={`text-[12px] text-center leading-tight ${count > 0 ? "text-glace-yellow font-semibold" : unavailable ? "text-white/40" : "text-white/75"}`}
      >
        {flavor.name}
      </span>
    </div>
  );
}
