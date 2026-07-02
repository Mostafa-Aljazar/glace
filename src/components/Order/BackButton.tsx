"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <div className="relative z-90 px-4 pt-3 max-w-300 mx-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-full px-4 py-2 text-[14px] font-medium transition-all cursor-pointer"
      >
        <ChevronRight size={16} />
        رجوع
      </button>
    </div>
  );
}
