"use client";

import { ShoppingBag } from "lucide-react";
import CartLineStepper from "@/components/Order/CartLineStepper";
import {
  getLineItemSummaryParts,
  getLineItemTotal,
  type CartItem,
} from "@/store/cartStore";

/**
 * "في سلتك" — the configurations of this product already in the cart, each
 * with a stepper bound to its cart line. On builder pages this is where the
 * quantity is set: a finished configuration is added once, then stepped here,
 * exactly like a flat-list row.
 */
export default function InCartLines({ lines }: { lines: CartItem[] }) {
  if (lines.length === 0) return null;

  return (
    <div className="bg-white/17 backdrop-blur-[15px] mb-4 p-4 border-2 border-glace-yellow/40 rounded-[28px]">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag size={18} className="text-glace-yellow" />
        <h2 className="font-bold text-[15px] text-white">في سلتك</h2>
      </div>
      <div className="flex flex-col gap-2.5">
        {lines.map((line) => (
          <div
            key={line.id}
            className="flex items-center gap-3 bg-white/8 px-3.5 py-3 border border-white/12 rounded-[18px]"
          >
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[14px] text-white">{line.name}</p>
              {getLineItemSummaryParts(line).map((part) => (
                <p key={part} className="text-[12px] text-white/65 leading-snug">
                  {part}
                </p>
              ))}
              <p className="mt-1 font-bold tabular-nums text-[13px] text-glace-yellow">
                {getLineItemTotal(line).toFixed(2)} ₪
              </p>
            </div>
            <CartLineStepper lines={[line]} />
          </div>
        ))}
      </div>
    </div>
  );
}
