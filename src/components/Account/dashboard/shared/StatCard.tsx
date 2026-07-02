"use client";

import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sub?: string;
}

export default function StatCard({ label, value, icon: Icon, sub }: Props) {
  return (
    <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[24px] p-5 flex items-center gap-4 text-white">
      <div className="flex items-center justify-center bg-glace-yellow/20 rounded-full size-14 shrink-0">
        <Icon size={26} className="text-glace-yellow" />
      </div>
      <div className="flex flex-col">
        <span className="text-[28px] font-bold leading-tight">{value}</span>
        <span className="text-white/70 text-[15px]">{label}</span>
        {sub && <span className="text-white/50 text-[13px]">{sub}</span>}
      </div>
    </div>
  );
}
