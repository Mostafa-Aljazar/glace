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
      <div className="z-90 relative flex md:flex-row flex-col justify-between items-center gap-8 mx-auto px-4 pt-22.5 lg:pt-26.5 pb-8 w-full max-w-300 min-h-[calc(100vh-340px)] text-white">
        {/* .textBodyLogin */}
        <div className="mt-7.5 md:mt-0 w-full md:w-1/2 text-center md:text-right">
          <h1 className="mb-0 text-[44px] md:text-[66px] lg:text-[75px]">
            {title}
          </h1>
          {subtitle && <p className="text-[26px] md:text-[40px]">{subtitle}</p>}
        </div>

        {/* .formBodyLogin / .formBodyLoginC */}
        <div className="w-full md:w-1/2">
          <div className="bg-white/23 backdrop-blur-[10px] mx-auto md:mx-0 md:mr-auto p-[20px_15px] sm:p-[20px_15px] md:p-[20px_35px] lg:p-[40px_50px] rounded-[25px] max-w-[550px] md:max-w-[500px] lg:max-w-[550px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
