"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Check, Heart, IceCreamCone, Package } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import CartLineStepper from "@/components/Order/CartLineStepper";
import ExtraScoopModal from "@/components/Order/ExtraScoopModal";
import ImageZoomDialog from "@/components/Order/ImageZoomDialog";
import MixOrderSection, {
  countFlavorOccurrences,
} from "@/components/Order/MixOrderSection";
import { useCartHydrated } from "@/hooks/cart/useCartHydrated";
import { useCartStore, type CartSelection } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import {
  getMixFlavorUnitPrice,
  resolveMenuImageSrc,
  type IExtraScoopOption,
  type IFlatListProduct,
  type IMixRule,
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

  const [zoomedItemId, setZoomedItemId] = useState<string | null>(null);
  // Item whose "أضف بوظة" picker is open.
  const [scoopItemId, setScoopItemId] = useState<string | null>(null);

  // "أضف بوظة" is offered only when the product ships `extraScoop` with at
  // least one flavor in stock — presence of the data is the dashboard toggle.
  const extraScoop = product.extraScoop;
  const scoopIds = useMemo(
    () =>
      new Set(
        [...(extraScoop?.classic ?? []), ...(extraScoop?.special ?? [])].map(
          (o) => o.id,
        ),
      ),
    [extraScoop],
  );
  const offersScoop =
    !!extraScoop &&
    [...(extraScoop.classic ?? []), ...(extraScoop.special ?? [])].some(
      (o) => o.available !== false,
    );

  // No local "pending" picks: every add goes straight into the cart, and the
  // row steppers read their numbers back from it. Until the persisted cart
  // hydrates, treat it as empty so SSR and the first client render agree.
  const hydrated = useCartHydrated();
  const addItem = useCartStore((s) => s.addItem);
  const allCartItems = useCartStore((s) => s.items);
  const productLines = useMemo(
    () =>
      hydrated ? allCartItems.filter((i) => i.productId === product.id) : [],
    [hydrated, allCartItems, product.id],
  );
  const mixLines = productLines.filter((l) => !!l.mixId);
  const { toggle: toggleFavorite, isFavorite } = useFavoritesStore();

  function addVariant(itemId: string) {
    const item = product.items.find((i) => i.id === itemId);
    if (!item) return;
    addItem({
      productId: product.id,
      name: `${product.name} — ${item.label}`,
      image: resolveMenuImageSrc(item.image ?? product.image),
      type: item.label,
      itemId: item.id,
      selections: [],
      addonTotal: 0,
      unitPrice: item.price,
      quantity: 1,
    });
  }

  function addVariantWithScoop(
    itemId: string,
    scoop: IExtraScoopOption | null,
  ) {
    setScoopItemId(null);
    if (!scoop) return addVariant(itemId);
    const item = product.items.find((i) => i.id === itemId);
    if (!item) return;
    addItem({
      productId: product.id,
      name: `${product.name} — ${item.label}`,
      image: resolveMenuImageSrc(item.image ?? product.image),
      type: item.label,
      itemId: item.id,
      // A normal per-unit addon selection — the server reprices it from the
      // id against this product's extraScoop catalog.
      selections: [
        {
          kind: "addon",
          id: scoop.id,
          label: `بوظة ${scoop.label}`,
          qty: 1,
          unitPrice: scoop.price,
        },
      ],
      addonTotal: scoop.price,
      unitPrice: item.price,
      quantity: 1,
    });
  }

  function addMix(mixRule: IMixRule, itemIds: string[], unitPrice: number) {
    const selections: CartSelection[] = countFlavorOccurrences(itemIds).map(
      ({ id, qty }) => {
        const flavorItem = product.items.find((i) => i.id === id);
        return {
          kind: "mix",
          id,
          // Snapshot the label at add-to-cart time so the cart line stays
          // readable even if the item is renamed afterwards.
          label: flavorItem?.label ?? id,
          qty,
          unitPrice: getMixFlavorUnitPrice(
            mixRule,
            flavorItem?.isPremiumMixFlavor,
          ),
        };
      },
    );
    addItem({
      productId: product.id,
      name: `${product.name} — ${mixRule.label}`,
      image: resolveMenuImageSrc(product.image),
      type: mixRule.label,
      mixId: mixRule.id,
      mixItemIds: itemIds,
      selections,
      addonTotal: 0,
      unitPrice,
      quantity: 1,
    });
  }

  const scoopItem = scoopItemId
    ? product.items.find((i) => i.id === scoopItemId)
    : undefined;
  const zoomedItem = zoomedItemId
    ? product.items.find((i) => i.id === zoomedItemId)
    : null;

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-52 lg:pb-36 max-w-3xl">
        <div className="bg-white/17 backdrop-blur-[15px] mb-6 rounded-[28px] overflow-hidden">
          <div className="flex justify-center items-center p-5 sm:p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <h1 className="font-bold text-[36px] text-white sm:text-[46px] leading-tight">
                {product.name}
              </h1>
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
              هذا المنتج متوفر داخل المحل فقط — غير متاح للتوصيل أو الاستلام
              (Take Away)
            </p>
          </div>
        )}

        <div className="bg-white/17 backdrop-blur-[15px] mb-4 rounded-[28px] overflow-hidden">
          <div className="p-5 px-2 [@media(min-width:400px)]:px-5">
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
                const itemLines = productLines.filter(
                  (l) => !l.mixId && l.itemId === item.id,
                );
                // Scoop products list every line of this item under the row
                // (with / without scoop); otherwise the row's own stepper
                // covers the plain lines.
                const hasScoop = (l: (typeof itemLines)[number]) =>
                  l.selections.some(
                    (s) => s.kind === "addon" && scoopIds.has(s.id),
                  );
                const lines = itemLines.filter((l) => !hasScoop(l));
                const count = lines.reduce((sum, l) => sum + l.quantity, 0);
                const isUnavailable = item.available === false;
                const favoriteId = `${product.id}-${item.id}`;
                return (
                  <div
                    key={item.id}
                    className={`border rounded-[16px] px-2 [@media(min-width:400px)]:px-4 py-4 transition-all ${
                      isUnavailable
                        ? "opacity-50 bg-white/5 border-white/5 cursor-not-allowed"
                        : itemLines.length > 0
                          ? "bg-glace-yellow/10 border-glace-yellow/50"
                          : "bg-white/8 border-white/10 hover:bg-white/12"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        product.hasImageZoom ? (
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
                        )
                      ) : (
                        <div className="flex justify-center items-center bg-linear-to-br from-white/20 to-white/5 border border-white/15 rounded-lg w-16 h-16 shrink-0">
                          <Package size={24} strokeWidth={1.6} className="text-white/50" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="mb-1 font-medium text-[15px] text-white">
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-[12px] text-white/60 leading-tight">
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
                      ) : offersScoop ? (
                        // Scoop products: "أضف" always asks the one question
                        // (with or without a scoop) — picks are listed below.
                        <button
                          type="button"
                          onClick={() => setScoopItemId(item.id)}
                          className="flex items-center gap-1.5 bg-glace-yellow hover:bg-yellow-300 shadow-md px-4 py-2 border-0 rounded-full font-bold text-[#1e6a7f] text-[13px] transition-all cursor-pointer shrink-0"
                        >
                          <ShoppingCart size={13} />
                          أضف
                        </button>
                      ) : count === 0 ? (
                        <button
                          type="button"
                          onClick={() => addVariant(item.id)}
                          className="flex items-center gap-1.5 bg-glace-yellow hover:bg-yellow-300 shadow-md px-4 py-2 border-0 rounded-full font-bold text-[#1e6a7f] text-[13px] transition-all cursor-pointer shrink-0"
                        >
                          <ShoppingCart size={13} />
                          أضف
                        </button>
                      ) : (
                        <CartLineStepper lines={lines} />
                      )}
                    </div>

                    {offersScoop && itemLines.length > 0 && (
                      <div className="flex flex-col gap-2 mt-3 pt-3 border-white/10 border-t">
                        {itemLines.map((line) => {
                          const scoop = line.selections.find(
                            (s) => s.kind === "addon" && scoopIds.has(s.id),
                          );
                          return (
                            <div
                              key={line.id}
                              className="flex items-center gap-2 bg-white/8 px-3 py-2 rounded-[12px]"
                            >
                              {scoop ? (
                                <IceCreamCone
                                  size={15}
                                  className="text-glace-yellow shrink-0"
                                />
                              ) : (
                                <Check size={15} className="text-white/60 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-white truncate">
                                  {item.label}
                                  {scoop ? (
                                    <span className="font-bold text-glace-yellow">
                                      {" "}
                                      + {scoop.label}
                                    </span>
                                  ) : (
                                    <span className="text-white/60">
                                      {" "}
                                      · بدون بوظة
                                    </span>
                                  )}
                                </p>
                                <p className="tabular-nums text-[12px] text-white/60">
                                  {line.unitPrice + line.addonTotal} ₪ للقطعة
                                </p>
                              </div>
                              <CartLineStepper lines={[line]} />
                            </div>
                          );
                        })}
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
                lines={mixLines}
                onAddMix={addMix}
              />
            )}
          </div>
        </div>
      </div>

      <CartBar />

      {extraScoop && scoopItem && (
        <ExtraScoopModal
          open
          item={scoopItem}
          extraScoop={extraScoop}
          onClose={() => setScoopItemId(null)}
          onConfirm={(scoop) => addVariantWithScoop(scoopItem.id, scoop)}
        />
      )}

      {product.hasImageZoom && zoomedItem?.image && (
        <ImageZoomDialog
          isOpen={!!zoomedItemId}
          onClose={() => setZoomedItemId(null)}
          src={resolveMenuImageSrc(zoomedItem.image)}
          alt={zoomedItem.label}
        />
      )}
    </div>
  );
}
