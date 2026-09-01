"use client";

import type { ReactNode } from "react";
import ContactBackground from "@/components/Contact/ContactBackground";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  activeHref?: string;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  activeHref,
}: AuthLayoutProps) {
  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">


      <ContactBackground />

      {/* .bodyLogin.container */}
      <div className="z-90 relative flex justify-center items-center px-4 pt-22.5 lg:pt-26.5 pb-8 w-full min-h-screen">
        {/* Sonbol-style centered single card, kept on the glace glass system */}
        <div className="bg-white/17 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-[15px] mx-auto p-6 sm:p-8 border border-white/20 rounded-[28px] w-full max-w-110">
          <div className="mb-6 text-center">
            <h1 className="mb-1 font-bold text-white text-[26px] sm:text-[30px] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[14px] sm:text-[15px] text-white/70">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
