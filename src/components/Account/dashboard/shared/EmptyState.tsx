"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  icon: LucideIcon;
  message: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export default function EmptyState({ icon: Icon, message, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-white/60">
      <Icon size={48} strokeWidth={1.2} />
      <p className="text-[18px] text-center">{message}</p>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button className="bg-white/20 hover:bg-white/30 border-0 rounded-[20px] text-white text-[16px] px-6 cursor-pointer">
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button
            onClick={action.onClick}
            className="bg-white/20 hover:bg-white/30 border-0 rounded-[20px] text-white text-[16px] px-6 cursor-pointer"
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
