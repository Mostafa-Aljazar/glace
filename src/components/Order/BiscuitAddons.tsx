"use client";

import { Minus, Plus } from "lucide-react";

export function ExtraBiscuitCounter({
  count,
  unitPrice,
  label = "بسكوت إضافي",
  maxQty,
  onChange,
}: {
  count: number;
  unitPrice: number;
  label?: string;
  /** Per-unit cap from the backend addon catalog; unbounded when omitted. */
  maxQty?: number;
  onChange: (count: number) => void;
}) {
  const atMax = maxQty !== undefined && count >= maxQty;

  return (
    <div className="flex items-center justify-between gap-4 bg-white/10 px-4 py-4 border border-white/20 rounded-[16px]">
      {/* Label on the right (RTL start) */}
      <div className="flex-1">
        <p className="font-medium text-[15px] text-white">{label}</p>
        <p className="text-[12px] text-white/50">{unitPrice} ₪ / حبة</p>
      </div>

      {/* Counter on the left (RTL end) */}
      <div className="flex items-center gap-3 shrink-0">
        {count > 0 && (
          <span className="font-bold text-[14px] text-glace-yellow shrink-0">
            +{(count * unitPrice).toFixed(0)} ₪
          </span>
        )}
        <button
          type="button"
          onClick={() => onChange(Math.max(0, count - 1))}
          disabled={count === 0}
          className="flex justify-center items-center bg-white/15 hover:bg-white/25 disabled:opacity-40 border border-white/25 rounded-full w-9 h-9 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Minus size={14} />
        </button>
        <span className="min-w-7 font-bold text-[20px] text-white text-center">
          {count}
        </span>
        <button
          type="button"
          onClick={() => onChange(maxQty !== undefined ? Math.min(maxQty, count + 1) : count + 1)}
          disabled={atMax}
          className="flex justify-center items-center bg-white/15 hover:bg-white/25 disabled:opacity-40 border border-white/25 rounded-full w-9 h-9 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
