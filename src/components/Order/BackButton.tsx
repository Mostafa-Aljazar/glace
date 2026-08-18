"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface BackButtonProps {
  onBeforeBack?: () => boolean;
  disabled?: boolean;
}

export default function BackButton({
  onBeforeBack,
  disabled = false,
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  const handleClick = () => {
    if (onBeforeBack) {
      if (!onBeforeBack()) {
        return;
      }
    } else if (disabled) {
      return;
    }

    router.back();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!onBeforeBack && disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-bold shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all ${
        disabled
          ? "cursor-not-allowed border-white/10 bg-white/10 text-white/35"
          : "cursor-pointer border-white/35 bg-[#165a6c] text-white hover:bg-[#1a6a80] hover:border-white/50"
      }`}
    >
      <ChevronRight size={16} />
      رجوع
    </button>
  );
}
