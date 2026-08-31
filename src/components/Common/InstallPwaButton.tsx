"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Download,
  Share,
  SquarePlus,
  Zap,
  Home,
  Smartphone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari flag
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Lazily read the client-only iOS flag once, at mount time, instead of
  // setting it from inside the effect body (which would double-render).
  const [iosMode] = useState(
    () => typeof window !== "undefined" && !isStandalone() && isIos(),
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const hasSeenInstallPrompt =
      localStorage.getItem("glace-install-prompt-seen") === "true";
    if (!hasSeenInstallPrompt) {
      setModalOpen(true);
      localStorage.setItem("glace-install-prompt-seen", "true");
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setDismissed(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [iosMode]);

  const handleInstallNow = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDismissed(true);
    }
    setDeferredPrompt(null);
    setModalOpen(false);
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent
        showCloseButton={true}
        className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-0 border-0 rounded-[30px] ring-0 overflow-hidden text-white text-center"
      >
        {/* decorative bubbles, echoing the logo's own bubble motif */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="top-[-30px] right-[-20px] absolute bg-white/10 rounded-full size-28" />
          <span className="bottom-[-40px] left-[-30px] absolute bg-white/10 rounded-full size-32" />
          <span className="top-10 left-6 absolute bg-glace-yellow/20 rounded-full size-3" />
          <span className="top-16 left-11 absolute bg-glace-yellow/30 rounded-full size-2" />
        </div>

        <div className="relative flex flex-col items-center px-6 sm:px-8 pt-9 pb-6 sm:pb-8">
          {/* app icon, presented like an actual home-screen icon */}
          <div className="relative shadow-[0_14px_32px_rgba(0,0,0,0.35)] mb-4 rounded-[26%] ring-2 ring-white/40 size-24 overflow-hidden">
            <Image
              src="/icons/icon-512.png"
              alt="جلاسيه الأمير"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>

          <DialogHeader className="items-center gap-2">
            <DialogTitle className="text-white text-2xl">
              ثبّت تطبيق جلاسيه الأمير
            </DialogTitle>
            {!iosMode && (
              <DialogDescription className="text-[15px] text-white/85 leading-relaxed">
                أضِف الأيقونة إلى شاشتك الرئيسية واطلب بوظتك المفضلة بضغطة
                واحدة، بدون فتح المتصفح في كل مرة.
              </DialogDescription>
            )}
          </DialogHeader>

          {!iosMode && (
            <div className="flex justify-center gap-2 mt-5 w-full">
              {[
                { icon: Zap, label: "دخول أسرع" },
                { icon: Home, label: "شاشتك الرئيسية" },
                { icon: Smartphone, label: "بدون متصفح" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col flex-1 items-center gap-1.5 bg-white/10 py-3 rounded-2xl"
                >
                  <Icon size={18} className="text-glace-yellow" />
                  <span className="font-medium text-[11px] text-white/90 leading-none">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {iosMode ? (
            <div className="flex flex-col gap-2.5 mt-5 w-full text-right">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                <span className="flex justify-center items-center bg-glace-yellow rounded-full size-8 font-bold text-[#1a4a5a] text-[13px] shrink-0">
                  1
                </span>
                <p className="flex flex-1 items-center gap-1.5 text-[14px] text-white/95 leading-snug">
                  اضغط على زر <b>المشاركة</b>
                  <Share size={15} className="text-white/80 shrink-0" />
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                <span className="flex justify-center items-center bg-glace-yellow rounded-full size-8 font-bold text-[#1a4a5a] text-[13px] shrink-0">
                  2
                </span>
                <p className="flex flex-1 items-center gap-1.5 text-[14px] text-white/95 leading-snug">
                  اختر <b>«إضافة إلى الشاشة الرئيسية»</b>
                  <SquarePlus size={15} className="text-white/80 shrink-0" />
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="bg-white/15 hover:bg-white/25 mt-1 py-2.5 rounded-full w-full text-[15px] text-white transition-colors cursor-pointer"
              >
                حسناً، فهمت
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 mt-6 w-full">
              <button
                type="button"
                onClick={handleInstallNow}
                className="group flex justify-center items-center gap-2 bg-glace-yellow hover:bg-white shadow-[0_10px_24px_rgba(244,228,81,0.35)] py-3 rounded-full w-full font-bold text-[#1a4a5a] text-[16px] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download
                  size={18}
                  strokeWidth={2.4}
                  className="transition-transform group-hover:-translate-y-0.5"
                />
                تثبيت الآن
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="py-1 w-full text-[14px] text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                ليس الآن
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
