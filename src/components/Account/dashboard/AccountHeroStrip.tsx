"use client";

import { User, ShoppingBag, Wallet } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useWalletStore } from "@/store/walletStore";
import type { AuthUser } from "@/store/authStore";

interface Props {
  user: AuthUser | null;
  isLoading: boolean;
}

export default function AccountHeroStrip({ user, isLoading }: Props) {
  const orderCount = useOrderStore((s) => s.orders.length);
  const balance = useWalletStore((s) => s.balance);

  return (
    <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-5 flex sm:flex-row flex-col items-center gap-4 text-white">
      {/* Avatar */}
      <div className="flex items-center justify-center bg-white/20 rounded-full size-20 shrink-0">
        {isLoading
          ? <div className="bg-white/30 rounded-full size-10 animate-pulse" />
          : <User size={38} className="text-white" />}
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

      {/* Quick stat pills — hidden on base, shown on sm+ */}
      <div className="hidden sm:flex gap-3 shrink-0">
        <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-[15px]">
          <ShoppingBag size={16} className="text-glace-yellow" />
          <span>{orderCount} طلب</span>
        </div>
        <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-[15px]">
          <Wallet size={16} className="text-glace-yellow" />
          <span>{balance.toFixed(0)} ₪</span>
        </div>
      </div>
    </div>
  );
}
