"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import CartLineStepper from "@/components/Order/CartLineStepper";
import MixFlavorModal from "@/components/Order/MixFlavorModal";
import { useCartStore, type CartItem } from "@/store/cartStore";
import type { IMixRule, IProductVariant } from "@/types/menu.types";

/** Collapse a possibly-repeated array of item ids into {id, qty} pairs. */
export function countFlavorOccurrences(
  itemIds: string[],
): Array<{ id: string; qty: number }> {
  const counts = new Map<string, number>();
  for (const id of itemIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  return Array.from(counts.entries()).map(([id, qty]) => ({ id, qty }));
}

/** Human-readable chips for a selection — ids resolved to current labels, so
 *  a dashboard rename shows through immediately. */
function flavorFrequencyLabels(itemIds: string[], items: IProductVariant[]) {
  return countFlavorOccurrences(itemIds).map(({ id, qty }) => {
    const label = items.find((i) => i.id === id)?.label ?? id;
    return qty > 1 ? `${label} ×${qty}` : label;
  });
}

interface MixOrderSectionProps {
  mixes: IMixRule[];
  items: IProductVariant[];
  /** This product's mix lines already in the cart — each one is shown with
   *  its picks and a stepper bound to the cart. */
  lines: CartItem[];
  /** Confirming the flavor modal adds the mix straight to the cart. */
  onAddMix: (mix: IMixRule, itemIds: string[], unitPrice: number) => void;
}

export default function MixOrderSection({
  mixes,
  items,
  lines,
  onAddMix,
}: MixOrderSectionProps) {
  const [activeMix, setActiveMix] = useState<IMixRule | null>(null);
  const removeItem = useCartStore((s) => s.removeItem);

  function handleConfirm(itemIds: string[], unitPrice: number) {
    if (!activeMix) return;
    onAddMix(activeMix, itemIds, unitPrice);
    setActiveMix(null);
  }

  if (!mixes.length) return null;

  return (
    <div className="border-t border-white/15 pt-6">
      <div className="mb-5">
        <h3 className="font-bold text-[16px] text-white">المكسات</h3>
        <p className="mt-1 text-[12px] text-white/55">
          اختر أطعمتك من المودال — البستاشيو بسعر خاص
        </p>
      </div>

      <div className="space-y-5">
        {mixes.map((mixConfig) => {
          const mixInstances = lines.filter((l) => l.mixId === mixConfig.id);

          return (
            <div key={mixConfig.id}>
              <button
                type="button"
                onClick={() => setActiveMix(mixConfig)}
                className="group w-full flex items-center gap-3.5 px-4 py-3.5 rounded-[20px] border border-white/15 bg-white/8 hover:bg-white/12 hover:border-glace-yellow/40 transition-all duration-200"
              >
                <div className="flex justify-center items-center shrink-0 bg-glace-yellow/15 group-hover:bg-glace-yellow/25 rounded-2xl w-12 h-12 text-glace-yellow transition">
                  <Sparkles size={20} />
                </div>
                <div className="flex-1 text-right min-w-0">
                  <p className="font-bold text-[15px] text-white leading-snug">
                    {mixConfig.label}
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/50">
                    {mixConfig.pick}{" "}
                    {mixConfig.pick === 2 ? "طعمين" : "أطعمة"} · من{" "}
                    {mixConfig.basePrice} ₪
                  </p>
                </div>
                <span className="shrink-0 bg-glace-yellow group-hover:brightness-105 shadow-md px-4 py-2 rounded-full font-bold text-[13px] text-[#1e6a7f] transition">
                  اختر
                </span>
              </button>

              {mixInstances.length > 0 && (
                <div className="space-y-2.5 mt-3">
                  {mixInstances.map((mix, idx) => (
                    <div
                      key={mix.id}
                      className="bg-white/8 border border-glace-yellow/25 rounded-[18px] overflow-hidden"
                    >
                      <div className="flex items-start gap-3 px-3.5 pt-3.5 pb-2.5">
                        <div className="flex justify-center items-center shrink-0 bg-glace-yellow/20 rounded-full w-8 h-8 font-bold text-[12px] text-glace-yellow">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="mb-1.5 font-bold text-[13px] text-white">
                            {mixConfig.label}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {flavorFrequencyLabels(
                              mix.mixItemIds ?? [],
                              items,
                            ).map((label) => (
                              <span
                                key={label}
                                className="bg-white/10 border border-white/10 px-2 py-0.5 rounded-full text-[11px] font-bold text-white/90"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(mix.id)}
                          className="flex justify-center items-center shrink-0 rounded-full w-7 h-7 border border-rose-400/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/30 hover:border-rose-400/60 hover:text-rose-100 transition"
                          aria-label="حذف"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-t border-white/8 bg-white/3">
                        <p className="font-bold text-[14px] text-glace-yellow tabular-nums">
                          {mix.unitPrice} ₪
                        </p>
                        <CartLineStepper lines={[mix]} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeMix && (
        <MixFlavorModal
          open={!!activeMix}
          mix={activeMix}
          items={items}
          onClose={() => setActiveMix(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
