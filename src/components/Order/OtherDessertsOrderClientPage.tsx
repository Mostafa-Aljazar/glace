"use client";

import { useCallback, useMemo, useState } from "react";
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
  browniesCake,
  mochi,
  sanSebastian,
  nutellaIce,
  lotusIce,
  pistachioIce,
  strawberryIce,
  chocolateIce,
  type StaticIMG,
} from "@/assets/images";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";

interface DessertItem {
  id: string;
  label: string;
  price: number;
  image: StaticIMG;
  available?: boolean;
}

interface DessertCategory {
  id: string;
  label: string;
  image: StaticIMG;
  items: DessertItem[];
}

const OTHER_DESSERTS: DessertCategory[] = [
  {
    id: "brownie",
    label: "براونيز",
    image: browniesCake,
    items: [
      {
        id: "brownie-plain",
        label: "براونيز عادي",
        price: 8,
        image: chocolateIce,
        available: true,
      },
      {
        id: "brownie-nutella",
        label: "براونيز نوتيلا",
        price: 10,
        image: nutellaIce,
        available: true,
      },
      {
        id: "brownie-lotus",
        label: "براونيز لوتس",
        price: 10,
        image: lotusIce,
        available: true,
      },
    ],
  },
  {
    id: "cookies",
    label: "كوكيز",
    image: mochi,
    items: [
      {
        id: "cookies-nutella",
        label: "كوكيز نوتيلا",
        price: 8,
        image: nutellaIce,
        available: true,
      },
      {
        id: "cookies-lotus",
        label: "كوكيز لوتس",
        price: 10,
        image: lotusIce,
        available: true,
      },
      {
        id: "cookies-pistachio",
        label: "كوكيز بيستاشيو",
        price: 12,
        image: pistachioIce,
        available: true,
      },
      {
        id: "cookies-mix",
        label: "كوكيز مكس",
        price: 10,
        image: chocolateIce,
        available: true,
      },
    ],
  },
  {
    id: "cheesecake",
    label: "تشيز كيك",
    image: sanSebastian,
    items: [
      {
        id: "cheesecake-strawberry",
        label: "تشيز كيك فراولة",
        price: 12,
        image: strawberryIce,
        available: true,
      },
      {
        id: "cheesecake-lotus",
        label: "تشيز كيك لوتس",
        price: 14,
        image: lotusIce,
        available: true,
      },
      {
        id: "cheesecake-pistachio",
        label: "تشيز كيك بيستاشيو",
        price: 16,
        image: pistachioIce,
        available: true,
      },
      {
        id: "cheesecake-mix",
        label: "تشيز كيك مكس",
        price: 14,
        image: chocolateIce,
        available: true,
      },
    ],
  },
];

export default function OtherDessertsOrderClientPage({
  initialType = "brownie",
}: {
  initialType?: string;
}) {
  const activeCategory = useMemo(
    () =>
      OTHER_DESSERTS.find((c) => c.id === initialType) ?? OTHER_DESSERTS[0],
    [initialType],
  );

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
    const item = activeCategory.items.find((i) => i.id === id);
    return sum + (item?.price ?? 0) * qty;
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
    if (totalItems === 0)
      return showValidation(`اختر ${activeCategory.label} واحد على الأقل`);

    Object.entries(counts).forEach(([id, qty]) => {
      if (qty <= 0) return;
      const item = activeCategory.items.find((i) => i.id === id);
      if (!item) return;

      addItem({
        productId: activeCategory.id,
        name: `${activeCategory.label} — ${item.label}`,
        type: item.label,
        addons: [],
        addonTotal: 0,
        unitPrice: item.price,
        quantity: qty,
      });
    });

    setAddedToCart(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setAddedToCart(false), 2000);
    clearSelections();
  }

  const getItemImage = (id: string) =>
    activeCategory.items.find((i) => i.id === id)?.image ?? activeCategory.image;

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <BackButton
        onBeforeBack={() => guardBeforeBack()}
        disabled={hasPendingSelections}
      />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-36 max-w-3xl">
        {/* ── Hero card ── */}
        <div className="bg-white/17 backdrop-blur-[15px] mb-6 rounded-[28px] overflow-hidden">
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div>
                <h1 className="font-bold text-[28px] text-white sm:text-[34px] leading-tight">
                  {activeCategory.label}
                </h1>
                <p className="text-[14px] text-white/55">
                  خصّص طلبك خطوة بخطوة
                </p>
              </div>
              <Image
                src={activeCategory.image}
                alt={activeCategory.label}
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
                اختر أصناف {activeCategory.label}
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 border border-green-500/40 rounded-full">
                <Check size={13} className="text-green-400" />
                <span className="font-medium text-[11px] text-green-300">
                  مطلوب
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {activeCategory.items.map((item) => {
                const count = counts[item.id] ?? 0;
                const isUnavailable = item.available === false;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 border rounded-[16px] px-4 py-4 transition-all
                      ${isUnavailable ? "opacity-50 bg-white/5 border-white/5 cursor-not-allowed" : count > 0 ? "bg-glace-yellow/10 border-glace-yellow/50" : "bg-white/8 border-white/10 hover:bg-white/12"}`}
                  >
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
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div className="bottom-23 lg:bottom-0 z-9999997 fixed inset-x-0 bg-linear-to-t from-[#1a6278]/95 to-transparent px-4 pt-6 pb-4 pointer-events-none">
        <div className="flex flex-wrap items-center gap-4 bg-white/18 backdrop-blur-[20px] mx-auto px-5 py-4 border border-white/20 rounded-[24px] max-w-3xl pointer-events-auto">
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

      {zoomedImageId && (
        <ImageZoomDialog
          isOpen={!!zoomedImageId}
          onClose={() => setZoomedImageId(null)}
          src={getItemImage(zoomedImageId)}
          alt={activeCategory.label}
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
