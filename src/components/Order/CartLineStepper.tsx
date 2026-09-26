"use client";

import { Minus, Plus } from "lucide-react";
import { useCartStore, type CartItem } from "@/store/cartStore";

/**
 * −/+ stepper bound directly to cart lines — there is no local "pending"
 * quantity on the order pages any more, so the number shown is always what
 * the cart holds. Several lines can share one stepper (e.g. the same variant
 * split into two lines after one got cart-side addons): the count is their
 * sum, and +/− act on the most recently added line.
 */
export default function CartLineStepper({ lines }: { lines: CartItem[] }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const target = lines[lines.length - 1];
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  if (!target) return null;

  return (
    <div className="flex items-center gap-1.5 bg-white/15 px-2 py-1 border border-white/25 rounded-full shrink-0">
      <button
        type="button"
        onClick={() => updateQuantity(target.id, target.quantity - 1)}
        className="flex justify-center items-center hover:bg-white/25 rounded-full w-7 h-7 text-white transition-colors cursor-pointer"
        aria-label="إنقاص"
      >
        <Minus size={12} />
      </button>
      <span className="min-w-5 font-bold tabular-nums text-[14px] text-white text-center">
        {count}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(target.id, target.quantity + 1)}
        className="flex justify-center items-center hover:bg-white/25 rounded-full w-7 h-7 text-white transition-colors cursor-pointer"
        aria-label="زيادة"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
