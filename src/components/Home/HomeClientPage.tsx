"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/Home/HeroSection";
import AboutSection from "@/components/Home/AboutSection";
import WhyGlaceSection from "@/components/Home/WhyGlaceSection";
import TimesWorkSection from "@/components/Home/TimesWorkSection";
import EventsSection from "@/components/Home/EventsSection";
import Footer from "@/components/Common/Footer";
import DataError from "@/components/Common/DataError";
import { useHomePage } from "@/hooks/home/useHomePage";

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  // Offset for the fixed glass header
  const top = el.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function HomeClientPage() {
  const [bgColor, setBgColor] = useState("#51C9F4");
  const { data, isLoading, isError, refetch } = useHomePage();

  // Browser may try to jump to #location before the section mounts
  // (home waits on API). Re-run after content is ready, and on hash changes.
  useEffect(() => {
    if (!data) return;

    const run = () => scrollToHash(window.location.hash);
    run();
    // Retry once after paint in case layout/images shift the offset
    const t = window.setTimeout(run, 100);

    const onHashChange = () => scrollToHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-[#51C9F4] min-h-screen">
        <div className="border-4 border-white/40 border-t-white rounded-full w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex justify-center items-center bg-[#51C9F4] px-4 min-h-screen">
        <DataError
          title="تعذّر تحميل الصفحة الرئيسية"
          description="لم نتمكن من الوصول إلى الخادم، حاول مرة أخرى"
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

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
      <Footer />
    </div>
  );
}
