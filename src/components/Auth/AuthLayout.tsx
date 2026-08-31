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
      <div className="z-90 relative flex lg:flex-row flex-col lg:justify-center items-center gap-8 lg:gap-16 mx-auto px-4 pt-22.5 lg:pt-26.5 pb-8 w-full max-w-300 text-white">
        {/* .textBodyLogin */}
        <div className="w-full lg:w-1/2 text-center lg:text-right">
          <h1 className="mb-0.5 lg:mb-1 text-[28px] sm:text-[36px] lg:text-[56px] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[15px] sm:text-[19px] lg:text-[28px] text-white/80 lg:text-white">
              {subtitle}
            </p>
          )}
        </div>

        {/* .formBodyLogin / .formBodyLoginC */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white/[.17] backdrop-blur-[15px] mx-auto lg:mx-0 lg:mr-auto p-6 sm:p-7 lg:p-8 rounded-[30px] max-w-[550px] lg:max-w-[550px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
