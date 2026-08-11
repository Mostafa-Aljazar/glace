"use client";

import { RotateCw } from "lucide-react";

/**
 * Shown when a backend query fails. The frontend holds no copy of home, events
 * or menu data, so a failure is surfaced honestly with a retry instead of being
 * papered over with stand-in content.
 */
export default function DataError({
  title = "تعذّر تحميل البيانات",
  description = "تحقق من اتصالك وحاول مرة أخرى",
  onRetry,
  className = "",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 rounded-[24px] border border-white/20 bg-white/10 px-6 py-10 text-center ${className}`}
    >
      <p className="font-bold text-[18px] text-white">{title}</p>
      <p className="max-w-sm text-[14px] text-white/70">{description}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-glace-yellow/90 hover:bg-glace-yellow mt-2 px-5 py-2 rounded-xl font-bold text-[#1e6a7f] text-[14px] transition-colors cursor-pointer"
        >
          <RotateCw size={14} />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
