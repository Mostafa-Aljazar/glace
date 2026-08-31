"use client";

import Link from "next/link";
import {
  Settings,
  ShoppingBag,
  Wallet,
  UserCircle,
  Shield,
  MapPin,
  Phone,
  FileText,
  Lock,
  HelpCircle,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { useLogout } from "@/hooks/auth/useLogout";
import DashboardCard from "../shared/DashboardCard";

const LINKS = [
  { href: "/my-account/orders",    label: "طلباتي",            icon: ShoppingBag },
  { href: "/my-account/wallet",    label: "محفظتي",            icon: Wallet      },
  { href: "/my-account/profile",   label: "بياناتي",           icon: UserCircle  },
  { href: "/my-account/security",  label: "الأمان",            icon: Shield      },
  { href: "/my-account/addresses", label: "العناوين المحفوظة", icon: MapPin      },
  { href: "/contact",              label: "تواصل معنا",        icon: Phone       },
  { href: "/my-account/terms",     label: "الشروط والأحكام",   icon: FileText    },
  { href: "/my-account/privacy",   label: "سياسة الخصوصية",    icon: Lock        },
  { href: "/my-account/help",      label: "المساعدة",          icon: HelpCircle  },
];

export default function SettingsLinksPanel() {
  const logout = useLogout();

  return (
    <DashboardCard title="الإعدادات" icon={Settings}>
      <div className="flex flex-col divide-y divide-white/10">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between gap-3 py-4 text-white hover:text-glace-yellow transition-colors"
          >
            <span className="flex items-center gap-3 text-[16px]">
              <Icon size={18} className="text-glace-yellow" />
              {label}
            </span>
            <ChevronLeft size={18} className="text-white/40" />
          </Link>
        ))}
      </div>

      <button
        type="button"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
        className="flex items-center gap-2 w-full mt-5 py-3.5 rounded-[16px] bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-300 text-[15px] font-bold justify-center transition-colors cursor-pointer disabled:opacity-60"
      >
        <LogOut size={17} />
        {logout.isPending ? "جاري الخروج..." : "تسجيل الخروج"}
      </button>
    </DashboardCard>
  );
}
