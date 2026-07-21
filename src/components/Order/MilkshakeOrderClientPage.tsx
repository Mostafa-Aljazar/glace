"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Heart, Check } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import AddToCartButton from "@/components/Order/AddToCartButton";
import BackButton from "@/components/Order/BackButton";
import ImageZoomDialog from "@/components/Order/ImageZoomDialog";
import OrderLeaveConfirmationDialog from "@/components/Order/OrderLeaveConfirmationDialog";
import { useLeavePageGuard } from "@/hooks/order";
import {
  milkshake,
  chocolateIce,
  vanillaaIce,
  strawberryIce,
  caramelIce,
  nescafeIce,
  nutellaIce,
  lotusIce,
  kinderBuenoIce,
  oreoIce,
  kitKatIce,
  pistachioIce,
  marioIce,
} from "@/assets/images";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import type { StaticIMG } from "@/assets/images";

interface MilkshakeItem {
  id: string;
  label: string;
  price: number;
  image: StaticIMG;
  available?: boolean;
}

interface SpecialFlavor {
  id: string;
  label: string;
  price: number;
  color: string;
  image: StaticIMG;
}

const MILKSHAKE_ITEMS: MilkshakeItem[] = [
  {
    id: "classic-chocolate",
    label: "كلاسيك شوكولاته",
    price: 8,
    image: chocolateIce,
    available: true,
  },
  {
    id: "classic-vanilla",
    label: "كلاسيك فانيلا",
    price: 8,
    image: vanillaaIce,
    available: true,
  },
  {
    id: "classic-strawberry",
    label: "كلاسيك فراولة",
    price: 8,
    image: strawberryIce,
    available: false,
  },
  {
    id: "classic-caramel",
    label: "كلاسيك كاراميل",
    price: 8,
    image: caramelIce,
    available: true,
  },
  {
    id: "classic-nescafe",
    label: "كلاسيك نسكافيه",
    price: 8,
    image: nescafeIce,
    available: true,
  },
  {
    id: "classic-barouka",
    label: "كلاسيك باروكا",
    price: 8,
    image: caramelIce,
    available: false,
  },
  {
    id: "special-nutella",
    label: "سبيشال نوتيلا",
    price: 10,
    image: nutellaIce,
    available: true,
  },
  {
    id: "special-lotus",
    label: "سبيشال لوتس",
    price: 10,
    image: lotusIce,
    available: true,
  },
  {
    id: "special-kinder",
    label: "سبيشال كندر",
    price: 10,
    image: kinderBuenoIce,
    available: true,
  },
  {
    id: "special-oreo",
    label: "سبيشال أوريو",
    price: 10,
    image: oreoIce,
    available: false,
  },
  {
    id: "special-kitkat",
    label: "سبيشال كت كات",
    price: 10,
    image: kitKatIce,
    available: true,
  },
  {
    id: "special-fitness",
    label: "سبيشال فيتنس",
    price: 10,
    image: nescafeIce,
    available: true,
  },
  {
    id: "special-shoufan",
    label: "سبيشال شوفان",
    price: 10,
    image: nutellaIce,
    available: true,
  },
];

const SPECIAL_FLAVORS: SpecialFlavor[] = [
  {
    id: "serlac",
    label: "سيرلاك (أطعم خاصة)",
    price: 8,
    color: "#FF6B6B",
    image: marioIce,
  },
  {
    id: "einstein",
    label: "اينشتاين (أطعم خاصة)",
    price: 9,
    color: "#FFA500",
    image: marioIce,
  },
  {
    id: "pistachio",
    label: "بيستاشيو (أطعم خاصة)",
    price: 13,
    color: "#90EE90",
    image: pistachioIce,
  },
];

export default function MilkshakeOrderClientPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [zoomedImageId, setZoomedImageId] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const { toggle: toggleFavorite, isFavorite } = useFavoritesStore();

  const clearSelections = useCallback(() => {
    setCounts({});
  }, []);

  const totalItems = Object.values(counts).reduce((s, c) => s + c, 0);
  const hasPendingSelections = totalItems > 0;

  const {
    showCloseConfirm,
    handleCancelLeave,
    handleConfirmLeave,
    handleBeforeBack: guardBeforeBack,
  } = useLeavePageGuard(hasPendingSelections, clearSelections);

  const totalPrice = Object.entries(counts).reduce((sum, [id, qty]) => {
    const regularItem = MILKSHAKE_ITEMS.find((item) => item.id === id);
    const specialItem = SPECIAL_FLAVORS.find((item) => item.id === id);
    const price = regularItem?.price ?? specialItem?.price ?? 0;
    return sum + price * qty;
  }, 0);

  function increment(id: string) {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }

  function decrement(id: string) {
    setCounts((prev) => {
      const next = (prev[id] ?? 0) - 1;
      if (next <= 0) {
        return Object.fromEntries(
          Object.entries(prev).filter(([k]) => k !== id),
        );
      }
      return { ...prev, [id]: next };
    });
  }

  function showValidation(msg: string) {
    setValidationMsg(msg);
    setTimeout(() => setValidationMsg(""), 3000);
  }

  function handleAddToCart() {
    if (totalItems === 0) return showValidation("اختر ميلك شيك واحد على الأقل");

    Object.entries(counts).forEach(([id, qty]) => {
      if (qty > 0) {
        const regularItem = MILKSHAKE_ITEMS.find((item) => item.id === id);
        const specialItem = SPECIAL_FLAVORS.find((item) => item.id === id);
        const item = regularItem || specialItem;

        if (item) {
          addItem({
            productId: "milkshake",
            name: `ميلك شيك ${item.label}`,
            type: item.label,
            addons: [],
            addonTotal: 0,
            unitPrice: item.price,
            quantity: qty,
          });
        }
      }
    });

    setAddedToCart(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setAddedToCart(false), 2000);
    clearSelections();
  }

  function handleBeforeBack(): boolean {
    return guardBeforeBack();
  }

  const getItemImage = (id: string) => {
    const regularItem = MILKSHAKE_ITEMS.find((item) => item.id === id);
    if (regularItem) return regularItem.image;
    const specialItem = SPECIAL_FLAVORS.find((f) => f.id === id);
    return specialItem?.image || chocolateIce;
  };

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <BackButton
        onBeforeBack={handleBeforeBack}
        disabled={hasPendingSelections}
      />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-36 max-w-3xl">
        {/* ── Hero card ── */}
        <div className="bg-white/17 backdrop-blur-[15px] mb-6 rounded-[28px] overflow-hidden">
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div>
                <h1 className="font-bold text-[28px] text-white sm:text-[34px] leading-tight">
                  ميلك شيك
                </h1>
                <p className="text-[14px] text-white/55">
                  خصّص طلبك خطوة بخطوة
                </p>
              </div>
              <Image
                src={milkshake}
                alt="ميلك شيك"
                width={200}
                height={200}
                className="drop-shadow-xl w-40 sm:w-48 h-40 sm:h-48 object-contain"
              />
            </div>
          </div>
        </div>

        {/* ── Items list ── */}
        <div className="bg-white/17 backdrop-blur-[15px] mb-4 rounded-[28px] overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-bold text-[18px] text-white">
                اختر أطعمة الميلك شيك
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 border border-green-500/40 rounded-full">
                <Check size={13} className="text-green-400" />
                <span className="font-medium text-[11px] text-green-300">
                  مطلوب
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Regular items */}
              {MILKSHAKE_ITEMS.map((item) => {
                const count = counts[item.id] ?? 0;
                const isUnavailable = item.available === false;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 border rounded-[16px] px-4 py-4 transition-all
                      ${isUnavailable ? "opacity-50 bg-white/5 border-white/5 cursor-not-allowed" : count > 0 ? "bg-glace-yellow/10 border-glace-yellow/50" : "bg-white/8 border-white/10 hover:bg-white/12"}`}
                  >
                    {/* Image - tappable for zoom */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          !isUnavailable && setZoomedImageId(item.id)
                        }
                        disabled={isUnavailable}
                        className={`transition-transform ${!isUnavailable ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"}`}
                      >
                        <Image
                          src={item.image}
                          alt={item.label}
                          width={60}
                          height={60}
                          className="rounded-lg w-16 h-16 object-contain"
                        />
                      </button>
                      {isUnavailable && (
                        <div className="absolute inset-0 flex justify-center items-center bg-black/50 rounded-lg">
                          <span className="px-1 font-bold text-[9px] text-white text-center">
                            غير متوفر
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Label + price (horizontal layout) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="font-medium text-[15px] text-white">
                          {item.label}
                        </p>
                        <p className="font-bold text-[16px] text-glace-yellow whitespace-nowrap">
                          {item.price} ₪
                        </p>
                      </div>
                    </div>

                    {/* Heart favorite */}
                    <button
                      type="button"
                      onClick={() => !isUnavailable && toggleFavorite(item.id)}
                      disabled={isUnavailable}
                      className={`shrink-0 transition-colors ${isUnavailable ? "cursor-not-allowed" : ""}`}
                    >
                      <Heart
                        size={20}
                        className={
                          isFavorite(item.id)
                            ? "fill-red-500 text-red-500"
                            : isUnavailable
                              ? "text-white/20"
                              : "text-white/50 hover:text-white"
                        }
                      />
                    </button>

                    {/* Add button or counter */}
                    {isUnavailable ? (
                      <span className="px-2 py-1 font-bold text-[11px] text-white/40">
                        غير متوفر
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

              {/* Special flavors - individual cards */}
              {SPECIAL_FLAVORS.map((flavor) => {
                const count = counts[flavor.id] ?? 0;
                return (
                  <div
                    key={flavor.id}
                    className={`flex items-center gap-3 border rounded-[16px] px-4 py-4 transition-all
                      ${count > 0 ? "bg-glace-yellow/10 border-glace-yellow/50" : "bg-white/8 border-white/10 hover:bg-white/12"}`}
                  >
                    {/* Image - tappable for zoom */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setZoomedImageId(flavor.id)}
                        className="hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Image
                          src={flavor.image}
                          alt={flavor.label}
                          width={60}
                          height={60}
                          className="rounded-lg w-16 h-16 object-contain"
                        />
                      </button>
                    </div>

                    {/* Label + price */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="font-medium text-[15px] text-white">
                          {flavor.label}
                        </p>
                        <p className="font-bold text-[16px] text-glace-yellow whitespace-nowrap">
                          {flavor.price} ₪
                        </p>
                      </div>
                    </div>

                    {/* Heart favorite */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(flavor.id)}
                      className="transition-colors shrink-0"
                    >
                      <Heart
                        size={20}
                        className={
                          isFavorite(flavor.id)
                            ? "fill-red-500 text-red-500"
                            : "text-white/50 hover:text-white"
                        }
                      />
                    </button>

                    {/* Add button or counter */}
                    {count === 0 ? (
                      <button
                        type="button"
                        onClick={() => increment(flavor.id)}
                        className="flex items-center gap-1.5 bg-glace-yellow hover:bg-yellow-300 shadow-md px-4 py-2 border-0 rounded-full font-bold text-[#1e6a7f] text-[13px] transition-all cursor-pointer shrink-0"
                      >
                        <ShoppingCart size={13} />
                        أضف
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-white/15 px-2 py-1 border border-white/25 rounded-full shrink-0">
                        <button
                          type="button"
                          onClick={() => decrement(flavor.id)}
                          className="flex justify-center items-center hover:bg-white/25 rounded-full w-6 h-6 text-white transition-colors cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="min-w-4 font-bold text-[14px] text-white text-center">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(flavor.id)}
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
          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div className="bottom-23 lg:bottom-0 z-9999997 fixed inset-x-0 bg-linear-to-t from-[#1a6278]/95 to-transparent px-4 pt-6 pb-4 pointer-events-none">
        <div className="flex flex-wrap items-center gap-4 bg-white/18 backdrop-blur-[20px] mx-auto px-5 py-4 border border-white/20 rounded-[24px] max-w-3xl pointer-events-auto">
          {/* Item count */}
          <div className="flex-1">
            <p className="text-[12px] text-white/55">الإجمالي</p>
            <p className="font-bold text-[22px] text-glace-yellow leading-none">
              {totalPrice.toFixed(2)} ₪
            </p>
          </div>

          <p className="text-[13px] text-white/50 shrink-0">
            {totalItems} {totalItems === 1 ? "صنف" : "أصناف"}
          </p>

          <AddToCartButton
            onClick={handleAddToCart}
            canAdd={totalItems > 0}
            addedToCart={addedToCart}
            validationMsg={validationMsg}
          />
        </div>
      </div>

      {/* ── Image Zoom Dialog ── */}
      {zoomedImageId && (
        <ImageZoomDialog
          isOpen={!!zoomedImageId}
          onClose={() => setZoomedImageId(null)}
          src={getItemImage(zoomedImageId)}
          alt="Zoomed milkshake"
        />
      )}

      <OrderLeaveConfirmationDialog
        open={showCloseConfirm}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />

      <CartBar />
    </div>
  );
}
