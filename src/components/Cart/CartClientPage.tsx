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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import CustomizeAdditionsDialog from "@/components/Cart/CustomizeAdditionsDialog";
import { useMenuProducts, useMenuAddons } from "@/hooks/menu";
import { useStoreStatus } from "@/hooks/store";
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
    <div className="inline-flex items-center gap-1 bg-white/12 p-1 border border-white/20 rounded-full">
      <button
        type="button"
        onClick={onDec}
        disabled={disabledDec}
        className="flex justify-center items-center hover:bg-white/15 disabled:opacity-30 rounded-full size-8 text-white transition cursor-pointer"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-7 font-bold tabular-nums text-[15px] text-white text-center">
        {value}
      </span>
      <button
        type="button"
        onClick={onInc}
        className="flex justify-center items-center bg-glace-yellow hover:brightness-105 rounded-full size-8 text-[#1e6a7f] transition cursor-pointer"
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
      className="group slide-in-from-bottom-2 relative bg-white/[0.09] hover:bg-white/[0.13] p-3 border border-white/12 hover:border-white/20 rounded-[18px] transition-all animate-in duration-300 fade-in"
      style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
    >
      {/* Header row: image + title + line total */}
      <div className="flex items-start gap-3">
        <div className="relative flex justify-center items-center bg-linear-to-br from-white/20 to-white/5 border border-white/15 rounded-xl size-12 overflow-hidden shrink-0">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={48}
              height={48}
              className="p-1 size-full object-contain"
            />
          ) : (
            <ShoppingCart
              size={18}
              strokeWidth={1.6}
              className="text-glace-yellow"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] text-white sm:text-[16px] leading-snug">
            {itemFullTitle(item)}
          </h3>
        </div>
      </div>

      {/* Body — full width on mobile, indented beside the image on md+ (image 48px + gap 12px) */}
      <div className="md:ps-[60px]">
        <div className="flex flex-col gap-1.5 mt-2 mb-2">
          {item.selections.some(
            (s) =>
              s.kind === "flavor" || s.kind === "mix" || s.kind === "mixItem",
          ) && (
            <div className="bg-glace-yellow/8 px-2 py-2 border border-glace-yellow/30 rounded-[12px]">
              <div className="flex flex-wrap items-center gap-1">
                <span className="flex items-center gap-1 font-bold text-[11px] text-glace-yellow">
                  <IceCreamCone size={12} />
                  النكهات:
                </span>
                {item.selections
                  .filter(
                    (s) =>
                      s.kind === "flavor" ||
                      s.kind === "mix" ||
                      s.kind === "mixItem",
                  )
                  .map((s) => (
                    <span
                      key={`${s.kind}-${s.id}`}
                      className="bg-glace-yellow/18 px-1.5 py-0.5 rounded font-semibold text-[11px] text-glace-yellow"
                    >
                      {s.qty > 1 ? `${s.label} ×${s.qty}` : s.label}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {item.selections.some((s) => s.kind === "addon") && (
            <div className="bg-orange-400/8 px-2 py-2 border border-orange-400/30 rounded-[12px]">
              <div className="flex flex-wrap items-center gap-1">
                <span className="flex items-center gap-1 font-bold text-[11px] text-orange-300">
                  <Sparkles size={12} />
                  الإضافات:
                </span>
                {item.selections
                  .filter((s) => s.kind === "addon")
                  .map((s) => (
                    <span
                      key={`addon-${s.id}`}
                      className="bg-orange-400/18 px-1.5 py-0.5 rounded font-semibold text-[11px] text-orange-300"
                    >
                      {s.qty > 1 ? `${s.label} ×${s.qty}` : s.label}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {(item.flatSelections?.length ?? 0) > 0 && (
            <div className="bg-orange-400/8 px-2 py-2 border border-orange-400/30 rounded-[12px]">
              <div className="flex flex-wrap items-center gap-1">
                <span className="flex items-center gap-1 font-bold text-[11px] text-orange-300">
                  <Sparkles size={12} />
                  إضافات ثابتة لكامل الطلبية:
                </span>
                {item.flatSelections!.map((s) => (
                  <span
                    key={`flat-addon-${s.id}`}
                    className="bg-orange-400/18 px-1.5 py-0.5 rounded font-semibold text-[11px] text-orange-300"
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
              a.label === "بدون إضافات"
                ? 1
                : b.label === "بدون إضافات"
                  ? -1
                  : 0,
            );
            return (
              <div className="space-y-2 bg-white/5 mb-3 p-3 border border-white/10 rounded-[14px]">
                {groups.map((g) => (
                  <div
                    key={g.unitNumbers.join(",")}
                    className="flex items-start gap-2 text-[16px] leading-relaxed"
                  >
                    <span className="font-bold tabular-nums text-glace-yellow shrink-0">
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
          <div className="flex justify-between items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {item.units ? (
                <p className="inline-flex items-center bg-white/10 px-2.5 py-1 rounded-lg w-fit font-medium text-[12px] text-white/70">
                  {item.quantity} وحدات · إضافات مخصّصة
                </p>
              ) : (
                <p className="inline-flex items-center bg-white/10 px-2.5 py-1 rounded-lg w-fit font-medium tabular-nums text-[12px] text-white/70">
                  {(item.unitPrice + (item.addonTotal ?? 0)).toFixed(2)} ₪
                  للوحدة
                </p>
              )}
              <p className="flex items-baseline gap-1 font-bold tabular-nums text-[17px] text-glace-yellow">
                <span className="font-medium text-[12px] text-white/70">
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
                className="flex justify-center items-center bg-white/8 hover:bg-rose-500/20 border border-white/15 hover:border-rose-400/50 rounded-full size-9 text-white/50 hover:text-rose-200 transition cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          {canCustomize && (
            <button
              type="button"
              onClick={() => setCustomizeOpen(true)}
              className="flex justify-center items-center sm:self-start gap-1.5 bg-glace-yellow hover:bg-yellow-300 shadow-[0_4px_14px_rgba(244,228,81,0.25)] px-3.5 py-2.5 rounded-full w-full sm:w-auto font-bold text-[#1e6a7f] text-[12px] transition cursor-pointer"
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
    <section className="bg-white/12 backdrop-blur-xl p-5 sm:p-6 border border-white/12 rounded-[28px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex justify-center items-center bg-white/10 border border-white/15 rounded-xl size-10 text-glace-yellow">
          <NotebookPen size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[18px] text-white">ملاحظة الطلب</h2>
            <span className="text-[11px] text-white/50">اختياري</span>
          </div>
          <p className="mt-0.5 text-[12px] text-white/50">
            تُرسل مع الطلب بالكامل
          </p>
        </div>
      </div>
      <textarea
        value={orderNote}
        onChange={(e) => setOrderNote(e.target.value)}
        placeholder="مثال: بدون مكسرات، أو توصيل بعد الساعة 7..."
        rows={3}
        className="bg-white/8 focus:bg-white/10 px-4 py-3 border border-white/15 focus:border-glace-yellow/40 rounded-[18px] outline-none w-full text-[14px] text-white placeholder:text-white/35 transition-colors resize-none"
      />
    </section>
  );
}

function CartLoading() {
  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white/12 backdrop-blur-xl p-5 sm:p-6 border border-white/12 rounded-[28px]">
        <div className="bg-white/15 mb-5 rounded-lg w-28 h-6 animate-pulse" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white/[0.06] p-4 sm:p-5 border border-white/12 rounded-[22px] animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/12 rounded-2xl size-14 shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="bg-white/12 rounded-lg w-1/2 h-5" />
                  <div className="bg-white/10 rounded-lg w-1/4 h-4" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="bg-white/10 rounded-lg w-24 h-4" />
                <div className="bg-white/10 rounded-full w-28 h-9" />
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
    <div className="relative bg-white/12 backdrop-blur-xl px-6 py-16 sm:py-20 border border-white/15 rounded-[32px] overflow-hidden text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,228,81,0.12),transparent_55%)] pointer-events-none" />
      <div className="relative flex flex-col items-center gap-5 animate-in duration-500 fade-in zoom-in-95">
        <div className="flex justify-center items-center bg-white/10 shadow-[0_0_40px_rgba(244,228,81,0.15)] border border-white/15 rounded-full size-24 text-glace-yellow">
          <ShoppingCart size={40} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="mb-2 font-bold text-[28px] text-white sm:text-[32px]">
            سلتك فارغة
          </h2>
          <p className="mx-auto max-w-xs text-[15px] text-white/60">
            اختَر من منيو Glace وابدأ طلبك بخطوة واحدة
          </p>
        </div>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 shadow-[0_8px_28px_rgba(244,228,81,0.3)] px-8 py-3.5 rounded-full font-bold text-[#1e6a7f] text-[15px] transition-all hover:-translate-y-0.5"
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
  const { data: storeStatus } = useStoreStatus();

  const storeOpen = storeStatus?.storeOpen ?? true;
  const closedMessage = storeStatus?.closedMessage ?? "المتجر مغلق حالياً";
  const [storeClosedDialogOpen, setStoreClosedDialogOpen] = useState(false);

  return (
    <>
      <aside className="bg-white/14 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl p-6 border border-white/15 rounded-[28px] text-white">
        <h2 className="mb-3 font-bold text-[20px]">ملخص الطلب</h2>

        <div className="flex items-center gap-2 bg-glace-yellow/10 mb-5 px-3.5 py-2.5 border border-glace-yellow/25 rounded-[14px] text-glace-yellow">
          <Clock size={16} className="shrink-0" />
          <span className="font-semibold text-[13px] leading-snug">
            مدة تحضير الطلب بالكامل تتراوح بين 5-25 دقيقة
          </span>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 bg-white/8 p-3 border border-white/10 rounded-[18px]"
            >
              <div className="flex justify-between items-start gap-3">
                <span className="flex-1 min-w-0 font-bold text-[15px] leading-snug">
                  {itemFullTitle(item)}
                </span>
                <span className="font-bold tabular-nums text-[15px] text-glace-yellow shrink-0">
                  {getLineItemTotal(item).toFixed(2)} ₪
                </span>
              </div>

              <div className="border border-white/10 rounded-[12px] w-full overflow-hidden text-[12.5px]">
                <div className="grid grid-cols-[26%_26%_12%_18%_18%] bg-white/8 font-semibold text-white/60">
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
                    className="grid grid-cols-[26%_26%_12%_18%_18%] border-white/10 border-t text-white/80"
                  >
                    <div className="px-2 py-2 break-words">{row.addons}</div>
                    <div className="px-2 py-2 break-words">{row.flavor}</div>
                    <div className="px-1.5 py-2 tabular-nums text-center">
                      {row.qty}
                    </div>
                    <div className="px-1.5 py-2 tabular-nums text-center">
                      {row.unitPrice.toFixed(2)} ₪
                    </div>
                    <div className="px-2 py-2 font-semibold tabular-nums text-white text-end">
                      {row.total.toFixed(2)} ₪
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {cartAddonTotal > 0 && (
            <div className="flex justify-between items-center gap-2 bg-glace-yellow/8 p-3 border border-glace-yellow/20 rounded-[18px] text-[14px] text-glace-yellow">
              <span>
                إضافات السلة
                {cartAddons.length > 0 ? ` (${cartAddons.join(" · ")})` : ""}
              </span>
              <span className="tabular-nums shrink-0">
                +{cartAddonTotal.toFixed(2)} ₪
              </span>
            </div>
          )}
        </div>

        {discount > 0 && (
          <div className="bg-white/6 p-4 border border-white/10 rounded-[18px]">
            <div className="flex justify-between text-[14px] text-glace-yellow">
              <span>الخصم</span>
              <span className="tabular-nums">-{discount.toFixed(2)} ₪</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function CheckoutButton() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const { data: storeStatus } = useStoreStatus();
  const storeOpen = storeStatus?.storeOpen ?? true;
  const [storeClosedDialogOpen, setStoreClosedDialogOpen] = useState(false);

  return (
    <>
      <Dialog
        open={storeClosedDialogOpen}
        onOpenChange={setStoreClosedDialogOpen}
      >
        <DialogContent
          showCloseButton={false}
          className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] ring-0 text-white text-center"
        >
          <DialogHeader className="items-center gap-3">
            <div className="flex justify-center items-center bg-rose-500 rounded-full size-16">
              <Clock className="size-8 text-white" strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-white text-2xl">
              المتجر مغلق حالياً
            </DialogTitle>
            <DialogDescription className="text-white/90 text-base">
              المتجر مغلق حالياً
            </DialogDescription>
          </DialogHeader>
          <DialogClose
            render={
              <button
                type="button"
                className="bg-glace-yellow hover:bg-yellow-300 mt-4 px-6 py-2.5 rounded-[30px] w-full font-bold text-[#1e6a7f] text-lg transition-colors cursor-pointer"
              />
            }
          >
            حسناً
          </DialogClose>
        </DialogContent>
      </Dialog>

      <div className="bottom-0 z-[999999] fixed inset-x-0 bg-gradient-to-t from-[#2f7a96] via-[#2f7a96]/90 to-transparent pointer-events-none" />
      <div className="right-0 bottom-28 md:bottom-24 lg:bottom-20 left-0 z-[9999999] fixed px-3 pointer-events-auto">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-4 bg-[#2d8aaa]/95 shadow-[0_8px_28px_rgba(0,0,0,0.3)] backdrop-blur-md p-4 border border-white/25 rounded-[20px]">
            <div className="flex flex-col shrink-0">
              <span className="text-[11px] text-white/70">المجموع</span>
              <p className="font-bold tabular-nums text-[18px] text-glace-yellow leading-none">
                {subtotal().toFixed(2)} ₪
              </p>
            </div>

            <div className="flex-1" />

            {!storeOpen ? (
              <button
                onClick={() => setStoreClosedDialogOpen(true)}
                className="flex justify-center items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-[16px] font-bold text-[14px] text-white transition-all cursor-pointer shrink-0"
              >
                إتمام الطلب
                <ChevronLeft size={14} />
              </button>
            ) : (
              <Link
                href="/checkout"
                className="flex justify-center items-center gap-2 bg-glace-yellow hover:bg-yellow-300 shadow-[0_4px_16px_rgba(244,228,81,0.35)] hover:shadow-[0_6px_20px_rgba(244,228,81,0.45)] px-6 py-2.5 rounded-[16px] font-bold text-[#1e6a7f] text-[14px] transition-all shrink-0"
              >
                إتمام الطلب
                <ChevronLeft size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
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
    const isCupContainer =
      !!item.container && CUP_CONTAINERS.includes(item.container);
    if (!isFamilyProduct && !isCupContainer) return [];
    // A product's own catalog overrides the shared one; both come from the API.
    const productSpecific = addonsByProductId.get(productId);
    if (productSpecific && productSpecific.length > 0) return productSpecific;
    return sharedAddons ?? [];
  }

  return (
    <div className="relative bg-[radial-gradient(ellipse_at_top,#4eb4d4_0%,#388dab_45%,#2f7a96_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      {items.length > 0 && <CheckoutButton />}

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-38 lg:pb-18 max-w-6xl">
        {/* Header */}
        <header className="mb-8 sm:mb-10 animate-in duration-500 fade-in">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
              <h1 className="font-bold text-[36px] text-white sm:text-[46px] leading-none">
                سلة التسوق
              </h1>
              {items.length > 0 && (
                <p className="mt-2 text-[14px] text-white/55">
                  {items.length} صنف · {totalPieces} قطعة
                </p>
              )}
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 font-medium text-[14px] text-white/70 hover:text-white transition-colors"
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
            <div className="flex flex-col gap-5 w-full min-w-0">
              {/* Products */}
              <section className="bg-white/12 backdrop-blur-xl p-4 sm:p-5 border border-white/12 rounded-[24px]">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-bold text-[17px] text-white">المنتجات</h2>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="inline-flex items-center gap-1.5 bg-rose-500/12 hover:bg-rose-500/25 px-2 py-1 border border-rose-400/35 hover:border-rose-400/55 rounded-full font-medium text-[12px] text-rose-300 hover:text-rose-100 transition cursor-pointer"
                  >
                    <Trash2 size={12} />
                    حذف الكل
                  </button>
                </div>
                <div className="flex flex-col gap-2">
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
                className="group relative flex items-center gap-4 bg-glace-yellow/10 hover:bg-glace-yellow/18 px-5 sm:px-6 py-4 border border-glace-yellow/45 hover:border-glace-yellow/70 border-dashed rounded-[24px] overflow-hidden transition-all duration-300"
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,220,80,0.18),transparent_55%)] opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <span className="relative flex justify-center items-center bg-glace-yellow shadow-[0_8px_20px_rgba(255,210,60,0.35)] rounded-2xl size-12 text-[#1e6a7f] group-hover:scale-105 transition-transform">
                  <Plus size={22} strokeWidth={2.4} />
                </span>
                <span className="relative flex-1 min-w-0 text-right">
                  <span className="block font-bold text-[16px] text-white sm:text-[17px] group-hover:text-glace-yellow transition-colors">
                    إضافة منتج
                  </span>
                  <span className="block mt-0.5 text-[13px] text-white/55">
                    تصفّح القائمة وأضف المزيد للسلة
                  </span>
                </span>
                <ChevronLeft
                  size={18}
                  className="relative text-glace-yellow/70 group-hover:text-glace-yellow transition-all group-hover:-translate-x-0.5 shrink-0"
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
