"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  ChevronDown,
  Check,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import {
  useCartStore,
  parseAddonLine,
  calcCatalogAddonTotal,
  type CartItem,
} from "@/store/cartStore";
import {
  EMPTY_CONE_ADDON,
  MAX_MULTI_ADDONS,
  MULTI_CHOICE_ADDONS,
} from "@/data/OrderData";

const CONE_NAME = EMPTY_CONE_ADDON.name;

function formatConeLine(qty: number) {
  if (qty <= 0) return null;
  return qty === 1 ? CONE_NAME : `${CONE_NAME} ×${qty}`;
}

function getConeQty(addonLines: string[]) {
  const line = addonLines.find((a) => parseAddonLine(a).name === CONE_NAME);
  return line ? parseAddonLine(line).qty : 0;
}

function getMultiSelected(addonLines: string[]) {
  return addonLines
    .map(parseAddonLine)
    .filter((a) => a.name !== CONE_NAME)
    .map((a) => a.name);
}

function getAddonSummary(addonLines: string[]) {
  const coneQty = getConeQty(addonLines);
  const multiSelected = getMultiSelected(addonLines);
  return [
    ...(coneQty > 0
      ? [`${CONE_NAME}${coneQty > 1 ? ` ×${coneQty}` : ""}`]
      : []),
    ...multiSelected,
  ];
}

/** Collapse repeated flavors into "flavor ×n" labels */
function flavorFrequencyLabels(flavors: string[]) {
  const counts = new Map<string, number>();
  for (const flavor of flavors) {
    counts.set(flavor, (counts.get(flavor) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([flavor, count]) =>
    count > 1 ? `${flavor} ×${count}` : flavor,
  );
}

function QtyControl({
  value,
  onDec,
  onInc,
  disabledDec,
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  disabledDec?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1 bg-white/12 border border-white/20 rounded-full p-1">
      <button
        type="button"
        onClick={onDec}
        disabled={disabledDec}
        className="flex items-center justify-center size-8 rounded-full text-white hover:bg-white/15 disabled:opacity-30 transition cursor-pointer"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-7 text-center font-bold text-[15px] text-white tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={onInc}
        className="flex items-center justify-center size-8 rounded-full bg-glace-yellow text-[#1e6a7f] hover:brightness-105 transition cursor-pointer"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function ItemCard({ item, index }: { item: CartItem; index: number }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const productLine =
    (item.unitPrice + (item.addonTotal ?? 0)) * item.quantity;

  return (
    <article
      className="group relative rounded-[22px] border border-white/12 bg-white/[0.09] hover:bg-white/[0.13] hover:border-white/20 p-4 sm:p-5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
    >
      <div className="flex gap-4">
        <div className="relative flex items-center justify-center shrink-0 size-14 rounded-2xl bg-linear-to-br from-white/20 to-white/5 border border-white/15 overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={56}
              height={56}
              className="size-full object-contain p-1"
            />
          ) : (
            <ShoppingCart
              size={22}
              strokeWidth={1.6}
              className="text-glace-yellow"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-bold text-[16px] sm:text-[17px] text-white leading-snug">
              {item.name}
            </h3>
            <p className="shrink-0 font-bold text-[17px] text-glace-yellow tabular-nums">
              {productLine.toFixed(2)} ₪
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.size && (
              <span className="bg-white/10 px-2.5 py-1 rounded-lg text-[11px] text-white/75">
                {item.size}
              </span>
            )}
            {item.type && (
              <span className="bg-white/10 px-2.5 py-1 rounded-lg text-[11px] text-white/75">
                {item.type}
              </span>
            )}
            {item.flavors &&
              flavorFrequencyLabels(item.flavors).map((label) => (
                <span
                  key={label}
                  className="bg-glace-yellow/15 text-glace-yellow px-2.5 py-1 rounded-lg text-[11px] font-medium"
                >
                  {label}
                </span>
              ))}
            {item.addons?.map((addon) => (
              <span
                key={addon}
                className="bg-white/8 px-2.5 py-1 rounded-lg text-[11px] text-white/65"
              >
                {addon}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[12px] text-white/50 tabular-nums">
              {(item.unitPrice + (item.addonTotal ?? 0)).toFixed(2)} ₪ للوحدة
            </p>
            <div className="flex items-center gap-2">
              <QtyControl
                value={item.quantity}
                onDec={() => updateQuantity(item.id, item.quantity - 1)}
                onInc={() => updateQuantity(item.id, item.quantity + 1)}
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label="حذف المنتج"
                className="flex items-center justify-center size-9 rounded-full border border-rose-400/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/30 hover:border-rose-400/60 hover:text-rose-100 transition cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function CartOrderNote() {
  const orderNote = useCartStore((s) => s.orderNote);
  const setOrderNote = useCartStore((s) => s.setOrderNote);

  return (
    <section className="rounded-[28px] border border-white/12 bg-white/12 backdrop-blur-xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center size-10 rounded-xl bg-white/10 border border-white/15 text-glace-yellow">
          <NotebookPen size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-white text-[18px] font-bold">ملاحظة الطلب</h2>
            <span className="text-[11px] text-white/50">اختياري</span>
          </div>
          <p className="text-[12px] text-white/50 mt-0.5">
            تُرسل مع الطلب بالكامل
          </p>
        </div>
      </div>
      <textarea
        value={orderNote}
        onChange={(e) => setOrderNote(e.target.value)}
        placeholder="مثال: بدون مكسرات، أو توصيل بعد الساعة 7..."
        rows={3}
        className="w-full bg-white/8 border border-white/15 focus:border-glace-yellow/40 focus:bg-white/10 rounded-[18px] px-4 py-3 text-[14px] text-white placeholder:text-white/35 outline-none resize-none transition-colors"
      />
    </section>
  );
}

function AddonChip({
  selected,
  disabled,
  label,
  price,
  onClick,
}: {
  selected: boolean;
  disabled?: boolean;
  label: string;
  price: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] border text-right transition ${
        selected
          ? "bg-glace-yellow/18 border-glace-yellow/60 shadow-[0_0_0_1px_rgba(244,228,81,0.15)]"
          : disabled
            ? "opacity-30 cursor-not-allowed bg-white/5 border-white/8"
            : "bg-white/8 border-white/12 hover:bg-white/12 hover:border-white/25 cursor-pointer"
      }`}
    >
      <span
        className={`flex items-center justify-center size-5 rounded-md border-2 shrink-0 ${
          selected
            ? "bg-glace-yellow border-glace-yellow"
            : "border-white/35"
        }`}
      >
        {selected && (
          <Check size={11} className="text-[#1e6a7f]" strokeWidth={3} />
        )}
      </span>
      <span className="flex-1 font-medium text-[13px] text-white truncate">
        {label}
      </span>
      <span className="shrink-0 text-[12px] font-bold text-white/70 tabular-nums">
        {price} ₪
      </span>
    </button>
  );
}

function CartAddonsSection() {
  const [open, setOpen] = useState(false);
  const lockScrollY = useRef<number | null>(null);
  const cartAddons = useCartStore((s) => s.cartAddons);
  const cartAddonTotal = useCartStore((s) => s.cartAddonTotal);
  const setCartAddons = useCartStore((s) => s.setCartAddons);

  const summaryParts = getAddonSummary(cartAddons);
  const coneQty = getConeQty(cartAddons);
  const multiSelected = getMultiSelected(cartAddons);
  const nutAddons = MULTI_CHOICE_ADDONS.filter((a) => !a.name.startsWith("صوص"));
  const sauceAddons = MULTI_CHOICE_ADDONS.filter((a) =>
    a.name.startsWith("صوص"),
  );

  useLayoutEffect(() => {
    if (lockScrollY.current == null) return;
    const y = lockScrollY.current;
    lockScrollY.current = null;

    let raf = 0;
    const start = performance.now();
    const hold = (now: number) => {
      window.scrollTo({ top: y, left: 0, behavior: "auto" });
      // Hold through the 300ms grid expand so scroll anchoring cannot jump
      if (now - start < 320) raf = requestAnimationFrame(hold);
    };
    raf = requestAnimationFrame(hold);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  function commitAddons(cone: number, multi: string[]) {
    const safeCone = Math.max(0, Math.min(cone, 20));
    const safeMulti = multi.slice(0, MAX_MULTI_ADDONS);
    const next: string[] = [];
    const coneLine = formatConeLine(safeCone);
    if (coneLine) next.push(coneLine);
    next.push(...safeMulti);
    setCartAddons(next, calcCatalogAddonTotal(next));
  }

  function setConeQty(nextQty: number) {
    commitAddons(nextQty, multiSelected);
  }

  function toggleMulti(name: string) {
    if (multiSelected.includes(name)) {
      commitAddons(
        coneQty,
        multiSelected.filter((n) => n !== name),
      );
      return;
    }
    if (multiSelected.length >= MAX_MULTI_ADDONS) return;
    commitAddons(coneQty, [...multiSelected, name]);
  }

  function toggleOpen() {
    lockScrollY.current = window.scrollY;
    setOpen((v) => !v);
  }

  return (
    <section className="rounded-[28px] border border-white/12 bg-white/12 backdrop-blur-xl overflow-hidden [overflow-anchor:none]">
      <button
        type="button"
        onClick={toggleOpen}
        onMouseDown={(e) => {
          // Avoid focus scrollIntoView when the panel expands
          if (e.button === 0) e.preventDefault();
        }}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-5 sm:p-6 text-right hover:bg-white/[0.04] transition cursor-pointer"
      >
        <div className="flex items-center justify-center size-10 rounded-xl bg-glace-yellow/15 border border-glace-yellow/25 text-glace-yellow shrink-0">
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-white text-[18px] font-bold">إضافات الطلب</h2>
            <span className="text-[11px] text-white/45">مرة واحدة</span>
          </div>
          <p className="text-[13px] text-white/55 truncate">
            {summaryParts.length > 0
              ? summaryParts.join(" · ")
              : "بسكوت · مكسرات · صوصات"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {cartAddonTotal > 0 && (
            <span className="font-bold text-[14px] text-glace-yellow tabular-nums">
              +{cartAddonTotal} ₪
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-white/50 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-5 border-t border-white/10">
            <div className="pt-4">
              <p className="mb-2.5 text-[12px] font-medium text-white/50">
                بسكوت مخروط
              </p>
              <div className="flex items-center gap-3 rounded-[18px] border border-white/12 bg-white/8 px-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[14px] text-white">{CONE_NAME}</p>
                  <p className="text-[12px] text-white/50 mt-0.5 tabular-nums">
                    {EMPTY_CONE_ADDON.price} ₪ للقطعة
                    {coneQty > 0 && (
                      <span className="text-glace-yellow">
                        {" "}
                        · {coneQty * EMPTY_CONE_ADDON.price} ₪
                      </span>
                    )}
                  </p>
                </div>
                <QtyControl
                  value={coneQty}
                  onDec={() => setConeQty(coneQty - 1)}
                  onInc={() => setConeQty(coneQty + 1)}
                  disabledDec={coneQty <= 0}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[12px] font-medium text-white/50">
                  مكسرات وصوصات
                </p>
                <p
                  className={`text-[12px] font-bold tabular-nums ${
                    multiSelected.length >= MAX_MULTI_ADDONS
                      ? "text-glace-yellow"
                      : "text-white/40"
                  }`}
                >
                  {multiSelected.length}/{MAX_MULTI_ADDONS}
                </p>
              </div>

              {nutAddons.length > 0 && (
                <div className="mb-3">
                  <p className="mb-2 text-[11px] text-white/35">مكسرات</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {nutAddons.map((addon) => {
                      const selected = multiSelected.includes(addon.name);
                      return (
                        <AddonChip
                          key={addon.id}
                          selected={selected}
                          disabled={
                            !selected &&
                            multiSelected.length >= MAX_MULTI_ADDONS
                          }
                          label={addon.name}
                          price={addon.price}
                          onClick={() => toggleMulti(addon.name)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {sauceAddons.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] text-white/35">صوصات</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sauceAddons.map((addon) => {
                      const selected = multiSelected.includes(addon.name);
                      return (
                        <AddonChip
                          key={addon.id}
                          selected={selected}
                          disabled={
                            !selected &&
                            multiSelected.length >= MAX_MULTI_ADDONS
                          }
                          label={addon.name}
                          price={addon.price}
                          onClick={() => toggleMulti(addon.name)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {cartAddonTotal > 0 && (
              <div className="flex items-center justify-between rounded-[16px] bg-glace-yellow/10 border border-glace-yellow/20 px-4 py-3">
                <p className="text-[13px] text-white/70">مجموع الإضافات</p>
                <p className="font-bold text-[16px] text-glace-yellow tabular-nums">
                  +{cartAddonTotal} ₪
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyCart() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-xl px-6 py-16 sm:py-20 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,228,81,0.12),transparent_55%)]" />
      <div className="relative flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center justify-center size-24 rounded-full bg-white/10 border border-white/15 text-glace-yellow shadow-[0_0_40px_rgba(244,228,81,0.15)]">
          <ShoppingCart size={40} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-white text-[28px] sm:text-[32px] font-bold mb-2">
            سلتك فارغة
          </h2>
          <p className="text-white/60 text-[15px] max-w-xs mx-auto">
            اختَر من منيو Glace وابدأ طلبك بخطوة واحدة
          </p>
        </div>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[15px] px-8 py-3.5 rounded-full transition-all shadow-[0_8px_28px_rgba(244,228,81,0.3)] hover:-translate-y-0.5"
        >
          <ShoppingCart size={16} />
          تصفح المنيو
        </Link>
      </div>
    </div>
  );
}

function OrderSummary() {
  const itemsSubtotal = useCartStore((s) => s.itemsSubtotal);
  const cartAddonTotal = useCartStore((s) => s.cartAddonTotal);
  const cartAddons = useCartStore((s) => s.cartAddons);
  const subtotal = useCartStore((s) => s.subtotal);

  return (
    <aside className="lg:sticky lg:top-28 rounded-[28px] border border-white/15 bg-white/14 backdrop-blur-xl p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
      <h2 className="text-[20px] font-bold mb-5">ملخص الطلب</h2>

      <div className="space-y-3 mb-5">
        <div className="flex justify-between text-[14px]">
          <span className="text-white/65">المنتجات</span>
          <span className="font-semibold tabular-nums">
            {itemsSubtotal().toFixed(2)} ₪
          </span>
        </div>

        {cartAddonTotal > 0 && (
          <div className="rounded-[14px] bg-white/6 border border-white/10 px-3 py-2.5 space-y-1.5">
            <div className="flex justify-between text-[14px]">
              <span className="text-white/65">إضافات السلة</span>
              <span className="font-semibold text-glace-yellow tabular-nums">
                +{cartAddonTotal.toFixed(2)} ₪
              </span>
            </div>
            <p className="text-[11px] text-white/45 leading-relaxed">
              {getAddonSummary(cartAddons).join(" · ")}
            </p>
          </div>
        )}
      </div>

      <div className="h-px bg-white/15 mb-5" />

      <div className="flex justify-between items-end mb-6">
        <span className="text-[15px] text-white/70">الإجمالي</span>
        <span className="text-glace-yellow text-[28px] font-bold leading-none tabular-nums">
          {subtotal().toFixed(2)}
          <span className="text-[16px] ms-1">₪</span>
        </span>
      </div>

      <Link
        href="/checkout"
        className="flex items-center justify-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[16px] w-full py-3.5 rounded-[18px] transition-all shadow-[0_8px_28px_rgba(244,228,81,0.32)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.45)] hover:-translate-y-0.5"
      >
        إتمام الطلب
        <ChevronLeft size={18} />
      </Link>
      <p className="text-white/35 text-[11px] text-center mt-3">
        الأسعار بالشيكل الإسرائيلي ₪
      </p>
    </aside>
  );
}

export default function CartClientPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPieces = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,#4eb4d4_0%,#388dab_45%,#2f7a96_100%)]">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-20 max-w-6xl">
        {/* Header */}
        <header className="mb-8 sm:mb-10 animate-in fade-in duration-500">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-glace-yellow/90 text-[13px] font-medium mb-1.5 tracking-wide">
                Glace
              </p>
              <h1 className="text-white text-[36px] sm:text-[46px] font-bold leading-none">
                سلة التسوق
              </h1>
              {items.length > 0 && (
                <p className="text-white/55 text-[14px] mt-2">
                  {items.length} صنف · {totalPieces} قطعة
                </p>
              )}
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-[14px] font-medium transition-colors"
            >
              <ArrowRight size={15} />
              متابعة التسوق
            </Link>
          </div>
        </header>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <div className="flex-1 w-full flex flex-col gap-5 min-w-0">
              {/* Products */}
              <section className="rounded-[28px] border border-white/12 bg-white/12 backdrop-blur-xl p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white text-[18px] font-bold">المنتجات</h2>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-rose-400/35 bg-rose-500/12 text-rose-300 hover:bg-rose-500/25 hover:border-rose-400/55 hover:text-rose-100 text-[13px] font-medium transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                    حذف الكل
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map((item, index) => (
                    <ItemCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </section>

              <Link
                href="/menu"
                className="group relative flex items-center gap-4 rounded-[24px] border border-dashed border-glace-yellow/45 bg-glace-yellow/10 hover:bg-glace-yellow/18 hover:border-glace-yellow/70 px-5 py-4 sm:px-6 transition-all duration-300 overflow-hidden"
              >
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,220,80,0.18),transparent_55%)] opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center size-12 rounded-2xl bg-glace-yellow text-[#1e6a7f] shadow-[0_8px_20px_rgba(255,210,60,0.35)] group-hover:scale-105 transition-transform">
                  <Plus size={22} strokeWidth={2.4} />
                </span>
                <span className="relative flex-1 min-w-0 text-right">
                  <span className="block font-bold text-[16px] sm:text-[17px] text-white group-hover:text-glace-yellow transition-colors">
                    إضافة منتج
                  </span>
                  <span className="block text-[13px] text-white/55 mt-0.5">
                    تصفّح القائمة وأضف المزيد للسلة
                  </span>
                </span>
                <ChevronLeft
                  size={18}
                  className="relative shrink-0 text-glace-yellow/70 group-hover:text-glace-yellow group-hover:-translate-x-0.5 transition-all"
                />
              </Link>

              <CartAddonsSection />
              <CartOrderNote />
            </div>

            <div className="w-full lg:w-[340px] shrink-0">
              <OrderSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
