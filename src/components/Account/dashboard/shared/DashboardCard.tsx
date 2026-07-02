"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({ title, icon: Icon, children, className }: Props) {
  return (
    <div className={cn("bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-6 text-white", className)}>
      {title && (
        <header className="flex items-center gap-2 mb-5">
          {Icon && <Icon size={22} className="text-glace-yellow shrink-0" />}
          <h2 className="text-[22px]">{title}</h2>
        </header>
      )}
      {children}
    </div>
  );
}
