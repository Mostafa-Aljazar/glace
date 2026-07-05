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
    <div className="z-90 relative mx-auto px-4 pt-3 max-w-300">
      <button
        type="button"
        onClick={handleClick}
        disabled={!onBeforeBack && disabled}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-medium transition-all ${disabled ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35" : "cursor-pointer border-white/15 bg-white/10 text-white/70 hover:border-white/30 hover:bg-white/20 hover:text-white"}`}
      >
        <ChevronRight size={16} />
        رجوع
      </button>
    </div>
  );
}
