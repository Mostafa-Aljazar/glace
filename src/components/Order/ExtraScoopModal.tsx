"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import type {
  IExtraScoop,
  IExtraScoopOption,
  IProductVariant,
} from "@/types/menu.types";

interface ExtraScoopModalProps {
  open: boolean;
  item: IProductVariant;
  extraScoop: IExtraScoop;
  onClose: () => void;
  /** Adds one unit of `item` to the cart — with the chosen scoop, or plain
   *  when `scoop` is null ("بدون بوظة"). */
  onConfirm: (scoop: IExtraScoopOption | null) => void;
}

const SECTIONS: Array<{ key: keyof IExtraScoop; title: string }> = [
  { key: "classic", title: "كلاسيك" },
  { key: "special", title: "سبيشل" },
];

function OptionRow({
  label,
  price,
  active,
  unavailable,
  onClick,
}: {
  label: string;
  price?: number;
  active: boolean;
  unavailable?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={unavailable}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[16px] border text-start transition ${
        unavailable
          ? "opacity-40 bg-white/8 border-white/10 cursor-not-allowed"
          : active
            ? "bg-glace-yellow/20 border-glace-yellow"
            : "bg-white/12 border-white/15 hover:bg-white/18"
      }`}
    >
      <span
        className={`flex justify-center items-center shrink-0 rounded-full w-5 h-5 border ${
          active
            ? "bg-glace-yellow border-glace-yellow text-[#1e6a7f]"
            : "border-white/40"
        }`}
      >
        {active && <Check size={12} strokeWidth={3} />}
      </span>
      <span className="flex-1 min-w-0 font-bold text-[14px] text-white truncate">
        {label}
      </span>
      {unavailable ? (
        <span className="shrink-0 text-[12px] text-white/70">غير متاح</span>
      ) : (
        price !== undefined && (
          <span
            dir="ltr"
            className="shrink-0 font-bold tabular-nums text-[14px] text-white/85"
          >
            +{price} ₪
          </span>
        )
      )}
    </button>
  );
}

/** Opened by a flat-list row's "أضف" when the product offers `extraScoop`:
 *  one clear question — scoop or not — before the unit goes into the cart.
 *  "بدون بوظة" is pre-selected, so a plain add is still just one more tap. */
export default function ExtraScoopModal({
  open,
  item,
  extraScoop,
  onClose,
  onConfirm,
}: ExtraScoopModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const allOptions = [
    ...(extraScoop.classic ?? []),
    ...(extraScoop.special ?? []),
  ];
  const selected = allOptions.find((o) => o.id === selectedId) ?? null;
  const total = item.price + (selected?.price ?? 0);

  function close() {
    setSelectedId(null);
    onClose();
  }

  return createPortal(
    <div className="z-[100000000] fixed inset-0 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-black/45 backdrop-blur-[4px]"
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scoop-modal-title"
        className="relative z-10 w-full max-w-[400px] max-h-[85vh] overflow-y-auto rounded-[28px] border border-white/25 bg-[#1b7496]/92 backdrop-blur-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-5"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2
              id="scoop-modal-title"
              className="font-bold text-[20px] text-white leading-tight"
            >
              {item.label}
            </h2>
            <p className="mt-1 text-[13px] text-white/65">
              بدك بوظة معها؟ (اختياري)
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex justify-center items-center shrink-0 bg-white/15 hover:bg-white/25 rounded-full w-8 h-8 text-white transition"
            aria-label="إغلاق"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mb-4">
          <OptionRow
            label="بدون بوظة"
            active={selectedId === null}
            onClick={() => setSelectedId(null)}
          />
        </div>

        {SECTIONS.map(({ key, title }) => {
          const options = extraScoop[key] ?? [];
          if (options.length === 0) return null;
          return (
            <div key={key} className="mb-4">
              <p
                className={`mb-2 font-bold text-[12px] ${
                  key === "special" ? "text-glace-yellow" : "text-white/85"
                }`}
              >
                بوظة {title}
              </p>
              <div className="space-y-2">
                {options.map((option) => (
                  <OptionRow
                    key={option.id}
                    label={option.label}
                    price={option.price}
                    active={option.id === selectedId}
                    unavailable={option.available === false}
                    onClick={() => setSelectedId(option.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => {
            onConfirm(selected);
            setSelectedId(null);
          }}
          className="bg-glace-yellow hover:brightness-105 mt-2 px-4 py-3.5 rounded-full w-full font-bold tabular-nums text-[#1e6a7f] text-[15px] transition"
        >
          {selected
            ? `أضف ${item.label} + بوظة ${selected.label} · ${total} ₪`
            : `أضف ${item.label} · ${total} ₪`}
        </button>
      </div>
    </div>,
    document.body,
  );
}
