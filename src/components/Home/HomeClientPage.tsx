"use client";

import { useState } from "react";
import HeroSection from "@/components/Home/HeroSection";
import AboutSection from "@/components/Home/AboutSection";
import WhyGlaceSection from "@/components/Home/WhyGlaceSection";
import TimesWorkSection from "@/components/Home/TimesWorkSection";
import EventsSection from "@/components/Home/EventsSection";
import OpinionsSection from "@/components/Home/OpinionsSection";
import Footer from "@/components/Common/Footer";
import { useHomePage } from "@/hooks/home/useHomePage";
import { FAKE_HOME_PAGE } from "@/data/fake-data/homePage";

export default function HomeClientPage() {
  const [bgColor, setBgColor] = useState("#51C9F4");
  const { data = FAKE_HOME_PAGE } = useHomePage();

  return (
    <div
      className="transition-[background-color] duration-2000 ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      <HeroSection slides={data.hero.slides} onColorChange={setBgColor} />
      <AboutSection bgColor={bgColor} about={data.about} />
      <WhyGlaceSection whyGlace={data.whyGlace} />
      <TimesWorkSection branchesData={data.branches} />
      <EventsSection eventsData={data.events} />
      <OpinionsSection opinionsData={data.opinions} />
      <Footer />
    </div>
  );
}
