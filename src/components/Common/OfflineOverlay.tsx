"use client";

import { useEffect, useRef, useState } from "react";
import { Check, RotateCw, WifiOff } from "lucide-react";

/** Bottom sheet, flush with the screen edge, shown whenever the browser loses network connectivity. */
export default function OfflineOverlay() {
  const [isOffline, setIsOffline] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline.current) {
        setShowReconnected(true);
        window.setTimeout(() => setShowReconnected(false), 2500);
      }
      wasOffline.current = false;
    };
    const handleOffline = () => {
      setIsOffline(true);
      wasOffline.current = true;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const reconnectedToast = showReconnected && (
    <div className="top-24 lg:top-6 z-9999999 fixed inset-x-0 flex justify-center px-3 pointer-events-none">
      <div className="flex items-center gap-3 bg-[#15803d] shadow-[0_12px_32px_rgba(0,0,0,0.28)] mx-auto px-3.5 py-3 border border-white/20 rounded-[22px] w-full max-w-md pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-300">
        <span className="flex justify-center items-center bg-white/25 rounded-full w-10 h-10 shrink-0">
          <Check size={18} className="text-white" strokeWidth={3} />
        </span>
        <p className="font-bold text-[14px] text-white sm:text-[15px] leading-tight">
          تم الاتصال بالإنترنت
        </p>
      </div>
    </div>
  );

  if (!isOffline) return reconnectedToast;

  // A plain reload() while still offline just hands the tab to the browser's
  // own offline page. Only reload once the browser confirms connectivity is
  // back; otherwise briefly show a "retrying" state and let the online/offline
  // listeners above dismiss the sheet themselves.
  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
      return;
    }
    setRetrying(true);
    window.setTimeout(() => setRetrying(false), 1200);
  };

  return (
    <div
      role="alert"
      className="z-99999998 fixed inset-0 flex items-end justify-center bg-black/40"
    >
      <div className="bg-[#1c6b88] shadow-[0_-8px_40px_rgba(0,0,0,0.35)] pt-3 pb-[calc(env(safe-area-inset-bottom)+28px)] border border-white/10 border-b-0 rounded-t-[28px] w-full sm:max-w-md animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center pb-4">
          <span className="bg-white/25 rounded-full w-10 h-1" />
        </div>

        <div className="flex flex-col items-center gap-5 px-8 text-center">
          <div className="flex justify-center items-center bg-white/10 border border-white/15 rounded-2xl size-24">
            <WifiOff size={40} className="text-glace-yellow" strokeWidth={1.75} />
          </div>

          <div>
            <h2 className="font-bold text-[22px] text-white">
              لا يوجد اتصال بالإنترنت
            </h2>
            <p className="mt-1.5 text-[14px] text-white/60">
              تحقق من اتصالك وحاول مرة أخرى
            </p>
          </div>

          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex justify-center items-center gap-2 bg-glace-yellow hover:bg-yellow-300 disabled:opacity-70 mt-1 py-3.5 rounded-full w-full font-bold text-[#1e6a7f] text-[15px] transition-colors disabled:cursor-default cursor-pointer"
          >
            <RotateCw size={16} className={retrying ? "animate-spin" : ""} />
            {retrying ? "جاري المحاولة..." : "إعادة المحاولة"}
          </button>
        </div>
      </div>
    </div>
  );
}
