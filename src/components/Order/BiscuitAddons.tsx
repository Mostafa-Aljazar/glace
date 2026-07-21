"use client";

import { Minus, Plus } from "lucide-react";
import type { Addon } from "@/data/OrderData";

export function BiscuitPackSelector({
  addons,
  selectedIds,
  onToggle,
}: {
  addons: Addon[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
      {addons.map((addon) => {
        const checked = selectedIds.includes(addon.id);
        return (
          <button
            key={addon.id}
            type="button"
            onClick={() => onToggle(addon.id)}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border text-right transition-all cursor-pointer
              ${
                checked
                  ? "bg-glace-yellow/15 border-glace-yellow/50 text-white"
                  : "bg-white/10 border-white/20 text-white/75 hover:border-white/40"
              }`}
          >
            <span className="text-[14px]">{addon.name}</span>
            <span
              className={`text-[13px] font-bold shrink-0 ${checked ? "text-glace-yellow" : "text-white/50"}`}
            >
              +{addon.price} ₪
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ExtraBiscuitCounter({
  count,
  unitPrice,
  onChange,
}: {
  count: number;
  unitPrice: number;
  onChange: (count: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white/10 px-4 py-4 border border-white/20 rounded-[16px]">
      {/* Label on the right (RTL start) */}
      <div className="flex-1">
        <p className="font-medium text-[15px] text-white">بسكوت إضافي</p>
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
          onClick={() => onChange(count + 1)}
          className="flex justify-center items-center bg-white/15 hover:bg-white/25 border border-white/25 rounded-full w-9 h-9 text-white transition-colors cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
