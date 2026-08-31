"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/auth/useLogout";
import DashboardCard from "../shared/DashboardCard";

export default function SecurityPanel() {
  const logout = useLogout();

  return (
    <div className="flex flex-col gap-6">
      {/* Danger zone */}
      <DashboardCard>
        <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
          <div>
            <p className="text-white text-[18px] font-bold">تسجيل الخروج</p>
            <p className="text-white/60 text-[14px] mt-1">تسجيل الخروج من حسابك على جميع الأجهزة</p>
          </div>
          <Button
            type="button"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
            className="flex items-center gap-2 bg-red-500/30 hover:bg-red-500/50 border border-red-400/50 rounded-[20px] text-white text-[17px] h-auto py-3 px-6 cursor-pointer disabled:opacity-60 shrink-0"
          >
            <LogOut size={18} />
            {logout.isPending ? "جاري الخروج..." : "تسجيل الخروج"}
          </Button>
        </div>
      </DashboardCard>
    </div>
  );
}
