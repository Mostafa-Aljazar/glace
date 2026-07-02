"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { bgOrderD, iceImg1M, iceImg2M } from "@/assets/images";
import { useCartStore } from "@/store/cartStore";

export default function CartBar() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);

  if (items.length === 0) return null;

  return (
    <div className="lg:hidden z-[200] fixed bottom-[92px] left-0 rounded-[20px_20px_0_0] w-full shadow-[0_0_8px_rgba(0,0,0,0.19)]">
      <div className="relative flex items-center overflow-hidden h-[80px]">
        <Image src={bgOrderD} alt="" fill className="object-cover" />
        <Image
          src={iceImg1M}
          alt=""
          width={50}
          height={60}
          className="right-[10%] bottom-0 absolute z-[1] h-[60px] object-contain"
        />
        <Image
          src={iceImg2M}
          alt=""
          width={50}
          height={60}
          className="left-[10%] bottom-0 absolute z-[1] h-[60px] object-contain"
        />
        <div className="z-[2] relative flex justify-between items-center mx-auto w-[85%] max-w-[85%]">
          <div className="flex items-center gap-2 text-white">
            <ShoppingCart size={22} />
            <span className="text-[20px]">
              {items.length} {items.length === 1 ? "منتج" : "منتجات"}
            </span>
            <span className="flex justify-center items-center bg-white/30 rounded-full w-[28px] h-[28px] font-bold text-[16px]">
              {total().toFixed(0)}
            </span>
            <span className="text-[16px]">₪</span>
          </div>
          <Link
            href="/cart"
            className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-full text-white text-[20px] no-underline transition-colors"
          >
            عرض السلة
          </Link>
        </div>
      </div>
    </div>
  );
}
