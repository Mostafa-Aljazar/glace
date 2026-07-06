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
import { ADDONS, type SimpleMenuItem } from "@/data/OrderData";
import { iceCreamKunafa, arabianIce, lotusIce, nutellaIce, blueberryIce, pistachioIce, energyIce } from "@/assets/images";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";

interface MixSelection {
  id: string; // unique id: `${mixLabel}_${timestamp}`
  mixLabel: string;
  count: number;
  selectedFlavors: string[];
}

const KUNAFA_CONFIG: {
  id: string;
  label: string;
  image: typeof iceCreamKunafa;
  items: SimpleMenuItem[];
  mixes: any[];
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
  const [notes, setNotes] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  const totalItems = Object.values(counts).reduce((s, c) => s + c, 0);
  const mixItems = mixSelections.filter((m) => m.count > 0).length;
  const hasPendingSelections =
    totalItems > 0 ||
    mixItems > 0 ||
    notes.trim().length > 0;

  const clearSelections = useCallback(() => {
    setCounts({});
    setMixSelections([]);
    setNotes("");
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


  function toggleMixFlavor(mixId: string, flavor: string) {
    setMixSelections((prev) => {
      const mixIdx = prev.findIndex((m) => m.id === mixId);
      if (mixIdx === -1) return prev;

      const mix = prev[mixIdx];
      const mixConfig = KUNAFA_CONFIG.mixes?.find((m) => m.label === mix.mixLabel);
      if (!mixConfig) return prev;

      const updated = [...prev];
      if (mix.selectedFlavors.includes(flavor)) {
        updated[mixIdx] = {
          ...mix,
          selectedFlavors: mix.selectedFlavors.filter((f) => f !== flavor),
        };
      } else if (mix.selectedFlavors.length < mixConfig.pick) {
        const newFlavors = [...mix.selectedFlavors, flavor];
        // Auto-set count to 1 when mix becomes complete
        const newCount = newFlavors.length === mixConfig.pick ? 1 : mix.count;
        updated[mixIdx] = {
          ...mix,
          selectedFlavors: newFlavors,
          count: newCount,
        };
      }
      return updated;
    });
  }

  function incrementMix(mixId: string) {
    setMixSelections((prev) => {
      const mixIdx = prev.findIndex((m) => m.id === mixId);
      if (mixIdx === -1) return prev;
      const updated = [...prev];
      updated[mixIdx] = { ...updated[mixIdx], count: updated[mixIdx].count + 1 };
      return updated;
    });
  }

  function decrementMix(mixId: string) {
    setMixSelections((prev) => {
      const mixIdx = prev.findIndex((m) => m.id === mixId);
      if (mixIdx === -1) return prev;
      const updated = [...prev];
      const next = updated[mixIdx].count - 1;
      if (next <= 0) {
        return prev.filter((m) => m.id !== mixId);
      }
      updated[mixIdx] = { ...updated[mixIdx], count: next };
      return updated;
    });
  }

  function removeMixSelection(mixId: string) {
    setMixSelections((prev) => prev.filter((m) => m.id !== mixId));
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
            type: label,
            addons: [],
            addonTotal: 0,
            unitPrice: item.price,
            quantity: qty,
            notes: notes || undefined,
          });
        }
      }
    });

    mixSelections.forEach((mix) => {
      if (mix.count > 0) {
        const mixConfig = KUNAFA_CONFIG.mixes?.find((m) => m.label === mix.mixLabel);
        if (mixConfig) {
          addItem({
            productId: KUNAFA_CONFIG.id,
            name: `${KUNAFA_CONFIG.label} — ${mix.mixLabel}`,
            type: mix.mixLabel,
            flavors: mix.selectedFlavors,
            addons: [],
            addonTotal: 0,
            unitPrice: mixConfig.price,
            quantity: mix.count,
            notes: notes || undefined,
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

  const totalPrice = Object.entries(counts).reduce((sum, [label, qty]) => {
    const item = KUNAFA_CONFIG.items.find((i) => i.label === label);
    return sum + (item?.price ?? 0) * qty;
  }, 0) +
  mixSelections.reduce((sum, mix) => {
    const mixConfig = KUNAFA_CONFIG.mixes?.find((m) => m.label === mix.mixLabel);
    return sum + (mixConfig?.price ?? 0) * mix.count;
  }, 0);

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
              <div className="border-t border-white/15 pt-6">
                {KUNAFA_CONFIG.mixes.map((mixConfig) => {
                  const mixInstancesForThisConfig = mixSelections.filter(
                    (m) => m.mixLabel === mixConfig.label
                  );

                  return (
                    <div key={mixConfig.label} className="mb-6 last:mb-0">
                      <div className="mb-4">
                        <h3 className="mb-2 font-bold text-[16px] text-white">
                          {mixConfig.label}
                        </h3>
                        <p className="text-[12px] text-white/60">
                          اختر {mixConfig.pick} {mixConfig.pick === 2 ? "طعمين" : "أطعمة"} — يمكنك إضافة عدة مكسات مختلفة
                        </p>
                      </div>

                      {/* Display all added instances */}
                      {mixInstancesForThisConfig.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {mixInstancesForThisConfig.map((mix, idx) => (
                            <div
                              key={mix.id}
                              className="p-3 bg-glace-yellow/10 border border-glace-yellow/30 rounded-lg"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <p className="text-[11px] text-white/60 mb-1">
                                    مكس رقم {idx + 1}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {mix.selectedFlavors.map((flavor) => (
                                      <span
                                        key={flavor}
                                        className="bg-glace-yellow text-[#1e6a7f] px-2 py-1 rounded-full text-[11px] font-bold"
                                      >
                                        {flavor}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeMixSelection(mix.id)}
                                  className="text-white/50 hover:text-white transition-colors shrink-0 text-lg"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="flex items-center gap-4 pt-2 border-t border-glace-yellow/20">
                                <p className="text-[12px] text-white/75">
                                  {mixConfig.price} ₪
                                </p>
                                <div className="flex items-center gap-1.5 ml-auto">
                                  <button
                                    type="button"
                                    onClick={() => decrementMix(mix.id)}
                                    className="flex justify-center items-center bg-white/15 border border-white/25 rounded-full w-6 h-6 text-white transition-colors cursor-pointer hover:bg-white/25"
                                  >
                                    <Minus size={11} />
                                  </button>
                                  <span className="min-w-6 font-bold text-[12px] text-white text-center">
                                    {mix.count || 0}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => incrementMix(mix.id)}
                                    className="flex justify-center items-center bg-white/15 border border-white/25 rounded-full w-6 h-6 text-white transition-colors cursor-pointer hover:bg-white/25"
                                  >
                                    <Plus size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Flavor selector for new instance */}
                      <div className="bg-glace-yellow/5 border border-glace-yellow/30 rounded-lg p-4">
                        {(() => {
                          const editingInstance = mixInstancesForThisConfig.find(
                            (m) => m.selectedFlavors.length < mixConfig.pick
                          );

                          return (
                            <>
                              {/* Building mix preview */}
                              {editingInstance && editingInstance.selectedFlavors.length > 0 && (
                                <div className="mb-4 p-3 bg-glace-yellow/15 border border-glace-yellow/40 rounded-lg">
                                  <p className="text-[11px] text-white/70 mb-2 font-medium">اختياراتك:</p>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {editingInstance.selectedFlavors.map((flavor) => (
                                      <div
                                        key={flavor}
                                        className="flex items-center gap-1.5 bg-glace-yellow text-[#1e6a7f] px-2.5 py-1.5 rounded-full text-[11px] font-bold"
                                      >
                                        <span>{flavor}</span>
                                        <button
                                          type="button"
                                          onClick={() => toggleMixFlavor(editingInstance.id, flavor)}
                                          className="hover:opacity-70 transition-opacity ml-1 text-[13px]"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-[11px] text-glace-yellow font-bold">
                                    {editingInstance.selectedFlavors.length}/{mixConfig.pick} مختارة
                                    {editingInstance.selectedFlavors.length === mixConfig.pick && " ✓"}
                                  </p>
                                </div>
                              )}

                              {/* Status message */}
                              <p className="text-[12px] text-white/70 mb-3 font-medium">
                                {editingInstance
                                  ? editingInstance.selectedFlavors.length === mixConfig.pick
                                    ? `✓ تم اختيار ${mixConfig.pick} أطعمة. اختر إذا أردت مكس آخر`
                                    : `اختر ${mixConfig.pick - editingInstance.selectedFlavors.length} أطعمة أخرى`
                                  : `اختر ${mixConfig.pick} ${mixConfig.pick === 2 ? "طعمين" : "أطعمة"}`}
                              </p>

                              {/* Flavor chips with images */}
                              <div className="flex flex-wrap gap-3">
                                {mixConfig.options.map((flavor: string) => {
                                  const selected = editingInstance?.selectedFlavors.includes(flavor);
                                  const isFull = editingInstance
                                    ? editingInstance.selectedFlavors.length >= mixConfig.pick
                                    : false;
                                  const flavorImage = mixConfig.optionImages && flavor in mixConfig.optionImages
                                    ? mixConfig.optionImages[flavor as keyof typeof mixConfig.optionImages]
                                    : undefined;
                                  // Check if this flavor's item is unavailable
                                  const flavorItem = KUNAFA_CONFIG.items.find((item) => item.label === flavor);
                                  const isFlavorUnavailable = flavorItem?.available === false;

                                  return (
                                    <button
                                      key={flavor}
                                      type="button"
                                      onClick={() => {
                                        // If no editing instance exists, create one THEN toggle
                                        if (!editingInstance) {
                                          const newId = `${mixConfig.label}_${Date.now()}_${Math.random()}`;
                                          setMixSelections((prev) => [
                                            ...prev,
                                            { id: newId, mixLabel: mixConfig.label, count: 0, selectedFlavors: [flavor] },
                                          ]);
                                        } else {
                                          // Toggle on existing editing instance
                                          toggleMixFlavor(editingInstance.id, flavor);
                                        }
                                      }}
                                      disabled={(isFull && !selected) || isFlavorUnavailable}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-medium cursor-pointer transition-all duration-200 ${
                                        isFlavorUnavailable
                                          ? "opacity-35 cursor-not-allowed bg-white/5 border-white/15 text-white/40"
                                          : selected
                                            ? "bg-glace-yellow border-glace-yellow text-[#1e6a7f] font-bold shadow-lg"
                                            : isFull && !selected
                                              ? "opacity-30 cursor-not-allowed bg-white/5 border-white/15 text-white/40"
                                              : "bg-white/10 border-white/25 text-white hover:bg-white/20 hover:border-white/40"
                                      }`}
                                    >
                                      {flavorImage && (
                                        <Image
                                          src={flavorImage}
                                          alt={flavor}
                                          width={24}
                                          height={24}
                                          className="rounded-md w-6 h-6 object-contain"
                                        />
                                      )}
                                      <span>{flavor}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Notes section */}
            {KUNAFA_CONFIG.hasNotes && (
              <div className="mt-6 pt-6 border-white/15 border-t">
                <label className="block mb-2 font-medium text-[14px] text-white">
                  إذا حبيت تضيف ملاحظة:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف ملاحظتك هنا..."
                  className="bg-[#4397ae] px-5 py-3 border border-white/20 focus:border-white/40 rounded-full focus:outline-none w-full text-[14px] text-white transition-all resize-none placeholder-white/40"
                  rows={3}
                />
              </div>
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
