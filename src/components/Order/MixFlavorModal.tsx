"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AlertCircle, Check, Plus, X } from "lucide-react";
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
  /** Selected item ids, one entry per picked ball (each flavor at most once). */
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
  // Bumped on every blocked close attempt, so a repeat click re-scrolls to
  // the error; reset once the customer changes their picks.
  const [closeAttempts, setCloseAttempts] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setSelected([]);
      setCloseAttempts(0);
    }
  }, [open, mix.id]);

  // Bring the confirm button into view once the mix is complete, or when a
  // close attempt is blocked and the error needs to be seen.
  useEffect(() => {
    if (!open) return;
    if (selected.length !== mix.pick && closeAttempts === 0) return;
    const dialog = dialogRef.current;
    dialog?.scrollTo({ top: dialog.scrollHeight, behavior: "smooth" });
  }, [open, selected.length, mix.pick, closeAttempts]);

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

  // The backend rejects any repeated flavor within a single mix instance
  // ("لا يمكن اختيار نفس الصنف أكثر من مرة في المكس") — confirmed against a
  // real order — so each flavor is a simple on/off pick.
  function toggleFlavor(itemId: string) {
    setCloseAttempts(0);
    setSelected((prev) => {
      if (prev.includes(itemId)) return prev.filter((f) => f !== itemId);
      if (prev.length >= mix.pick) return prev;
      return [...prev, itemId];
    });
  }

  // Once a flavor is picked, the X and the backdrop no longer close the modal:
  // the customer has to confirm the mix or discard it with "إلغاء".
  function requestClose() {
    if (selected.length === 0) {
      onClose();
      return;
    }
    setCloseAttempts((n) => n + 1);
  }

  const closeError =
    closeAttempts === 0
      ? null
      : canConfirm
        ? "اضغط تأكيد لإضافة المكس، أو إلغاء للخروج بدون حفظ"
        : `أكمل اختيار ${remainingLabel} ثم اضغط تأكيد، أو اضغط إلغاء`;

  return createPortal(
    <div className="z-[100000000] fixed inset-0 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-black/45 backdrop-blur-[4px]"
        onClick={requestClose}
      />

      <div
        ref={dialogRef}
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
          </div>
          <button
            type="button"
            onClick={requestClose}
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
            const isSelected = selected.includes(itemId);
            const unavailable = flavorItem.available === false;
            const flavorPrice = getMixFlavorUnitPrice(mix, flavorItem.isPremiumMixFlavor);
            const flavorImage = flavorItem.image;
            const special = !!flavorItem.isPremiumMixFlavor;
            const canAdd = !unavailable && !isFull;

            return (
              <div
                key={itemId}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[16px] border transition ${
                  unavailable
                    ? "bg-white/8 border-white/10 [&>*:not(:last-child)]:opacity-40"
                    : isSelected
                      ? "bg-glace-yellow/20 border-glace-yellow"
                      : "bg-white/12 border-white/15"
                }`}
              >
                <div
                  className={`relative flex justify-center items-center shrink-0 rounded-full w-12 h-12 ${
                    isSelected ? "bg-white/25 ring-2 ring-glace-yellow" : "bg-white/15"
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
                  {isSelected && (
                    <span className="absolute -top-1 -left-1 flex justify-center items-center bg-glace-yellow rounded-full w-5 h-5 text-[#1e6a7f]">
                      <Check size={12} strokeWidth={3} />
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

                {unavailable ? (
                  <span className="bg-red-500 px-2.5 py-1 rounded-full font-bold text-[11px] text-white shrink-0">
                    غير متاح
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!isSelected && !canAdd}
                    onClick={() => toggleFlavor(itemId)}
                    aria-pressed={isSelected}
                    className={`flex justify-center items-center gap-1 shrink-0 rounded-full min-w-[64px] h-8 px-3 border font-bold text-[12px] transition ${
                      isSelected
                        ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                        : canAdd
                          ? "bg-glace-yellow border-glace-yellow text-[#1e6a7f] hover:brightness-105"
                          : "bg-white/5 border-white/10 text-white/25 cursor-not-allowed"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <X size={13} strokeWidth={3} />
                        إزالة
                      </>
                    ) : (
                      <>
                        <Plus size={13} strokeWidth={3} />
                        أضف
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {closeError && (
          <p
            key={closeAttempts}
            role="alert"
            className="form-error flex items-center gap-1.5 mb-4 animate-in fade-in"
          >
            <AlertCircle size={15} strokeWidth={2.5} className="shrink-0" />
            {closeError}
          </p>
        )}

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
            className="flex-1 bg-red-500 hover:bg-red-600 shadow-sm px-4 py-3 rounded-full font-bold text-[14px] text-white transition cursor-pointer"
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
