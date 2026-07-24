"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Minus, Plus, X } from "lucide-react";
import {
  useCartStore,
  type CartItem,
  type CartSelection,
  type CartUnit,
} from "@/store/cartStore";
import type { IAddonOption } from "@/types/menu.types";

type Mode = "all" | "perUnit";

interface CustomizeAdditionsDialogProps {
  open: boolean;
  item: CartItem;
  addons: IAddonOption[];
  onClose: () => void;
}

/** Map addon id -> selected quantity from a stored selection array. */
function selectionsToQty(selections: CartSelection[]): Record<string, number> {
  const q: Record<string, number> = {};
  for (const s of selections) {
    if (s.kind === "addon") q[s.id] = (q[s.id] ?? 0) + s.qty;
  }
  return q;
}

/** Clamp a requested qty to the addon's kind: toggle → 0/1, counter → 0..maxQty. */
function clampAddonQty(addon: IAddonOption, qty: number): number {
  const max = addon.type === "counter" ? addon.maxQty ?? 99 : 1;
  return Math.max(0, Math.min(qty, max));
}

export default function CustomizeAdditionsDialog({
  open,
  item,
  addons,
  onClose,
}: CustomizeAdditionsDialogProps) {
  const setItemSharedAddons = useCartStore((s) => s.setItemSharedAddons);
  const setItemUnits = useCartStore((s) => s.setItemUnits);

  const available = useMemo(
    () => addons.filter((a) => a.available !== false),
    [addons],
  );
  const addonById = useMemo(
    () => new Map(addons.map((a) => [a.id, a])),
    [addons],
  );

  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("all");
  // "all" mode: one qty map (addon id -> qty) shared by every unit.
  const [sharedQty, setSharedQty] = useState<Record<string, number>>({});
  // "perUnit" mode: one qty map per physical unit.
  const [unitQty, setUnitQty] = useState<Record<string, number>[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Seed local state from the line's current customization each time it opens.
  useEffect(() => {
    if (!open) return;
    if (item.units) {
      setMode("perUnit");
      setUnitQty(item.units.map((u) => selectionsToQty(u.selections)));
      setSharedQty({});
    } else {
      setMode("all");
      const q = selectionsToQty(item.selections);
      setSharedQty(q);
      setUnitQty(Array.from({ length: item.quantity }, () => ({ ...q })));
    }
  }, [open, item]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  function withAddonQty(
    map: Record<string, number>,
    addon: IAddonOption,
    qty: number,
  ): Record<string, number> {
    const next = { ...map };
    const v = clampAddonQty(addon, qty);
    if (v <= 0) delete next[addon.id];
    else next[addon.id] = v;
    return next;
  }

  function setSharedAddonQty(addon: IAddonOption, qty: number) {
    setSharedQty((prev) => withAddonQty(prev, addon, qty));
  }

  function setUnitAddonQty(unitIndex: number, addon: IAddonOption, qty: number) {
    setUnitQty((prev) =>
      prev.map((q, i) => (i === unitIndex ? withAddonQty(q, addon, qty) : q)),
    );
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    if (next === "perUnit") {
      // Carry the shared picks into every unit as a starting point.
      setUnitQty(Array.from({ length: item.quantity }, () => ({ ...sharedQty })));
    } else {
      // Collapse back to the first unit's picks as the shared set.
      setSharedQty(unitQty[0] ? { ...unitQty[0] } : {});
    }
    setMode(next);
  }

  function qtyToSelections(map: Record<string, number>): CartSelection[] {
    return Object.entries(map).flatMap(([id, qty]) => {
      const addon = addonById.get(id);
      if (!addon || qty <= 0) return [];
      return [
        {
          kind: "addon" as const,
          id: addon.id,
          label: addon.label,
          qty,
          unitPrice: addon.price,
        },
      ];
    });
  }

  function qtyTotal(map: Record<string, number>): number {
    return Object.entries(map).reduce(
      (s, [id, qty]) => s + (addonById.get(id)?.price ?? 0) * qty,
      0,
    );
  }

  const sharedAddonTotal = qtyTotal(sharedQty);

  const lineTotal =
    mode === "all"
      ? (item.unitPrice + sharedAddonTotal) * item.quantity
      : item.unitPrice * item.quantity +
        unitQty.reduce((sum, q) => sum + qtyTotal(q), 0);

  function handleSave() {
    if (mode === "all") {
      setItemSharedAddons(item.id, qtyToSelections(sharedQty), sharedAddonTotal);
    } else {
      const units: CartUnit[] = unitQty.map((q) => ({
        selections: qtyToSelections(q),
      }));
      setItemUnits(item.id, units);
    }
    onClose();
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
        aria-labelledby="customize-modal-title"
        className="relative z-10 w-full max-w-[440px] max-h-[85vh] flex flex-col overflow-hidden rounded-[28px] border border-white/25 bg-[#1b7496]/92 backdrop-blur-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
      >
        {/* Fixed header */}
        <div className="shrink-0 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2
              id="customize-modal-title"
              className="font-bold text-[20px] text-white leading-tight truncate"
            >
              تخصيص الإضافات
            </h2>
            <p className="mt-1 text-[13px] text-white/65 truncate">{item.name}</p>
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

        {/* Mode toggle */}
        <div className="flex gap-1.5 p-1 rounded-full bg-white/10 border border-white/15">
          <button
            type="button"
            onClick={() => switchMode("all")}
            className={`flex-1 py-2 rounded-full text-[13px] font-bold transition ${
              mode === "all"
                ? "bg-glace-yellow text-[#1e6a7f]"
                : "text-white/70 hover:text-white"
            }`}
          >
            نفس الإضافات للكل
          </button>
          <button
            type="button"
            onClick={() => switchMode("perUnit")}
            className={`flex-1 py-2 rounded-full text-[13px] font-bold transition ${
              mode === "perUnit"
                ? "bg-glace-yellow text-[#1e6a7f]"
                : "text-white/70 hover:text-white"
            }`}
          >
            إضافات مختلفة لكل وحدة
          </button>
        </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
        {available.length === 0 ? (
          <p className="text-[14px] text-white/60 text-center py-6">
            لا توجد إضافات متاحة لهذا المنتج حالياً
          </p>
        ) : mode === "all" ? (
          <div className="space-y-2">
            {available.map((addon) => (
              <AddonRow
                key={addon.id}
                addon={addon}
                qty={sharedQty[addon.id] ?? 0}
                onChange={(v) => setSharedAddonQty(addon, v)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {unitQty.map((q, unitIndex) => (
              <div
                key={unitIndex}
                className="rounded-[18px] border border-white/12 bg-white/6 p-3"
              >
                <p className="mb-2.5 font-bold text-[13px] text-glace-yellow">
                  الوحدة {unitIndex + 1}
                </p>
                <div className="space-y-2">
                  {available.map((addon) => (
                    <AddonRow
                      key={addon.id}
                      addon={addon}
                      qty={q[addon.id] ?? 0}
                      onChange={(v) => setUnitAddonQty(unitIndex, addon, v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Fixed footer */}
        <div className="shrink-0 px-5 pt-4 pb-5 border-t border-white/10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-[13px] text-white/60">إجمالي الصنف</p>
          <p className="font-bold text-[20px] text-glace-yellow tabular-nums">
            {lineTotal.toFixed(2)} ₪
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
            onClick={handleSave}
            className="flex-[1.35] px-4 py-3 rounded-full font-bold text-[14px] bg-glace-yellow text-[#1e6a7f] hover:brightness-105 transition"
          >
            حفظ
          </button>
        </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function AddonRow({
  addon,
  qty,
  onChange,
}: {
  addon: IAddonOption;
  qty: number;
  onChange: (qty: number) => void;
}) {
  const selected = qty > 0;
  const isCounter = addon.type === "counter";

  // Counter addon: label + price + a +/− quantity stepper.
  if (isCounter) {
    return (
      <div
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] border transition ${
          selected
            ? "bg-glace-yellow/18 border-glace-yellow/60"
            : "bg-white/8 border-white/12"
        }`}
      >
        <span className="flex-1 font-medium text-[13px] text-white truncate">
          {addon.label}
        </span>
        <span className="shrink-0 text-[12px] font-bold text-white/70 tabular-nums">
          +{addon.price} ₪
        </span>
        <div className="flex items-center gap-1 shrink-0 bg-white/12 border border-white/20 rounded-full p-0.5">
          <button
            type="button"
            onClick={() => onChange(qty - 1)}
            disabled={qty <= 0}
            aria-label={`إنقاص ${addon.label}`}
            className="flex items-center justify-center size-7 rounded-full text-white hover:bg-white/15 disabled:opacity-30 transition cursor-pointer"
          >
            <Minus size={13} />
          </button>
          <span className="min-w-5 text-center font-bold text-[13px] text-white tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => onChange(qty + 1)}
            aria-label={`زيادة ${addon.label}`}
            className="flex items-center justify-center size-7 rounded-full bg-glace-yellow text-[#1e6a7f] hover:brightness-105 transition cursor-pointer"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
    );
  }

  // Toggle addon: on/off checkbox row.
  return (
    <button
      type="button"
      onClick={() => onChange(selected ? 0 : 1)}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] border text-right transition cursor-pointer ${
        selected
          ? "bg-glace-yellow/18 border-glace-yellow/60"
          : "bg-white/8 border-white/12 hover:bg-white/12 hover:border-white/25"
      }`}
    >
      <span
        className={`flex items-center justify-center size-5 rounded-md border-2 shrink-0 ${
          selected ? "bg-glace-yellow border-glace-yellow" : "border-white/35"
        }`}
      >
        {selected && <Check size={11} className="text-[#1e6a7f]" strokeWidth={3} />}
      </span>
      <span className="flex-1 font-medium text-[13px] text-white truncate">
        {addon.label}
      </span>
      <span className="shrink-0 text-[12px] font-bold text-white/70 tabular-nums">
        +{addon.price} ₪
      </span>
    </button>
  );
}
