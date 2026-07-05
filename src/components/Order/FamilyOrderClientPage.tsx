"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Minus, Plus, X } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import BackButton from "@/components/Order/BackButton";
import AddToCartButton from "@/components/Order/AddToCartButton";
import FlavorBall from "@/components/Order/FlavorBall";
import OrderLeaveConfirmationDialog from "@/components/Order/OrderLeaveConfirmationDialog";
import { useLeavePageGuard } from "@/hooks/order";
import { familyIceCream, emptyPop } from "@/assets/images";
import { CLASSIC_FLAVORS, SPECIAL_FLAVORS } from "@/data/OrderData";
import { useCartStore } from "@/store/cartStore";

type ContainerType = "كلاسيكس" | "فلين";
type FamilySize = "علبة نص لتر" | "علبة لتر" | "فلين نص لتر" | "فلين لتر";
type FlavorType = "كلاسيك" | "سبيشل" | "مكس";

const CLASSIC_SIZES: {
  label: FamilySize;
  classic: number;
  special: number;
  balls: number;
}[] = [
  { label: "علبة نص لتر", classic: 14, special: 18, balls: 8 },
  { label: "علبة لتر", classic: 28, special: 35, balls: 12 },
];

const FLIN_SIZES: {
  label: FamilySize;
  classic: number;
  special: number;
  balls: number;
}[] = [
  { label: "فلين نص لتر", classic: 16, special: 20, balls: 8 },
  { label: "فلين لتر", classic: 31, special: 38, balls: 12 },
];

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
}: {
  label: string;
  sublabel?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-xl border text-[15px] sm:text-[16px] font-medium transition-all duration-150 cursor-pointer
        ${
          active
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
export default function FamilyOrderClientPage() {
  const addItem = useCartStore((s) => s.addItem);

  const [containerType, setContainerType] = useState<ContainerType | "">("");
  const [familySize, setFamilySize] = useState<FamilySize | "">("");
  const [flavorType, setFlavorType] = useState<FlavorType | "">("");
  const [selectedBalls, setSelectedBalls] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  const hasPendingSelections =
    containerType !== "" ||
    familySize !== "" ||
    flavorType !== "" ||
    selectedBalls.length > 0 ||
    quantity !== 1;

  const clearSelections = useCallback(() => {
    setContainerType("");
    setFamilySize("");
    setFlavorType("");
    setSelectedBalls([]);
    setQuantity(1);
  }, []);

  const {
    showCloseConfirm,
    handleCancelLeave,
    handleConfirmLeave,
    handleBeforeBack,
  } = useLeavePageGuard(hasPendingSelections, clearSelections);

  function changeContainerType(ct: ContainerType) {
    setContainerType(ct);
    setFamilySize("");
    setFlavorType("");
    setSelectedBalls([]);
  }
  function changeFamilySize(s: FamilySize) {
    setFamilySize(s);
    setFlavorType("");
    setSelectedBalls([]);
  }
  function changeFlavorType(ft: FlavorType) {
    setFlavorType(ft);
    setSelectedBalls([]);
  }

  const sizes =
    containerType === "كلاسيكس"
      ? CLASSIC_SIZES
      : containerType === "فلين"
        ? FLIN_SIZES
        : [];
  const allSizes = [...CLASSIC_SIZES, ...FLIN_SIZES];
  const sizeData = allSizes.find((s) => s.label === familySize);
  const allFlavors = [...CLASSIC_FLAVORS, ...SPECIAL_FLAVORS];

  const flavors =
    flavorType === "كلاسيك"
      ? CLASSIC_FLAVORS
      : flavorType === "سبيشل"
        ? SPECIAL_FLAVORS
        : allFlavors;

  const maxBalls = sizeData?.balls ?? 0;
  const halfBalls = maxBalls / 2;

  const classicBalls = selectedBalls.filter((id) =>
    CLASSIC_FLAVORS.some((f) => f.id === id),
  );
  const specialBalls = selectedBalls.filter((id) =>
    SPECIAL_FLAVORS.some((f) => f.id === id),
  );

  function addBall(flavorId: number, group?: "classic" | "special") {
    setSelectedBalls((prev) => {
      if (flavorType === "مكس") {
        const cCount = prev.filter((id) =>
          CLASSIC_FLAVORS.some((f) => f.id === id),
        ).length;
        const sCount = prev.filter((id) =>
          SPECIAL_FLAVORS.some((f) => f.id === id),
        ).length;
        if (group === "classic" && cCount >= halfBalls) return prev;
        if (group === "special" && sCount >= halfBalls) return prev;
      } else {
        if (prev.length >= maxBalls) return prev;
      }
      return [...prev, flavorId];
    });
  }

  function removeBallByFlavor(flavorId: number) {
    setSelectedBalls((prev) => prev.filter((id) => id !== flavorId));
  }

  const unitPrice = sizeData
    ? flavorType === "مكس"
      ? Math.round((sizeData.classic + sizeData.special) / 2)
      : flavorType === "سبيشل"
        ? sizeData.special
        : sizeData.classic
    : 0;

  const total = unitPrice * quantity;
  const s1Done = !!containerType;
  const s2Done = !!familySize;
  const s3Done = !!flavorType;
  const s4Done =
    flavorType === "مكس"
      ? classicBalls.length === halfBalls && specialBalls.length === halfBalls
      : selectedBalls.length === maxBalls;
  const canAdd = s2Done && s3Done && s4Done;

  function showValidation(msg: string) {
    setValidationMsg(msg);
    setTimeout(() => setValidationMsg(""), 3000);
  }

  function handleAddToCart() {
    if (!containerType) return showValidation("اختر نوع العبوة أولاً");
    if (!familySize) return showValidation("اختر الحجم أولاً");
    if (!flavorType) return showValidation("اختر نوع الأيس كريم أولاً");
    if (maxBalls === 0 || selectedBalls.length < maxBalls)
      return showValidation(
        `أكمل اختيار الأطعمة (${selectedBalls.length}/${maxBalls})`,
      );

    const flavorNames = selectedBalls
      .map((id) => allFlavors.find((f) => f.id === id)?.name ?? "")
      .filter(Boolean);
    addItem({
      productId: "family",
      name: "بوظة عائلي",
      size: familySize || undefined,
      type: flavorType || undefined,
      flavors: flavorNames,
      addons: [],
      addonTotal: 0,
      unitPrice,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    setFamilySize("");
    setFlavorType("");
    setSelectedBalls([]);
    setQuantity(1);
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-36 max-w-3xl">
        <BackButton onBeforeBack={handleBeforeBack} />
        {/* Page header + price table */}
        <div className="bg-white/17 backdrop-blur-[15px] mb-6 rounded-[28px] overflow-hidden">
          <div className="flex md:flex-row flex-col gap-5 p-5 w-full">
            {/* Image + title */}
            <div className="flex flex-col gap-4 md:w-1/2">
              <div className="flex items-center gap-4">
                <Image
                  src={familyIceCream}
                  alt="بوظة عائلي"
                  width={80}
                  height={80}
                  className="drop-shadow-xl w-16 sm:w-20 h-16 sm:h-20 object-contain shrink-0"
                />
                <div>
                  <h1 className="font-bold text-[28px] text-white sm:text-[34px] leading-tight">
                    بوظة عائلي
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
            <div className="md:w-1/2">
              <div className="bg-[#2d849e94] backdrop-blur-[20px] p-4 rounded-[20px]">
                <h3 className="mb-3 font-bold text-[16px] text-white">
                  أسعار البوظة العائلي
                </h3>
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-white/20 border-b text-[13px] text-white/60">
                      <th className="px-2 py-1.5 font-medium text-start">
                        الحجم
                      </th>
                      <th className="px-2 py-1.5 font-medium text-center">
                        كرات
                      </th>
                      <th className="px-2 py-1.5 font-medium text-center">
                        كلاسيك
                      </th>
                      <th className="px-2 py-1.5 font-medium text-center">
                        سبيشل
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...CLASSIC_SIZES, ...FLIN_SIZES].map(
                      ({ label, classic, special, balls }) => (
                        <tr
                          key={label}
                          className="border-white/15 last:border-0 border-b"
                        >
                          <td className="px-2 py-2 font-medium text-[14px] text-start">
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
                          <td className="px-2 py-2 text-[14px] text-center">
                            {classic} ₪
                          </td>
                          <td className="px-2 py-2 text-[14px] text-center">
                            {special} ₪
                          </td>
                        </tr>
                      ),
                    )}
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
              {(["كلاسيكس", "فلين"] as ContainerType[]).map((ct) => (
                <Pill
                  key={ct}
                  label={ct}
                  sublabel={ct === "كلاسيكس" ? "علب بلاستيك" : "علب فلين"}
                  active={containerType === ct}
                  onClick={() => changeContainerType(ct)}
                />
              ))}
            </div>
          </StepCard>

          {/* Step 2 — الحجم */}
          <StepCard step={2} title="اختر الحجم" active={s1Done} done={s2Done}>
            <div className="flex flex-wrap gap-3">
              {sizes.map((s) => (
                <Pill
                  key={s.label}
                  label={s.label}
                  sublabel={`${s.balls} كرات · كلاسيك ${s.classic}₪ / سبيشل ${s.special}₪`}
                  active={familySize === s.label}
                  onClick={() => changeFamilySize(s.label)}
                />
              ))}
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
              {(["كلاسيك", "سبيشل", "مكس"] as FlavorType[]).map((ft) => (
                <Pill
                  key={ft}
                  label={ft}
                  sublabel={
                    ft === "كلاسيك"
                      ? `${sizeData?.classic ?? "—"} ₪`
                      : ft === "سبيشل"
                        ? `${sizeData?.special ?? "—"} ₪`
                        : sizeData
                          ? `${Math.round((sizeData.classic + sizeData.special) / 2)} ₪`
                          : "—"
                  }
                  active={flavorType === ft}
                  onClick={() => changeFlavorType(ft)}
                />
              ))}
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

            {/* Ball tray — 8 columns on lg, 6 on smaller */}
            <div className="gap-1.5 grid grid-cols-8 lg:grid-cols-10 bg-white/10 mb-5 p-3 rounded-[16px]">
              {Array.from({ length: maxBalls }).map((_, idx) => {
                const flavorId = selectedBalls[idx];
                const flavor =
                  flavorId !== undefined
                    ? [...CLASSIC_FLAVORS, ...SPECIAL_FLAVORS].find(
                        (f) => f.id === flavorId,
                      )
                    : undefined;
                return flavor ? (
                  <div
                    key={idx}
                    className="group relative aspect-square cursor-pointer"
                    onClick={() =>
                      setSelectedBalls((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    <div className="-top-1 -right-1 z-10 absolute flex justify-center items-center bg-red-500 rounded-full w-4 h-4 text-white">
                      <X size={9} />
                    </div>
                    <Image
                      src={flavor.image}
                      alt={flavor.name}
                      width={48}
                      height={48}
                      className="group-hover:opacity-70 w-full h-full object-contain transition-opacity"
                    />
                  </div>
                ) : (
                  <div key={idx} className="aspect-square">
                    <Image
                      src={emptyPop}
                      alt=""
                      width={48}
                      height={48}
                      className="opacity-15 w-full h-full object-contain"
                    />
                  </div>
                );
              })}
            </div>

            {flavorType === "مكس" ? (
              <div className="flex flex-col gap-6">
                {/* كلاسيك group */}
                <div>
                  <p className="mb-3 pb-1.5 border-white/15 border-b font-semibold text-[13px] text-white/60">
                    كلاسيك{" "}
                    <span className="font-normal text-white/40">
                      ({classicBalls.length}/{halfBalls})
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {CLASSIC_FLAVORS.map((f) => {
                      const count = classicBalls.filter(
                        (id) => id === f.id,
                      ).length;
                      const full = classicBalls.length >= halfBalls;
                      return (
                        <FlavorBall
                          key={f.id}
                          flavor={f}
                          count={count}
                          isFull={full}
                          onAdd={() => addBall(f.id, "classic")}
                          onRemove={(e) => {
                            e.stopPropagation();
                            removeBallByFlavor(f.id);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                {/* سبيشل group */}
                <div>
                  <p className="mb-3 pb-1.5 border-white/15 border-b font-semibold text-[13px] text-white/60">
                    سبيشل{" "}
                    <span className="font-normal text-white/40">
                      ({specialBalls.length}/{halfBalls})
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {SPECIAL_FLAVORS.map((f) => {
                      const count = specialBalls.filter(
                        (id) => id === f.id,
                      ).length;
                      const full = specialBalls.length >= halfBalls;
                      return (
                        <FlavorBall
                          key={f.id}
                          flavor={f}
                          count={count}
                          isFull={full}
                          onAdd={() => addBall(f.id, "special")}
                          onRemove={(e) => {
                            e.stopPropagation();
                            removeBallByFlavor(f.id);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {flavors.map((f) => {
                  const count = selectedBalls.filter(
                    (id) => id === f.id,
                  ).length;
                  const full = selectedBalls.length >= maxBalls;
                  return (
                    <FlavorBall
                      key={f.id}
                      flavor={f}
                      count={count}
                      isFull={full}
                      onAdd={() => addBall(f.id)}
                      onRemove={(e) => {
                        e.stopPropagation();
                        removeBallByFlavor(f.id);
                      }}
                    />
                  );
                })}
              </div>
            )}
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

      <OrderLeaveConfirmationDialog
        open={showCloseConfirm}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />
      <CartBar />
    </div>
  );
}
