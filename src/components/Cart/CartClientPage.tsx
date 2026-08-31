"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  NotebookPen,
  SlidersHorizontal,
  IceCreamCone,
  Sparkles,
  Clock,
} from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CustomizeAdditionsDialog from "@/components/Cart/CustomizeAdditionsDialog";
import { useMenuProducts, useMenuAddons } from "@/hooks/menu";
import type { IAddonOption } from "@/types/menu.types";
import {
  useCartStore,
  getLineItemTotal,
  getLineItemRows,
  type CartItem,
} from "@/store/cartStore";

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

/** Full line title — product name plus size/container/type, e.g. "بوظة كاسة وسط سبيشال". */
function itemFullTitle(item: CartItem): string {
  return [item.name, item.size, item.container, item.type]
    .filter(Boolean)
    .join(" ");
}

function ItemCard({
  item,
  index,
  addons,
}: {
  item: CartItem;
  index: number;
  addons?: IAddonOption[];
}) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const productLine = getLineItemTotal(item);
  const canCustomize = !!addons && addons.length > 0;

  return (
    <article
      className="group relative rounded-[22px] border border-white/12 bg-white/[0.09] hover:bg-white/[0.13] hover:border-white/20 p-4 sm:p-5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
    >
      {/* Header row: image + title + line total */}
      <div className="flex items-start gap-4">
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
          <h3 className="font-bold text-[16px] sm:text-[17px] text-white leading-snug">
            {itemFullTitle(item)}
          </h3>
        </div>
      </div>

      {/* Body — full width on mobile, indented beside the image on md+ (image 56px + gap 16px) */}
      <div className="md:ps-[72px]">
      <div className="flex flex-col gap-2 mt-3 mb-3">
        {(item.size || item.container || item.type) && (
          <div className="flex flex-wrap gap-1.5">
            {item.size && (
              <span className="bg-white/14 px-2.5 py-1 rounded-lg text-[12px] font-medium text-white/90">
                {item.size}
              </span>
            )}
            {item.container && (
              <span className="bg-white/14 px-2.5 py-1 rounded-lg text-[12px] font-medium text-white/90">
                {item.container}
              </span>
            )}
            {item.type && (
              <span className="bg-white/14 px-2.5 py-1 rounded-lg text-[12px] font-medium text-white/90">
                {item.type}
              </span>
            )}
          </div>
        )}

        {item.selections.some((s) => s.kind === "flavor" || s.kind === "mix") && (
          <div className="rounded-[14px] border border-glace-yellow/30 bg-glace-yellow/8 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-glace-yellow">
                <IceCreamCone size={14} />
                النكهات:
              </span>
              {item.selections
                .filter((s) => s.kind === "flavor" || s.kind === "mix")
                .map((s) => (
                  <span
                    key={`${s.kind}-${s.id}`}
                    className="bg-glace-yellow/18 text-glace-yellow px-2.5 py-1 rounded-lg text-[13px] font-semibold"
                  >
                    {s.qty > 1 ? `${s.label} ×${s.qty}` : s.label}
                  </span>
                ))}
            </div>
          </div>
        )}

        {item.selections.some((s) => s.kind === "addon") && (
          <div className="rounded-[14px] border border-orange-400/30 bg-orange-400/8 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-orange-300">
                <Sparkles size={14} />
                الإضافات:
              </span>
              {item.selections
                .filter((s) => s.kind === "addon")
                .map((s) => (
                  <span
                    key={`addon-${s.id}`}
                    className="bg-orange-400/18 text-orange-300 px-2.5 py-1 rounded-lg text-[13px] font-semibold"
                  >
                    {s.qty > 1 ? `${s.label} ×${s.qty}` : s.label}
                  </span>
                ))}
            </div>
          </div>
        )}

        {(item.flatSelections?.length ?? 0) > 0 && (
          <div className="rounded-[14px] border border-orange-400/30 bg-orange-400/8 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-orange-300">
                <Sparkles size={14} />
                إضافات ثابتة لكامل الطلبية:
              </span>
              {item.flatSelections!.map((s) => (
                <span
                  key={`flat-addon-${s.id}`}
                  className="bg-orange-400/18 text-orange-300 px-2.5 py-1 rounded-lg text-[13px] font-semibold"
                >
                  {s.qty > 1 ? `${s.label} ×${s.qty}` : s.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {item.units &&
        (() => {
          // Group units that ended up with the identical addon picks so
          // "وحدة 1، 2، 3" shows once instead of repeating the same line.
          const groups: { unitNumbers: number[]; label: string }[] = [];
          item.units.forEach((unit, i) => {
            const addonLabels = unit.selections
              .filter((s) => s.kind === "addon")
              .map((s) => (s.qty > 1 ? `${s.label} ×${s.qty}` : s.label));
            const label =
              addonLabels.length > 0 ? addonLabels.join("، ") : "بدون إضافات";
            const existing = groups.find((g) => g.label === label);
            if (existing) existing.unitNumbers.push(i + 1);
            else groups.push({ unitNumbers: [i + 1], label });
          });
          // Units without addons last, regardless of where they fell.
          groups.sort((a, b) =>
            a.label === "بدون إضافات" ? 1 : b.label === "بدون إضافات" ? -1 : 0,
          );
          return (
            <div className="mb-3 space-y-2 rounded-[14px] border border-white/10 bg-white/5 p-3">
              {groups.map((g) => (
                <div
                  key={g.unitNumbers.join(",")}
                  className="flex items-start gap-2 text-[16px] leading-relaxed"
                >
                  <span className="shrink-0 font-bold text-glace-yellow tabular-nums">
                    {g.unitNumbers.length > 1
                      ? `${g.unitNumbers.length} وحدات:`
                      : `وحدة ${g.unitNumbers[0]}:`}
                  </span>
                  <span className="text-white/70">{g.label}</span>
                </div>
              ))}
            </div>
          );
        })()}

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {item.units ? (
              <p className="inline-flex items-center bg-white/10 px-2.5 py-1 rounded-lg text-[12px] font-medium text-white/70 w-fit">
                {item.quantity} وحدات · إضافات مخصّصة
              </p>
            ) : (
              <p className="inline-flex items-center bg-white/10 px-2.5 py-1 rounded-lg text-[12px] font-medium text-white/70 tabular-nums w-fit">
                {(item.unitPrice + (item.addonTotal ?? 0)).toFixed(2)} ₪ للوحدة
              </p>
            )}
            <p className="flex items-baseline gap-1 font-bold text-[17px] text-glace-yellow tabular-nums">
              <span className="text-[12px] font-medium text-white/70">
                الإجمالي:
              </span>
              {productLine.toFixed(2)} ₪
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <QtyControl
              value={item.quantity}
              onDec={() => updateQuantity(item.id, item.quantity - 1)}
              onInc={() => updateQuantity(item.id, item.quantity + 1)}
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              aria-label="حذف المنتج"
              className="flex items-center justify-center size-9 rounded-full border border-white/15 bg-white/8 text-white/50 hover:border-rose-400/50 hover:bg-rose-500/20 hover:text-rose-200 transition cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        {canCustomize && (
          <button
            type="button"
            onClick={() => setCustomizeOpen(true)}
            className="flex w-full sm:w-auto sm:self-start items-center justify-center gap-1.5 rounded-full bg-glace-yellow px-3.5 py-2.5 text-[12px] font-bold text-[#1e6a7f] hover:bg-yellow-300 shadow-[0_4px_14px_rgba(244,228,81,0.25)] transition cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            تخصيص الإضافات
          </button>
        )}
      </div>
      </div>

      {canCustomize && (
        <CustomizeAdditionsDialog
          open={customizeOpen}
          item={item}
          addons={addons ?? []}
          onClose={() => setCustomizeOpen(false)}
        />
      )}
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

function CartLoading() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[28px] border border-white/12 bg-white/12 backdrop-blur-xl p-5 sm:p-6">
        <div className="h-6 w-28 bg-white/15 rounded-lg animate-pulse mb-5" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-[22px] border border-white/12 bg-white/[0.06] p-4 sm:p-5 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-2xl bg-white/12 shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-5 w-1/2 bg-white/12 rounded-lg" />
                  <div className="h-4 w-1/4 bg-white/10 rounded-lg" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="h-4 w-24 bg-white/10 rounded-lg" />
                <div className="h-9 w-28 bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
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
  const items = useCartStore((s) => s.items);
  const cartAddons = useCartStore((s) => s.cartAddons);
  const cartAddonTotal = useCartStore((s) => s.cartAddonTotal);
  const discount = useCartStore((s) => s.discount);
  const subtotal = useCartStore((s) => s.subtotal);

  return (
    <aside className="rounded-[28px] border border-white/15 bg-white/14 backdrop-blur-xl p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
      <h2 className="mb-3 text-[20px] font-bold">ملخص الطلب</h2>

      <div className="flex items-center gap-2 mb-5 text-glace-yellow bg-glace-yellow/10 border border-glace-yellow/25 rounded-[14px] px-3.5 py-2.5">
        <Clock size={16} className="shrink-0" />
        <span className="text-[13px] font-semibold leading-snug">
          مدة تحضير الطلب بالكامل تتراوح بين 5-25 دقيقة
        </span>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 bg-white/8 border border-white/10 rounded-[18px] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex-1 min-w-0 text-[15px] font-bold leading-snug">
                {itemFullTitle(item)}
              </span>
              <span className="shrink-0 font-bold text-glace-yellow text-[15px] tabular-nums">
                {getLineItemTotal(item).toFixed(2)} ₪
              </span>
            </div>

            <div className="w-full rounded-[12px] border border-white/10 overflow-hidden text-[12.5px]">
              <div className="grid grid-cols-[26%_26%_12%_18%_18%] bg-white/8 text-white/60 font-semibold">
                <div className="px-2 py-2 text-start">النوع</div>
                <div className="px-2 py-2 text-start">الطعمة</div>
                <div className="px-1.5 py-2 text-center">العدد</div>
                <div className="px-1.5 py-2 text-center">
                  <span className="sm:hidden">السعر</span>
                  <span className="hidden sm:inline">سعر الوحدة</span>
                </div>
                <div className="px-2 py-2 text-end">المجموع</div>
              </div>
              {getLineItemRows(item).map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[26%_26%_12%_18%_18%] border-t border-white/10 text-white/80"
                >
                  <div className="px-2 py-2 break-words">{row.addons}</div>
                  <div className="px-2 py-2 break-words">{row.flavor}</div>
                  <div className="px-1.5 py-2 text-center tabular-nums">
                    {row.qty}
                  </div>
                  <div className="px-1.5 py-2 text-center tabular-nums">
                    {row.unitPrice.toFixed(2)} ₪
                  </div>
                  <div className="px-2 py-2 text-end font-semibold text-white tabular-nums">
                    {row.total.toFixed(2)} ₪
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {cartAddonTotal > 0 && (
          <div className="flex justify-between items-center gap-2 text-[14px] text-glace-yellow bg-glace-yellow/8 border border-glace-yellow/20 rounded-[18px] p-3">
            <span>
              إضافات السلة
              {cartAddons.length > 0 ? ` (${cartAddons.join(" · ")})` : ""}
            </span>
            <span className="shrink-0 tabular-nums">
              +{cartAddonTotal.toFixed(2)} ₪
            </span>
          </div>
        )}
      </div>

      <div className="rounded-[18px] bg-white/6 border border-white/10 p-4 mb-5">
        {discount > 0 && (
          <div className="flex justify-between text-[14px] text-glace-yellow mb-2">
            <span>الخصم</span>
            <span className="tabular-nums">-{discount.toFixed(2)} ₪</span>
          </div>
        )}
        <div className="flex justify-between items-end">
          <span className="text-[15px] text-white/70">المجموع الجزئي</span>
          <span className="text-glace-yellow text-[28px] font-bold leading-none tabular-nums">
            {subtotal().toFixed(2)}
            <span className="text-[16px] ms-1">₪</span>
          </span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="flex items-center justify-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[16px] w-full py-3.5 rounded-[18px] transition-all shadow-[0_8px_28px_rgba(244,228,81,0.32)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.45)] hover:-translate-y-0.5"
      >
        إتمام الطلب
        <ChevronLeft size={18} />
      </Link>
    </aside>
  );
}

export default function CartClientPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPieces = items.reduce((sum, i) => sum + i.quantity, 0);

  // The cart is persisted to localStorage and hydrates asynchronously — show a
  // loading state until then so the empty view doesn't flash on first paint.
  // Only touch `persist` in an effect: it is undefined during SSR/prerender.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const persistApi = useCartStore.persist;
    if (!persistApi) {
      setHydrated(true);
      return;
    }
    if (persistApi.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return persistApi.onFinishHydration(() => setHydrated(true));
  }, []);

  // Shared additions catalog from the backend (GET /menu/addons) — the options
  // offered in the "تخصيص الإضافات" flow.
  const { data: sharedAddons } = useMenuAddons();

  // A product MAY still ship its own addons catalog (overrides the shared one).
  const { data: products } = useMenuProducts();
  const addonsByProductId = new Map<string, IAddonOption[]>(
    (products ?? [])
      .filter((p) => p.addons && p.addons.length > 0)
      .map((p) => [p.id, p.addons as IAddonOption[]]),
  );
  const slugByProductId = new Map<string, string>(
    (products ?? []).map((p) => [p.id, p.slug]),
  );

  // "تخصيص الإضافات" is only offered for cup ice cream in a "كاسة"/"بسكوت"
  // container, or the family-size product — regardless of category or
  // whether the product ships its own addons catalog. Every other line
  // (pancake, milkshake, ...) never gets this button.
  const CUP_CONTAINERS = ["كاسة", "بسكوت"];

  function resolveAddons(item: CartItem): IAddonOption[] {
    const productId = item.productId;
    const isFamilyProduct = slugByProductId.get(productId) === "family";
    const isCupContainer = !!item.container && CUP_CONTAINERS.includes(item.container);
    if (!isFamilyProduct && !isCupContainer) return [];
    // A product's own catalog overrides the shared one; both come from the API.
    const productSpecific = addonsByProductId.get(productId);
    if (productSpecific && productSpecific.length > 0) return productSpecific;
    return sharedAddons ?? [];
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,#4eb4d4_0%,#388dab_45%,#2f7a96_100%)]">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-28 lg:pb-12 max-w-6xl">
        {/* Header */}
        <header className="mb-8 sm:mb-10 animate-in fade-in duration-500">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
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

        {!hydrated ? (
          <CartLoading />
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="w-full flex flex-col gap-5 min-w-0">
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
                    <ItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      addons={resolveAddons(item)}
                    />
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

              <CartOrderNote />
            </div>

            <div className="w-full">
              <OrderSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
