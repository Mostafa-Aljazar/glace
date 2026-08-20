"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/store/favoritesStore";

export default function FloatingFavoritesButton() {
  const pathname = usePathname();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const favoriteCount = favoriteIds.length;

  // Hidden on the whole menu (listing + order pages) and on /favorites
  // itself so the shortcut never sits on top of its destination.
  if (pathname?.startsWith("/menu") || pathname === "/favorites") {
    return null;
  }

  return (
    <Link
      href="/favorites"
      className="hidden lg:flex fixed lg:bottom-8 lg:right-8 z-9999998 flex-col items-center gap-1 transition-all duration-200 active:scale-90 hover:scale-110"
      aria-label="عرض المفضلة"
    >
      <span
        className={`flex items-center justify-center w-[56px] h-[56px] rounded-full
          shadow-[0_10px_24px_rgba(0,0,0,0.28)]
          transition-all duration-200
          bg-gradient-to-br from-red-400 to-red-600 border border-white/20 hover:shadow-[0_12px_32px_rgba(239,68,68,0.4)]`}
      >
        <Heart
          size={24}
          strokeWidth={2}
          className="text-white fill-white"
        />
        {favoriteCount > 0 && (
          <span className="-top-2 -left-2 absolute flex justify-center items-center bg-glace-yellow px-1 border border-white/30 rounded-full min-w-[22px] h-[22px] font-black text-[#1a4a5a] text-[10px]">
            {favoriteCount > 99 ? "99+" : favoriteCount}
          </span>
        )}
      </span>
      <span className="text-[10px] font-medium leading-none text-white/70">
        المفضلة
      </span>
    </Link>
  );
}
