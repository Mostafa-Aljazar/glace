"use client";

import Link from "next/link";
import { Check, ShoppingCart, X } from "lucide-react";

interface AddToCartToastProps {
  message: string | null;
  onClose: () => void;
}

export default function AddToCartToast({ message, onClose }: AddToCartToastProps) {
  if (!message) return null;

  return (
    <div className="top-24 lg:top-6 z-9999999 fixed inset-x-0 flex justify-center pointer-events-none">
      <div className="flex items-center gap-3 bg-[#1c8a4e]/95 shadow-2xl backdrop-blur-md mx-4 px-4 py-3 border border-white/15 rounded-2xl max-w-[calc(100%-2rem)] pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
        <span className="flex justify-center items-center bg-white/20 rounded-full w-8 h-8 shrink-0">
          <Check size={16} className="text-white" strokeWidth={3} />
        </span>

        <p className="font-medium text-[13px] text-white leading-tight">{message}</p>

        <Link
          href="/cart"
          className="flex items-center gap-1 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full font-bold text-[12px] text-white whitespace-nowrap transition-colors shrink-0"
        >
          <ShoppingCart size={12} />
          عرض السلة
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
