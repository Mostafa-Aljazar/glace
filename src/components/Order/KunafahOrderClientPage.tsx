"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Check, Heart } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import AddToCartButton from "@/components/Order/AddToCartButton";
import BackButton from "@/components/Order/BackButton";
import OrderLeaveConfirmationDialog from "@/components/Order/OrderLeaveConfirmationDialog";
import { useLeavePageGuard } from "@/hooks/order";
import { type MixConfig, type SimpleMenuItem } from "@/data/OrderData";
import MixOrderSection, {
  type MixSelection,
} from "@/components/Order/MixOrderSection";
import { iceCreamKunafa, arabianIce, lotusIce, nutellaIce, blueberryIce, pistachioIce, energyIce } from "@/assets/images";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";

const KUNAFA_CONFIG: {
  id: string;
  label: string;
  image: typeof iceCreamKunafa;
  items: SimpleMenuItem[];
  mixes: MixConfig[];
  hasAddons: boolean;
  hasNotes: boolean;
} = {
  id: "kunafa",
  label: "كنافة آيس كريم",
  image: iceCreamKunafa,
  items: [
    { label: "كنافة عربية", price: 8, image: arabianIce },
    { label: "كنافة لوتس", price: 8, image: lotusIce },
    { label: "كنافة نوتيلا", price: 8, image: nutellaIce },
    { label: "كنافة بلوبيري", price: 8, image: blueberryIce, available: false },
    { label: "كنافة دوندورما بيستاشيو", price: 12, image: pistachioIce },
    { label: "كنافة طاقة (كل خميس)", price: 12, image: energyIce, available: false },
  ],
  mixes: [
    {
      label: "مكس (اختر طعمين)",
      pick: 2,
      price: 10,
      flavorPrice: 5,
      pistachioPrice: 8,
      options: [
        "كنافة عربية",
        "كنافة لوتس",
        "كنافة نوتيلا",
        "كنافة بلوبيري",
        "كنافة دوندورما بيستاشيو",
        "كنافة طاقة (كل خميس)",
      ],
      optionImages: {
        "كنافة عربية": arabianIce,
        "كنافة لوتس": lotusIce,
        "كنافة نوتيلا": nutellaIce,
        "كنافة بلوبيري": blueberryIce,
        "كنافة دوندورما بيستاشيو": pistachioIce,
        "كنافة طاقة (كل خميس)": energyIce,
      },
    },
  ],
  hasAddons: false,
  hasNotes: true,
};

export default function KunafahOrderClientPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mixSelections, setMixSelections] = useState<MixSelection[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  const totalItems = Object.values(counts).reduce((s, c) => s + c, 0);
  const mixItems = mixSelections.filter((m) => m.count > 0).length;
  const hasPendingSelections =
    totalItems > 0 ||
    mixItems > 0;

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
  const { toggle: toggleFavorite, isFavorite } = useFavoritesStore();

  function increment(itemLabel: string) {
    setCounts((prev) => ({ ...prev, [itemLabel]: (prev[itemLabel] ?? 0) + 1 }));
  }

  function decrement(itemLabel: string) {
    setCounts((prev) => {
      const next = (prev[itemLabel] ?? 0) - 1;
      if (next <= 0) {
        return Object.fromEntries(
          Object.entries(prev).filter(([k]) => k !== itemLabel),
        );
      }
      return { ...prev, [itemLabel]: next };
    });
  }

  function showValidation(msg: string) {
    setValidationMsg(msg);
    setTimeout(() => setValidationMsg(""), 3000);
  }

  function handleAddToCart() {
    if (totalItems === 0 && mixItems === 0) {
      return showValidation("اختر منتج واحد على الأقل");
    }

    Object.entries(counts).forEach(([label, qty]) => {
      if (qty > 0) {
        const item = KUNAFA_CONFIG.items.find((i) => i.label === label);
        if (item) {
          addItem({
            productId: KUNAFA_CONFIG.id,
            name: `${KUNAFA_CONFIG.label} — ${label}`,
            image: item.image?.src ?? KUNAFA_CONFIG.image.src,
            type: label,
            addons: [],
            addonTotal: 0,
            unitPrice: item.price,
            quantity: qty,
          });
        }
      }
    });

    mixSelections.forEach((mix) => {
      if (mix.count > 0) {
        addItem({
          productId: KUNAFA_CONFIG.id,
          name: `${KUNAFA_CONFIG.label} — ${mix.mixLabel}`,
          image: KUNAFA_CONFIG.image.src,
          type: mix.mixLabel,
          flavors: mix.selectedFlavors,
          addons: [],
          addonTotal: 0,
          unitPrice: mix.unitPrice,
          quantity: mix.count,
        });
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

  const totalPrice = Object.entries(counts).reduce((sum, [label, qty]) => {
    const item = KUNAFA_CONFIG.items.find((i) => i.label === label);
    return sum + (item?.price ?? 0) * qty;
  }, 0) +
  mixSelections.reduce((sum, mix) => sum + mix.unitPrice * mix.count, 0);

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
                  {KUNAFA_CONFIG.label}
                </h1>
                <p className="text-[14px] text-white/55">
                  خصّص طلبك خطوة بخطوة
                </p>
              </div>
              <Image
                src={KUNAFA_CONFIG.image}
                alt={KUNAFA_CONFIG.label}
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
                اختر المنتجات
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 border border-green-500/40 rounded-full">
                <Check size={13} className="text-green-400" />
                <span className="font-medium text-[11px] text-green-300">
                  مطلوب
                </span>
              </div>
            </div>

            {/* Flat items */}
            <div className="flex flex-col gap-3 mb-6">
              {KUNAFA_CONFIG.items.map((item) => {
                const count = counts[item.label] ?? 0;
                const isUnavailable = item.available === false;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 border rounded-[16px] px-4 py-4 transition-all ${
                      isUnavailable
                        ? "opacity-50 bg-white/5 border-white/5 cursor-not-allowed"
                        : count > 0
                          ? "bg-glace-yellow/10 border-glace-yellow/50"
                          : "bg-white/8 border-white/10 hover:bg-white/12"
                    }`}
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.label}
                        width={60}
                        height={60}
                        className="rounded-lg w-16 h-16 object-contain shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="font-medium text-[15px] text-white">
                          {item.label}
                        </p>
                        <p className="font-bold text-[16px] text-glace-yellow whitespace-nowrap">
                          {item.price} ₪
                        </p>
                      </div>
                    </div>

                    {!isUnavailable && (
                      <button
                        type="button"
                        onClick={() => toggleFavorite(`kunafa-${item.label}`)}
                        className="transition-colors shrink-0"
                      >
                        <Heart
                          size={20}
                          className={
                            isFavorite(`kunafa-${item.label}`)
                              ? "fill-red-500 text-red-500"
                              : "text-white/50 hover:text-white"
                          }
                        />
                      </button>
                    )}

                    {isUnavailable ? (
                      <span className="text-[12px] font-bold text-white/60 shrink-0">غير متاح</span>
                    ) : count === 0 ? (
                      <button
                        type="button"
                        onClick={() => increment(item.label)}
                        className="flex items-center gap-1.5 bg-glace-yellow hover:bg-yellow-300 shadow-md px-4 py-2 border-0 rounded-full font-bold text-[#1e6a7f] text-[13px] transition-all cursor-pointer shrink-0"
                      >
                        <ShoppingCart size={13} />
                        أضف
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-white/15 px-2 py-1 border border-white/25 rounded-full shrink-0">
                        <button
                          type="button"
                          onClick={() => decrement(item.label)}
                          className="flex justify-center items-center hover:bg-white/25 rounded-full w-6 h-6 text-white transition-colors cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="min-w-4 font-bold text-[14px] text-white text-center">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(item.label)}
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

            {/* Mix sections */}
            {KUNAFA_CONFIG.mixes && KUNAFA_CONFIG.mixes.length > 0 && (
              <MixOrderSection
                mixes={KUNAFA_CONFIG.mixes}
                items={KUNAFA_CONFIG.items}
                mixSelections={mixSelections}
                setMixSelections={setMixSelections}
              />
            )}

          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
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
            {totalItems + mixItems} {(totalItems + mixItems) === 1 ? "صنف" : "أصناف"}
          </p>

          <AddToCartButton
            onClick={handleAddToCart}
            canAdd={totalItems > 0 || mixItems > 0}
            addedToCart={addedToCart}
            validationMsg={validationMsg}
          />
        </div>
      </div>

      <OrderLeaveConfirmationDialog
        open={showCloseConfirm}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />

      <CartBar />
    </div>
  );
}
