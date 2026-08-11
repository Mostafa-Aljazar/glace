"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import {
  getMixFlavorUnitPrice,
  getMixSelectionPrice,
  resolveMenuImageSrc,
  resolveMixItems,
  type IMixRule,
  type IProductVariant,
} from "@/types/menu.types";

interface MixFlavorModalProps {
  open: boolean;
  mix: IMixRule;
  items?: IProductVariant[];
  onClose: () => void;
  /** Selected item ids, one entry per picked ball (repeats allowed). */
  onConfirm: (itemIds: string[], unitPrice: number) => void;
}

export default function MixFlavorModal({
  open,
  mix,
  items = [],
  onClose,
  onConfirm,
}: MixFlavorModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setSelected([]);
  }, [open, mix.id]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  // The mix references items by id, so a dashboard rename never breaks it.
  const mixItems = resolveMixItems(mix, items);
  const selectedItems = selected.map(
    (id) =>
      items.find((item) => item.id === id) ?? { isPremiumMixFlavor: false },
  );
  const total = getMixSelectionPrice(mix, selectedItems);
  const canConfirm = selected.length === mix.pick;
  const remaining = mix.pick - selected.length;
  const remainingLabel =
    remaining === 1 ? "طعم واحد" : remaining === 2 ? "طعمين" : `${remaining} أطعمة`;
  const isFull = selected.length >= mix.pick;

  const MAX_SAME_FLAVOR = mix.pick >= 3 ? 2 : 1;

  function addFlavor(itemId: string) {
    setSelected((prev) => {
      if (prev.length >= mix.pick) return prev;
      const sameCount = prev.filter((f) => f === itemId).length;
      if (sameCount >= MAX_SAME_FLAVOR) return prev;
      return [...prev, itemId];
    });
  }

  function removeOneFlavor(itemId: string) {
    setSelected((prev) => {
      const idx = prev.lastIndexOf(itemId);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }

  return createPortal(
    <div className="z-[100000000] fixed inset-0 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-black/45 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mix-modal-title"
        className="relative z-10 w-full max-w-[400px] max-h-[85vh] overflow-y-auto rounded-[28px] border border-white/25 bg-[#1b7496]/92 backdrop-blur-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-5"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2
              id="mix-modal-title"
              className="font-bold text-[20px] text-white leading-tight"
            >
              {mix.label}
            </h2>
            <p className="mt-1 text-[13px] text-white/65">
              اختر {mix.pick} {mix.pick === 2 ? "طعمين" : "أطعمة"}
              <span className="text-white/40"> · </span>
              <span className="text-glace-yellow font-bold">
                {selected.length}/{mix.pick}
              </span>
            </p>
            {MAX_SAME_FLAVOR > 1 && (
              <p className="mt-1 text-[11px] text-white/45">
                يمكن اختيار نفس الطعم مرتين كحد أقصى
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex justify-center items-center shrink-0 bg-white/15 hover:bg-white/25 rounded-full w-8 h-8 text-white transition"
            aria-label="إغلاق"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {mixItems.map((flavorItem) => {
            const flavor = flavorItem.label;
            const itemId = flavorItem.id;
            const count = selected.filter((f) => f === itemId).length;
            const unavailable = flavorItem.available === false;
            const flavorPrice = getMixFlavorUnitPrice(mix, flavorItem.isPremiumMixFlavor);
            const flavorImage = flavorItem.image;
            const special = !!flavorItem.isPremiumMixFlavor;
            const canAdd =
              !unavailable && !isFull && count < MAX_SAME_FLAVOR;

            return (
              <div
                key={itemId}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[16px] border transition ${
                  unavailable
                    ? "opacity-40 bg-white/8 border-white/10"
                    : count > 0
                      ? "bg-glace-yellow/20 border-glace-yellow"
                      : "bg-white/12 border-white/15"
                }`}
              >
                <div
                  className={`relative flex justify-center items-center shrink-0 rounded-full w-12 h-12 ${
                    count > 0 ? "bg-white/25 ring-2 ring-glace-yellow" : "bg-white/15"
                  }`}
                >
                  {flavorImage && (
                    <Image
                      src={resolveMenuImageSrc(flavorImage)}
                      alt={flavor}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-contain"
                    />
                  )}
                  {count > 0 && (
                    <span className="absolute -top-1 -left-1 flex justify-center items-center bg-glace-yellow rounded-full min-w-5 h-5 px-1 text-[11px] font-bold text-[#1e6a7f]">
                      {count}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[14px] text-white truncate">{flavor}</p>
                  {special && !unavailable && (
                    <p className="text-[11px] text-glace-yellow mt-0.5">سعر خاص</p>
                  )}
                </div>

                <span
                  className={`shrink-0 font-bold text-[14px] tabular-nums me-1 ${
                    special && !unavailable ? "text-glace-yellow" : "text-white/85"
                  }`}
                >
                  {flavorPrice} ₪
                </span>

                {!unavailable && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={count === 0}
                      onClick={() => removeOneFlavor(itemId)}
                      className={`flex justify-center items-center rounded-full w-7 h-7 border transition ${
                        count > 0
                          ? "bg-white/15 border-white/25 text-white hover:bg-white/25"
                          : "bg-white/5 border-white/10 text-white/25 cursor-not-allowed"
                      }`}
                      aria-label={`إنقاص ${flavor}`}
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={!canAdd}
                      onClick={() => addFlavor(itemId)}
                      className={`flex justify-center items-center rounded-full w-7 h-7 border transition ${
                        canAdd
                          ? "bg-glace-yellow border-glace-yellow text-[#1e6a7f] hover:brightness-105"
                          : "bg-white/5 border-white/10 text-white/25 cursor-not-allowed"
                      }`}
                      aria-label={`إضافة ${flavor}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-[13px] text-white/60">الإجمالي</p>
          <p className="font-bold text-[20px] text-glace-yellow tabular-nums">
            {total} ₪
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white/12 hover:bg-white/18 px-4 py-3 border border-white/20 rounded-full font-bold text-[14px] text-white transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm(selected, total)}
            className={`flex-[1.35] px-4 py-3 rounded-full font-bold text-[14px] transition ${
              canConfirm
                ? "bg-glace-yellow text-[#1e6a7f] hover:brightness-105"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            {canConfirm ? "تأكيد" : `اختر ${remainingLabel}`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
