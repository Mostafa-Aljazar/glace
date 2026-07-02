"use client";

import { useState } from "react";
import HeroSection from "@/components/Home/HeroSection";
import LoadingPage from "@/components/Common/LoadingPage";
import AboutSection from "@/components/Home/AboutSection";
import WhyGlaceSection from "@/components/Home/WhyGlaceSection";
import TimesWorkSection from "@/components/Home/TimesWorkSection";
import EventsSection from "@/components/Home/EventsSection";
import OpinionsSection from "@/components/Home/OpinionsSection";
import Footer from "@/components/Common/Footer";

export default function HomeClientPage() {
  const [bgColor, setBgColor] = useState("#51C9F4");

  return (
    <div
      className="transition-[background-color] duration-2000 ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      <LoadingPage />
      <HeroSection onColorChange={setBgColor} />
      <AboutSection bgColor={bgColor} />
      <WhyGlaceSection />
      <TimesWorkSection />
      <EventsSection />
      <OpinionsSection />
      <Footer />
    </div>
  );
}
