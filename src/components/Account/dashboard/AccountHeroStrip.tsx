"use client";

import { User } from "lucide-react";
import type { AuthUser } from "@/store/authStore";

interface Props {
  user: AuthUser | null;
  isLoading: boolean;
}

/** First letter of each of the first two words, e.g. "Mostafa Ibrahim" -> "MI". */
function initialsFrom(name: string | undefined): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function AccountHeroStrip({ user, isLoading }: Props) {
  const initials = initialsFrom(user?.name);

  return (
    <div className="bg-white/[.17] backdrop-blur-[15px] border border-glace-yellow/40 rounded-[30px] p-5 flex sm:flex-row flex-col items-center gap-4 text-white">
      {/* Avatar — initials on a yellow disc when a name is known, generic icon otherwise */}
      <div
        className={`flex items-center justify-center rounded-full size-20 shrink-0 ${
          !isLoading && initials ? "bg-glace-yellow text-[#1e6a7f]" : "bg-white/20 text-white"
        }`}
      >
        {isLoading ? (
          <div className="bg-white/30 rounded-full size-10 animate-pulse" />
        ) : initials ? (
          <span className="font-bold text-[26px]">{initials}</span>
        ) : (
          <User size={38} />
        )}
      </div>

      {/* Name + email */}
      <div className="flex-1 sm:text-right text-center">
        {isLoading ? (
          <div className="flex flex-col sm:items-end items-center gap-2">
            <div className="bg-white/30 rounded-full w-36 h-6 animate-pulse" />
            <div className="bg-white/20 rounded-full w-48 h-4 animate-pulse" />
          </div>
        ) : (
          <>
            <p className="font-bold text-[22px] leading-tight">{user?.name ?? "—"}</p>
            <p className="text-white/70 text-[15px]">{user?.email}</p>
            {user?.phone && <p className="text-white/50 text-[14px]">{user.phone}</p>}
          </>
        )}
      </div>
    </div>
  );
}
