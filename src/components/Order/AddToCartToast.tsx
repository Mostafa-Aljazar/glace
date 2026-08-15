"use client";

import Link from "next/link";
import { Check, ShoppingCart, X } from "lucide-react";

interface AddToCartToastProps {
  message: string | null;
  onClose: () => void;
}

function toastDetail(message: string) {
  return message
    .replace(/^تمت إضافة\s*/, "")
    .replace(/\s*إلى السلة\s*$/, "")
    .trim();
}

export default function AddToCartToast({ message, onClose }: AddToCartToastProps) {
  if (!message) return null;

  const detail = toastDetail(message);

  return (
    <div className="top-24 lg:top-6 z-9999999 fixed inset-x-0 flex justify-center px-3 pointer-events-none">
      <div className="flex items-center gap-3 bg-[#15803d] shadow-[0_12px_32px_rgba(0,0,0,0.28)] mx-auto px-3.5 py-3 border border-white/20 rounded-[22px] w-full max-w-md pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-300">
        <span className="flex justify-center items-center bg-white/25 rounded-full w-10 h-10 shrink-0">
          <Check size={18} className="text-white" strokeWidth={3} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] sm:text-[15px] text-white leading-tight">
            تمت الإضافة
          </p>
          {detail && (
            <p className="mt-0.5 text-[12px] sm:text-[13px] text-white/80 line-clamp-2 leading-snug">
              {detail}
            </p>
          )}
        </div>

        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 bg-glace-yellow hover:brightness-105 px-3 py-2 rounded-full font-bold text-[12px] sm:text-[13px] text-[#1a4a5a] whitespace-nowrap shrink-0 transition-all"
        >
          <ShoppingCart size={13} />
          عرض السلة
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="flex justify-center items-center hover:bg-white/15 rounded-full w-8 h-8 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
