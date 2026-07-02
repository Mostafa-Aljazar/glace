"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Minus, Plus, X } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import AddToCartButton from "@/components/Order/AddToCartButton";
import FlavorBall from "@/components/Order/FlavorBall";
import BackButton from "@/components/Order/BackButton";
import { iceCreamCup, biscuitIceCream, emptyPop } from "@/assets/images";
import {
  CLASSIC_FLAVORS,
  SPECIAL_FLAVORS,
  ADDONS,
  ICE_PRICES,
  SIZE_MAX_BALLS,
} from "@/data/OrderData";
import type { Flavor } from "@/data/OrderData";
import { useCartStore } from "@/store/cartStore";

type CupVariant = "كاسة" | "بسكوت";
type FlavorType = "كلاسيك" | "سبيشل" | "مكس";

const CUP_SIZES = ["كاسة صغير", "كاسة وسط", "كاسة كبير", "تيك اواي"] as const;
const BISC_SIZES = ["بسكوت صغير", "بسكوت وسط", "بسكوت كبير"] as const;

// ── StepCard ─────────────────────────────────────────────────────────
function StepCard({
  step,
  title,
  active,
  done,
  children,
}: {
  step: number;
  title: string;
  active: boolean;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white/17 backdrop-blur-[15px] rounded-[28px] p-5 sm:p-7 [border-width:1.5px] transition-all duration-200
      ${
        done
          ? "border-glace-yellow"
          : active
            ? "border-glace-yellow"
            : "border-white/30 opacity-50 pointer-events-none select-none"
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-full text-[14px] font-bold shrink-0 transition-all
          ${done ? "bg-glace-yellow text-[#1e6a7f]" : "bg-white/20 text-white"}`}
        >
          {done ? <CheckCircle2 size={16} /> : step}
        </span>
        <h3 className="font-bold text-[18px] text-white sm:text-[20px]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ── Pill button ───────────────────────────────────────────────────────
function Pill({
  label,
  sublabel,
  active,
  onClick,
  disabled = false,
}: {
  label: string;
  sublabel?: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-xl border text-[15px] sm:text-[16px] font-medium transition-all duration-150 cursor-pointer
        ${
          disabled
            ? "opacity-35 cursor-not-allowed bg-white/5 border-white/15 text-white/50"
            : active
              ? "bg-glace-yellow border-glace-yellow text-[#1e6a7f] font-bold shadow-[0_4px_16px_rgba(244,228,81,0.4)]"
              : "bg-white/10 border-white/25 text-white hover:bg-white/20 hover:border-white/50"
        }`}
    >
      <span>{label}</span>
      {sublabel && (
        <span
          className={`text-[11px] ${active ? "text-[#1e6a7f]/70" : "text-white/50"}`}
        >
          {sublabel}
        </span>
      )}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function CupOrderClientPage() {
  const searchParams = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);

  const [variant, setVariant] = useState<CupVariant>("كاسة");
  const [size, setSize] = useState<string>("");
  const [flavorType, setFlavorType] = useState<FlavorType | "">("");
  const [selectedBalls, setSelectedBalls] = useState<number[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("type") === "بسكوت") setVariant("بسكوت");
  }, [searchParams]);

  function changeVariant(v: CupVariant) {
    setVariant(v);
    setSize("");
    setFlavorType("");
    setSelectedBalls([]);
    setSelectedAddons([]);
  }
  function changeSize(s: string) {
    setSize(s);
    setFlavorType("");
    setSelectedBalls([]);
  }
  function changeFlavorType(ft: FlavorType) {
    setFlavorType(ft);
    setSelectedBalls([]);
  }

  const sizes = variant === "كاسة" ? CUP_SIZES : BISC_SIZES;
  const maxBalls = size ? (SIZE_MAX_BALLS[size] ?? 1) : 0;
  const flavors: Flavor[] =
    flavorType === "سبيشل" ? SPECIAL_FLAVORS
    : flavorType === "مكس" ? [...CLASSIC_FLAVORS, ...SPECIAL_FLAVORS]
    : CLASSIC_FLAVORS;
  const allFlavors = [...CLASSIC_FLAVORS, ...SPECIAL_FLAVORS];

  const halfBalls = Math.floor(maxBalls / 2);
  const classicBalls = selectedBalls.filter((id) => CLASSIC_FLAVORS.some((f) => f.id === id));
  const specialBalls = selectedBalls.filter((id) => SPECIAL_FLAVORS.some((f) => f.id === id));

  function addBall(flavorId: number, group?: "classic" | "special") {
    setSelectedBalls((prev) => {
      if (prev.length >= maxBalls) return prev;
      if (flavorType === "مكس" && group) {
        const otherGroupHasBalls = group === "classic"
          ? prev.some((id) => SPECIAL_FLAVORS.some((f) => f.id === id))
          : prev.some((id) => CLASSIC_FLAVORS.some((f) => f.id === id));
        const remainingSlots = maxBalls - prev.length;
        const sameGroupCount = group === "classic"
          ? prev.filter((id) => CLASSIC_FLAVORS.some((f) => f.id === id)).length
          : prev.filter((id) => SPECIAL_FLAVORS.some((f) => f.id === id)).length;
        if (!otherGroupHasBalls && remainingSlots === 1) return prev;
        if (sameGroupCount >= maxBalls - 1) return prev;
      }
      return [...prev, flavorId];
    });
  }
  function removeBall(idx: number) {
    setSelectedBalls((prev) => prev.filter((_, i) => i !== idx));
  }
  function removeBallByFlavor(flavorId: number) {
    setSelectedBalls((prev) => prev.filter((id) => id !== flavorId));
  }
  function toggleAddon(id: number) {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  const basePrice = flavorType === "مكس"
    ? Math.round(((ICE_PRICES[`${size}.كلاسيك`] ?? 0) + (ICE_PRICES[`${size}.سبيشال`] ?? 0)) / 2)
    : ICE_PRICES[`${size}.${flavorType}`] ?? 0;
  const addonSum = selectedAddons.reduce(
    (s, id) => s + (ADDONS.find((a) => a.id === id)?.price ?? 0),
    0,
  );
  const total = (basePrice + addonSum) * quantity;

  const s1Done = !!variant;
  const s2Done = !!size;
  const s3Done = !!flavorType;
  const s4Done = maxBalls > 0 && selectedBalls.length === maxBalls;
  const canAdd = s2Done && s3Done && s4Done;

  function showValidation(msg: string) {
    setValidationMsg(msg);
    setTimeout(() => setValidationMsg(""), 3000);
  }

  function handleAddToCart() {
    if (!variant) return showValidation("اختر النوع أولاً");
    if (!size) return showValidation("اختر الحجم أولاً");
    if (!flavorType) return showValidation("اختر نوع الأيس كريم أولاً");
    if (!s4Done)
      return showValidation(
        `أكمل اختيار الأطعمة (${selectedBalls.length}/${maxBalls})`,
      );

    const flavorNames = selectedBalls
      .map((id) => allFlavors.find((f) => f.id === id)?.name ?? "")
      .filter(Boolean);
    const addonNames = selectedAddons
      .map((id) => ADDONS.find((a) => a.id === id)?.name ?? "")
      .filter(Boolean);
    addItem({
      productId: variant === "كاسة" ? "cup" : "biscuit",
      name: variant === "كاسة" ? "بوظة كاسة" : "بوظة بسكوت",
      size,
      type: flavorType || undefined,
      flavors: flavorNames,
      addons: addonNames,
      addonTotal: addonSum,
      unitPrice: basePrice,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    setSize("");
    setFlavorType("");
    setSelectedBalls([]);
    setSelectedAddons([]);
    setQuantity(1);
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-36 max-w-3xl">
        {/* Page header + price table */}
        <div className="bg-white/17 backdrop-blur-[15px] mb-6 rounded-[28px] overflow-hidden">
          <div className="flex md:flex-row flex-col gap-5 p-5 w-full">
            {/* Image + title + flavor examples */}
            <div className="flex flex-col gap-4 md:w-1/2">
              <div className="flex items-center gap-4">
                <Image
                  src={variant === "كاسة" ? iceCreamCup : biscuitIceCream}
                  alt=""
                  width={80}
                  height={80}
                  className="drop-shadow-xl w-16 sm:w-20 h-16 sm:h-20 object-contain transition-all duration-200 shrink-0"
                />
                <div>
                  <h1 className="font-bold text-[28px] text-white sm:text-[36px] leading-tight">
                    {variant === "كاسة" ? "بوظة كاسة" : "بوظة بسكوت"}
                  </h1>
                  <p className="text-[14px] text-white/55">
                    خصّص طلبك خطوة بخطوة
                  </p>
                </div>
              </div>

              {/* Flavor examples */}
              <div className="bg-white/8 p-4 rounded-[18px] text-[13px] text-white leading-relaxed">
                <p className="mb-1 font-semibold text-glace-yellow">كلاسيك</p>
                <p className="text-white/75">
                  شوكولاتة · فانيلا · فراولة · كراميل · نسكافيه · ...
                </p>
                <p className="mt-3 mb-1 font-semibold text-glace-yellow">
                  سبيشل
                </p>
                <p className="text-white/75">
                  عربية · نوتيلا · أوريو · كت كات · لوتس · ...
                </p>
              </div>
            </div>

            {/* Price table */}
            <div className="flex flex-col gap-3 md:w-1/2">
              <div className="bg-[#2d849e94] backdrop-blur-[20px] p-4 rounded-[20px]">
                <h3 className="mb-3 font-bold text-[16px] text-white">
                  {variant === "كاسة" ? "أسعار الكاسة" : "أسعار البسكوت"}
                </h3>
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-white/20 border-b">
                      <th className="px-2 py-1 font-normal text-[13px] text-white/60 text-right">
                        الحجم
                      </th>
                      <th className="px-2 py-1 font-normal text-[13px] text-white/60 text-center">
                        كرات
                      </th>
                      <th className="px-2 py-1 font-normal text-[13px] text-white/60 text-center">
                        كلاسيك
                      </th>
                      <th className="px-2 py-1 font-normal text-[13px] text-white/60 text-center">
                        مكس
                      </th>
                      <th className="px-2 py-1 font-normal text-[13px] text-white/60 text-center">
                        سبيشل
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(variant === "كاسة"
                      ? [
                          { label: "صغير", key: "كاسة صغير" },
                          { label: "وسط", key: "كاسة وسط" },
                          { label: "كبير", key: "كاسة كبير" },
                          { label: "تيك اواي", key: "تيك اواي" },
                        ]
                      : [
                          { label: "صغير", key: "بسكوت صغير" },
                          { label: "وسط", key: "بسكوت وسط" },
                          { label: "كبير", key: "بسكوت كبير" },
                        ]
                    ).map(({ label, key }) => {
                      const balls = SIZE_MAX_BALLS[key] ?? 1;
                      return (
                        <tr
                          key={key}
                          className="border-white/15 last:border-0 border-b"
                        >
                          <td className="px-2 py-2 font-medium text-[15px] text-start">
                            {label}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <div className="flex justify-center items-center gap-1">
                              <span className="font-bold text-[13px] text-glace-yellow">
                                {balls}×
                              </span>
                              <Image
                                src={emptyPop}
                                alt=""
                                width={20}
                                height={20}
                                className="opacity-80 w-5 h-5 object-contain"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2 text-[15px] text-center">
                            {ICE_PRICES[`${key}.كلاسيك`] ?? "—"} ₪
                          </td>
                          <td className="px-2 py-2 text-[15px] text-center">
                            {(() => {
                              const c = ICE_PRICES[`${key}.كلاسيك`];
                              const s = ICE_PRICES[`${key}.سبيشال`];
                              return c !== undefined && s !== undefined ? `${Math.round((c + s) / 2)} ₪` : "—";
                            })()}
                          </td>
                          <td className="px-2 py-2 text-[15px] text-center">
                            {ICE_PRICES[`${key}.سبيشال`] ?? "—"} ₪
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Step 1 — النوع */}
          <StepCard step={1} title="اختر النوع" active done={s1Done}>
            <div className="flex flex-wrap gap-3">
              {(["كاسة", "بسكوت"] as CupVariant[]).map((v) => (
                <Pill
                  key={v}
                  label={v}
                  active={variant === v}
                  onClick={() => changeVariant(v)}
                />
              ))}
            </div>
          </StepCard>

          {/* Step 2 — الحجم */}
          <StepCard step={2} title="اختر الحجم" active={s1Done} done={s2Done}>
            <div className="flex flex-wrap gap-3">
              {sizes.map((s) => {
                const balls = SIZE_MAX_BALLS[s] ?? 1;
                const label = s.replace("كاسة ", "").replace("بسكوت ", "");
                return (
                  <Pill
                    key={s}
                    label={label}
                    sublabel={`${balls} ${balls === 1 ? "كورة" : "كور"}`}
                    active={size === s}
                    onClick={() => changeSize(s)}
                  />
                );
              })}
            </div>
          </StepCard>

          {/* Step 3 — نوع الأطعمة */}
          <StepCard
            step={3}
            title="اختر نوع الأطعمة"
            active={s2Done}
            done={s3Done}
          >
            <div className="flex flex-wrap gap-3">
              {(["كلاسيك", "سبيشل", "مكس"] as FlavorType[]).map((ft) => {
                const isDisabled =
                  (ft === "سبيشل" || ft === "مكس") &&
                  (size === "بسكوت صغير" || size === "كاسة صغير");
                return (
                  <Pill
                    key={ft}
                    label={ft}
                    sublabel={
                      ft === "كلاسيك" ? "أطعمة كلاسيكية"
                      : ft === "سبيشل" ? "أطعمة سبيشل"
                      : "كلاسيك + سبيشل"
                    }
                    active={flavorType === ft}
                    disabled={isDisabled}
                    onClick={() => changeFlavorType(ft)}
                  />
                );
              })}
            </div>
          </StepCard>

          {/* Step 4 — الأطعمة */}
          <StepCard
            step={4}
            title={`اختر الأطعمة (${selectedBalls.length}/${maxBalls})`}
            active={s3Done}
            done={s4Done}
          >
            <div className="flex flex-wrap gap-2 -mt-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-white/8 px-3 py-1 rounded-full text-[11px] text-white/50">
                <span className="font-bold text-green-400">+</span> اضغط على
                الطعم لإضافته أو تكراره
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/8 px-3 py-1 rounded-full text-[11px] text-white/50">
                <span className="font-bold text-red-400">✕</span> اضغط على الكرة
                لإزالتها
              </span>
            </div>
            {/* Ball tray */}
            <div className="flex flex-wrap items-center gap-2 bg-white/10 mb-5 p-3 rounded-[16px]">
              {Array.from({ length: maxBalls }).map((_, idx) => {
                const flavorId = selectedBalls[idx];
                const flavor =
                  flavorId !== undefined
                    ? allFlavors.find((f) => f.id === flavorId)
                    : undefined;
                return flavor ? (
                  <div
                    key={idx}
                    className="group relative cursor-pointer"
                    onClick={() => removeBall(idx)}
                  >
                    <div className="-top-1.5 -right-1.5 z-10 absolute flex justify-center items-center bg-red-500 rounded-full w-4 h-4 text-white">
                      <X size={9} />
                    </div>
                    <Image
                      src={flavor.image}
                      alt={flavor.name}
                      width={48}
                      height={48}
                      className="group-hover:opacity-70 w-12 h-12 object-contain transition-opacity"
                    />
                  </div>
                ) : (
                  <Image
                    key={idx}
                    src={emptyPop}
                    alt=""
                    width={48}
                    height={48}
                    className="opacity-70 brightness-0 w-12 h-12 object-contain"
                  />
                );
              })}
            </div>

            {/* Flavor grid */}
            {flavorType === "مكس" ? (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="mb-3 pb-1.5 border-b border-white/15 text-[13px] font-semibold text-white/60">
                    كلاسيك <span className="font-normal text-white/40">({classicBalls.length})</span>
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {CLASSIC_FLAVORS.map((flavor) => {
                      const count = classicBalls.filter((id) => id === flavor.id).length;
                      return (
                        <FlavorBall key={flavor.id} flavor={flavor} count={count}
                          isFull={selectedBalls.length >= maxBalls || classicBalls.length >= maxBalls - 1}
                          onAdd={() => addBall(flavor.id, "classic")}
                          onRemove={(e) => { e.stopPropagation(); removeBallByFlavor(flavor.id); }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-3 pb-1.5 border-b border-white/15 text-[13px] font-semibold text-white/60">
                    سبيشل <span className="font-normal text-white/40">({specialBalls.length})</span>
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {SPECIAL_FLAVORS.map((flavor) => {
                      const count = specialBalls.filter((id) => id === flavor.id).length;
                      return (
                        <FlavorBall key={flavor.id} flavor={flavor} count={count}
                          isFull={selectedBalls.length >= maxBalls || specialBalls.length >= maxBalls - 1}
                          onAdd={() => addBall(flavor.id, "special")}
                          onRemove={(e) => { e.stopPropagation(); removeBallByFlavor(flavor.id); }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {flavors.map((flavor) => {
                  const count = selectedBalls.filter((id) => id === flavor.id).length;
                  return (
                    <FlavorBall key={flavor.id} flavor={flavor} count={count}
                      isFull={selectedBalls.length >= maxBalls}
                      onAdd={() => addBall(flavor.id)}
                      onRemove={(e) => { e.stopPropagation(); removeBallByFlavor(flavor.id); }}
                    />
                  );
                })}
              </div>
            )}
          </StepCard>

          {/* Step 5 — الإضافات (optional) */}
          <StepCard
            step={5}
            title="الإضافات (اختياري)"
            active={s4Done}
            done={selectedAddons.length > 0}
          >
            <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
              {ADDONS.map((addon) => {
                const checked = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border text-right transition-all cursor-pointer
                      ${
                        checked
                          ? "bg-glace-yellow/15 border-glace-yellow/50 text-white"
                          : "bg-white/10 border-white/20 text-white/75 hover:border-white/40"
                      }`}
                  >
                    <span className="text-[14px]">{addon.name}</span>
                    <span
                      className={`text-[13px] font-bold shrink-0 ${checked ? "text-glace-yellow" : "text-white/50"}`}
                    >
                      +{addon.price} ₪
                    </span>
                  </button>
                );
              })}
            </div>
          </StepCard>
        </div>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div className="bottom-[92px] lg:bottom-0 z-9999997 fixed inset-x-0 bg-linear-to-t from-[#1a6278]/95 to-transparent px-4 pt-6 pb-4 pointer-events-none">
        <div className="flex flex-wrap items-center gap-4 bg-white/18 backdrop-blur-[20px] mx-auto px-5 py-4 border border-white/20 rounded-[24px] max-w-3xl pointer-events-auto">
          {/* Qty */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex justify-center items-center bg-white/15 border border-white/25 rounded-full w-9 h-9 text-white cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <span className="min-w-7 font-bold text-[20px] text-white text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex justify-center items-center bg-white/15 border border-white/25 rounded-full w-9 h-9 text-white cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Price */}
          <div className="flex-1">
            <p className="text-[12px] text-white/55">الإجمالي</p>
            <p className="font-bold text-[22px] text-glace-yellow leading-none">
              {total.toFixed(2)} ₪
            </p>
          </div>

          {/* CTA */}
          <AddToCartButton
            onClick={handleAddToCart}
            canAdd={canAdd}
            addedToCart={addedToCart}
            validationMsg={validationMsg}
          />
        </div>
      </div>

      <CartBar />
    </div>
  );
}
