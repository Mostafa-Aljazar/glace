"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Check, Heart } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import AddToCartButton from "@/components/Order/AddToCartButton";
import AddToCartToast from "@/components/Order/AddToCartToast";
import BackButton from "@/components/Order/BackButton";
import ImageZoomDialog from "@/components/Order/ImageZoomDialog";
import OrderLeaveConfirmationDialog from "@/components/Order/OrderLeaveConfirmationDialog";
import { useLeavePageGuard, useAddToCartFeedback } from "@/hooks/order";
import MixOrderSection, {
  countFlavorOccurrences,
  type MixSelection,
} from "@/components/Order/MixOrderSection";
import { useCartStore, type CartSelection } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import {
  getMixFlavorUnitPrice,
  resolveMenuImageSrc,
  type IFlatListProduct,
} from "@/types/menu.types";

export default function OrderFlatListTemplate({
  product,
}: {
  product: IFlatListProduct;
}) {
  // A mix switched off in the dashboard disappears from the order page.
  const orderableMixes = useMemo(
    () => (product.mixes ?? []).filter((m) => m.available !== false),
    [product.mixes],
  );

  // Keyed by `IProductVariant.id`, never by label — labels are dashboard-editable.
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mixSelections, setMixSelections] = useState<MixSelection[]>([]);
  const [zoomedItemId, setZoomedItemId] = useState<string | null>(null);
  const {
    addedToCart,
    validationMsg,
    showValidation,
    markAdded,
    toastMsg,
    dismissToast,
  } = useAddToCartFeedback();

  const totalItems = Object.values(counts).reduce((s, c) => s + c, 0);
  const mixItems = mixSelections.filter((m) => m.count > 0).length;
  const hasPendingSelections = totalItems > 0 || mixItems > 0;

  const clearSelections = useCallback(() => {
    setCounts({});
    setMixSelections([]);
  }, []);

  const {
    showCloseConfirm,
    handleCancelLeave,
    handleConfirmLeave,
    handleBeforeBack: guardBeforeBack,
  } = useLeavePageGuard(hasPendingSelections, clearSelections);

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const productCartQuantity = cartItems
    .filter((i) => i.productId === product.id)
    .reduce((sum, i) => sum + i.quantity, 0);
  const { toggle: toggleFavorite, isFavorite } = useFavoritesStore();

  function increment(itemId: string) {
    setCounts((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
  }

  function decrement(itemId: string) {
    setCounts((prev) => {
      const next = (prev[itemId] ?? 0) - 1;
      if (next <= 0) {
        return Object.fromEntries(
          Object.entries(prev).filter(([k]) => k !== itemId),
        );
      }
      return { ...prev, [itemId]: next };
    });
  }

  function handleAddToCart() {
    if (totalItems === 0 && mixItems === 0) {
      return showValidation("اختر منتج واحد على الأقل");
    }

    Object.entries(counts).forEach(([itemId, qty]) => {
      if (qty <= 0) return;
      const item = product.items.find((i) => i.id === itemId);
      if (!item) return;
      addItem({
        productId: product.id,
        name: `${product.name} — ${item.label}`,
        image: resolveMenuImageSrc(item.image ?? product.image),
        type: item.label,
        selections: [],
        addonTotal: 0,
        unitPrice: item.price,
        quantity: qty,
      });
    });

    mixSelections.forEach((mix) => {
      if (mix.count <= 0) return;
      const mixRule = product.mixes?.find((m) => m.id === mix.mixId);
      const selections: CartSelection[] = countFlavorOccurrences(
        mix.selectedItemIds,
      ).map(({ id, qty }) => {
        const flavorItem = product.items.find((i) => i.id === id);
        return {
          kind: "mix",
          id,
          // Snapshot the label at add-to-cart time so the cart line stays
          // readable even if the item is renamed afterwards.
          label: flavorItem?.label ?? id,
          qty,
          unitPrice: mixRule
            ? getMixFlavorUnitPrice(mixRule, flavorItem?.isPremiumMixFlavor)
            : 0,
        };
      });
      const mixLabel = mixRule?.label ?? "";
      addItem({
        productId: product.id,
        name: `${product.name} — ${mixLabel}`,
        image: resolveMenuImageSrc(product.image),
        type: mixLabel,
        selections,
        addonTotal: 0,
        unitPrice: mix.unitPrice,
        quantity: mix.count,
      });
    });

    const addedQty =
      totalItems +
      mixSelections.reduce((sum, m) => sum + Math.max(0, m.count), 0);
    markAdded(`تمت إضافة ${addedQty} من ${product.name} إلى السلة`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    clearSelections();
  }

  function handleBeforeBack(): boolean {
    return guardBeforeBack();
  }

  const totalPrice =
    Object.entries(counts).reduce((sum, [itemId, qty]) => {
      const item = product.items.find((i) => i.id === itemId);
      return sum + (item?.price ?? 0) * qty;
    }, 0) +
    mixSelections.reduce((sum, mix) => sum + mix.unitPrice * mix.count, 0);

  const zoomedItem = zoomedItemId
    ? product.items.find((i) => i.id === zoomedItemId)
    : null;

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-52 lg:pb-36 max-w-3xl">
        <div className="mb-3 text-start">
          <BackButton onBeforeBack={handleBeforeBack} />
        </div>
        <div className="bg-white/17 backdrop-blur-[15px] mb-6 rounded-[28px] overflow-hidden">
          <div className="flex justify-center items-center p-5 sm:p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div>
                <h1 className="font-bold text-[28px] text-white sm:text-[34px] leading-tight">
                  {product.name}
                </h1>
                <p className="text-[14px] text-white/55 text-justify">
                  {product.description || "خصّص طلبك خطوة بخطوة"}
                </p>
              </div>
              <Image
                src={resolveMenuImageSrc(product.image)}
                alt={product.name}
                width={200}
                height={200}
                className="drop-shadow-xl w-40 sm:w-48 h-40 sm:h-48 object-contain"
              />
            </div>
          </div>
        </div>

        {product.inStoreOnly && (
          <div className="flex items-start gap-3 bg-yellow-400/15 mb-4 px-4 py-3.5 border border-yellow-400/30 rounded-[20px]">
            <span className="text-[22px] shrink-0">⚠️</span>
            <p className="text-[13px] text-yellow-100 leading-relaxed">
              هذا المنتج لا يتناسب للتوصيل — متوفر داخل المعرض فقط
            </p>
          </div>
        )}

        <div className="bg-white/17 backdrop-blur-[15px] mb-4 rounded-[28px] overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-bold text-[18px] text-white">
                اختر المنتجات
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 border border-green-500/40 rounded-full">
                <Check size={13} className="text-green-400" />
                <span className="font-medium text-[11px] text-green-300">
                  مطلوب
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {product.items.map((item) => {
                const count = counts[item.id] ?? 0;
                const isUnavailable = item.available === false;
                const favoriteId = `${product.id}-${item.id}`;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 border rounded-[16px] px-4 py-4 transition-all ${
                      isUnavailable
                        ? "opacity-50 bg-white/5 border-white/5 cursor-not-allowed"
                        : count > 0
                          ? "bg-glace-yellow/10 border-glace-yellow/50"
                          : "bg-white/8 border-white/10 hover:bg-white/12"
                    }`}
                  >
                    {item.image &&
                      (product.hasImageZoom ? (
                        <button
                          type="button"
                          onClick={() =>
                            !isUnavailable && setZoomedItemId(item.id)
                          }
                          disabled={isUnavailable}
                          className={`shrink-0 transition-transform ${!isUnavailable ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"}`}
                        >
                          <Image
                            src={resolveMenuImageSrc(item.image)}
                            alt={item.label}
                            width={60}
                            height={60}
                            className="rounded-lg w-16 h-16 object-contain"
                          />
                        </button>
                      ) : (
                        <Image
                          src={resolveMenuImageSrc(item.image)}
                          alt={item.label}
                          width={60}
                          height={60}
                          className="rounded-lg w-16 h-16 object-contain shrink-0"
                        />
                      ))}

                    <div className="flex-1 min-w-0">
                      <p className="mb-1 font-medium text-[15px] text-white">
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-[12px] text-white/60 line-clamp-2 leading-tight">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <p className="font-bold text-[16px] text-glace-yellow whitespace-nowrap">
                        {item.price} ₪
                      </p>
                      {product.hasFavorites && !isUnavailable && (
                        <button
                          type="button"
                          onClick={() => toggleFavorite(favoriteId)}
                          className="transition-colors shrink-0"
                        >
                          <Heart
                            size={20}
                            className={
                              isFavorite(favoriteId)
                                ? "fill-red-500 text-red-500"
                                : "text-white/50 hover:text-white"
                            }
                          />
                        </button>
                      )}
                    </div>

                    {isUnavailable ? (
                      <span className="font-bold text-[12px] text-white/60 shrink-0">
                        غير متاح
                      </span>
                    ) : count === 0 ? (
                      <button
                        type="button"
                        onClick={() => increment(item.id)}
                        className="flex items-center gap-1.5 bg-glace-yellow hover:bg-yellow-300 shadow-md px-4 py-2 border-0 rounded-full font-bold text-[#1e6a7f] text-[13px] transition-all cursor-pointer shrink-0"
                      >
                        <ShoppingCart size={13} />
                        أضف
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-white/15 px-2 py-1 border border-white/25 rounded-full shrink-0">
                        <button
                          type="button"
                          onClick={() => decrement(item.id)}
                          className="flex justify-center items-center hover:bg-white/25 rounded-full w-6 h-6 text-white transition-colors cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="min-w-4 font-bold text-[14px] text-white text-center">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(item.id)}
                          className="flex justify-center items-center hover:bg-white/25 rounded-full w-6 h-6 text-white transition-colors cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {orderableMixes.length > 0 && (
              <MixOrderSection
                mixes={orderableMixes}
                items={product.items}
                mixSelections={mixSelections}
                setMixSelections={setMixSelections}
              />
            )}
          </div>
        </div>
      </div>

      <div className="bottom-28 lg:bottom-0 z-9999997 fixed inset-x-0 px-3 sm:px-4 lg:px-6 pt-6 pb-4 pointer-events-none">
        <div className="flex md:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-6 bg-[#2d8aaa]/92 shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-md mx-auto px-4 sm:px-5 lg:px-8 py-3 sm:py-4 lg:py-5 border border-white/35 rounded-[24px] max-w-3xl lg:max-w-5xl pointer-events-auto">
          {/* Price - visible on all breakpoints */}
          <div className="flex flex-col shrink-0">
            <span className="mb-1 text-[11px] text-white/75 sm:text-[12px] leading-none">
              إجمالي السعر
            </span>
            <p className="font-bold tabular-nums text-[16px] text-glace-yellow sm:text-[18px] lg:text-[22px] leading-none">
              ₪ {totalPrice.toFixed(2)}
            </p>
          </div>

          {/* Spacer - only visible on tablet+ */}
          <div className="hidden md:block flex-1" />

          {/* Button - full width on mobile (own row), auto width on tablet+ */}
          <div className="w-full sm:w-auto">
            <AddToCartButton
              onClick={handleAddToCart}
              canAdd={totalItems > 0 || mixItems > 0}
              addedToCart={addedToCart}
              validationMsg={validationMsg}
              cartQuantity={productCartQuantity}
            />
          </div>
        </div>
      </div>

      <AddToCartToast message={toastMsg} onClose={dismissToast} />

      {product.hasImageZoom && zoomedItem?.image && (
        <ImageZoomDialog
          isOpen={!!zoomedItemId}
          onClose={() => setZoomedItemId(null)}
          src={resolveMenuImageSrc(zoomedItem.image)}
          alt={zoomedItem.label}
        />
      )}

      <OrderLeaveConfirmationDialog
        open={showCloseConfirm}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />
    </div>
  );
}
