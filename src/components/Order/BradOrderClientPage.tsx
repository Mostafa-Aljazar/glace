"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import AddToCartButton from "@/components/Order/AddToCartButton";
import FlavorBall from "@/components/Order/FlavorBall";
import BackButton from "@/components/Order/BackButton";
import { refrigerator, iceCream } from "@/assets/images";
import { CLASSIC_FLAVORS, SPECIAL_FLAVORS } from "@/data/OrderData";
import { useCartStore } from "@/store/cartStore";

type BradSize = "small" | "medium" | "large" | "half-liter" | "liter";
type BradFlavor = "lemon" | "mango" | "mix";
type IceType = "classic" | "special" | "mix";

const BRAD_SIZES: { value: BradSize; label: string; price: number }[] = [
  { value: "small",       label: "صغير",    price: 1 },
  { value: "medium",      label: "وسط",     price: 2 },
  { value: "large",       label: "كبير",    price: 3 },
  { value: "half-liter",  label: "نص لتر",  price: 3 },
  { value: "liter",       label: "لتر",     price: 6 },
];

const BRAD_FLAVORS: { value: BradFlavor; label: string }[] = [
  { value: "lemon", label: "ليمون" },
  { value: "mango", label: "مانجا" },
  { value: "mix",   label: "مكس"   },
];

const ICE_TYPES: { value: IceType; label: string; price: number }[] = [
  { value: "classic", label: "كلاسيك", price: 3 },
  { value: "special", label: "سبيشل",  price: 5 },
  { value: "mix",     label: "مكس",    price: 4 },
];

const ICE_ADDON: Record<IceType, number> = {
  classic: 3,
  special: 5,
  mix:     4,
};

// ── StepCard ──────────────────────────────────────────────────────────
function StepCard({
  step, title, active, done, children,
}: {
  step: number; title: string; active: boolean; done: boolean; children: React.ReactNode;
}) {
  return (
    <div className={`bg-white/17 backdrop-blur-[15px] rounded-[28px] p-5 sm:p-7 [border-width:1.5px] transition-all duration-200
      ${done
        ? "border-glace-yellow"
        : active
          ? "border-glace-yellow"
          : "border-white/30 opacity-50 pointer-events-none select-none"}`}>
      <div className="flex items-center gap-3 mb-5">
        <span className={`flex items-center justify-center w-8 h-8 rounded-full text-[14px] font-bold shrink-0 transition-all
          ${done ? "bg-glace-yellow text-[#1e6a7f]" : "bg-white/20 text-white"}`}>
          {done ? <CheckCircle2 size={16} /> : step}
        </span>
        <h3 className="text-white text-[18px] sm:text-[20px] font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────
function Pill({
  label, sublabel, active, onClick,
}: {
  label: string; sublabel?: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-xl border text-[15px] sm:text-[16px] font-medium transition-all duration-150 cursor-pointer
        ${active
          ? "bg-glace-yellow border-glace-yellow text-[#1e6a7f] font-bold shadow-[0_4px_16px_rgba(244,228,81,0.4)]"
          : "bg-white/10 border-white/25 text-white hover:bg-white/20 hover:border-white/50"
        }`}
    >
      <span>{label}</span>
      {sublabel && <span className={`text-[11px] ${active ? "text-[#1e6a7f]/70" : "text-white/50"}`}>{sublabel}</span>}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function BradOrderClientPage({ withIceCream = false }: { withIceCream?: boolean }) {
  const addItem = useCartStore((s) => s.addItem);

  const [bradSize,        setBradSize]        = useState<BradSize | "">("");
  const [bradFlavor,      setBradFlavor]      = useState<BradFlavor | "">("");
  const [iceType,         setIceType]         = useState<IceType | "">("");
  const [selectedFlavors, setSelectedFlavors] = useState<number[]>([]);
  const [quantity,        setQuantity]        = useState(1);
  const [addedToCart,     setAddedToCart]     = useState(false);
  const [validationMsg,   setValidationMsg]   = useState("");

  function changeBradSize(s: BradSize) {
    setBradSize(s);
  }
  function changeBradFlavor(f: BradFlavor) {
    setBradFlavor(f);
  }
  function changeIceType(t: IceType) {
    setIceType(t); setSelectedFlavors([]);
  }

  const sizeData   = BRAD_SIZES.find((s) => s.value === bradSize);
  const bradPrice  = sizeData?.price ?? 0;
  const icePrice   = iceType ? ICE_ADDON[iceType] : 0;
  const unitPrice  = bradPrice + icePrice;
  const total      = unitPrice * quantity;

  const allFlavors = [...CLASSIC_FLAVORS, ...SPECIAL_FLAVORS];
  const iceFlavors = iceType === "classic" ? CLASSIC_FLAVORS
    : iceType === "special" ? SPECIAL_FLAVORS
    : allFlavors;

  function toggleFlavor(id: number) {
    setSelectedFlavors((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  }

  const s1Done = !!bradSize;
  const s2Done = !!bradFlavor;
  const s3Done = !withIceCream || !!iceType;
  const s4Done = !withIceCream || selectedFlavors.length > 0;
  const canAdd = s1Done && s2Done && s3Done && s4Done;

  function showValidation(msg: string) {
    setValidationMsg(msg);
    setTimeout(() => setValidationMsg(""), 3000);
  }

  function handleAddToCart() {
    if (!bradSize)                               return showValidation("اختر حجم البراد أولاً");
    if (!bradFlavor)                             return showValidation("اختر طعم البراد أولاً");
    if (withIceCream && !iceType)                return showValidation("اختر نوع الأيس كريم أولاً");
    if (withIceCream && selectedFlavors.length === 0) return showValidation("اختر أطعمة الأيس كريم أولاً");

    const flavorNames = selectedFlavors
      .map((id) => allFlavors.find((f) => f.id === id)?.name ?? "")
      .filter(Boolean);

    const sizeLabel   = BRAD_SIZES.find((s) => s.value === bradSize)?.label;
    const flavorLabel = BRAD_FLAVORS.find((f) => f.value === bradFlavor)?.label;
    const iceLabel    = ICE_TYPES.find((t) => t.value === iceType)?.label;

    addItem({
      productId:  withIceCream ? "brad-boza" : "brad",
      name:       withIceCream ? "براد مع بوظة" : "براد",
      size:       sizeLabel   || undefined,
      type:       iceLabel    || undefined,
      flavors:    [flavorLabel, ...flavorNames].filter(Boolean) as string[],
      addons:     [],
      addonTotal: 0,
      unitPrice,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    setBradSize(""); setBradFlavor(""); setIceType(""); setSelectedFlavors([]); setQuantity(1);
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-36 max-w-3xl">

        {/* Page header + price table */}
        <div className="bg-white/17 backdrop-blur-[15px] rounded-[28px] overflow-hidden mb-6">
          <div className="flex md:flex-row flex-col w-full p-5 gap-5">

            {/* Image + title */}
            <div className="flex items-center gap-4 md:w-1/2">
              <div className="flex items-end gap-2 shrink-0">
                <Image src={refrigerator} alt="براد" width={80} height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl" />
                {withIceCream && (
                  <Image src={iceCream} alt="بوظة" width={60} height={60}
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-lg" />
                )}
              </div>
              <div>
                <h1 className="text-white font-bold text-[28px] sm:text-[36px] leading-tight">
                  {withIceCream ? "براد مع بوظة" : "البراد"}
                </h1>
                <p className="text-white/55 text-[14px]">خصّص طلبك خطوة بخطوة</p>
              </div>
            </div>

            {/* Price table */}
            <div className="md:w-1/2">
              <div className="bg-[#2d849e94] backdrop-blur-[20px] rounded-[20px] p-4">
                <h3 className="mb-3 text-white text-[16px] font-bold">أسعار البراد</h3>
                <table className="w-full text-white">
                  <tbody>
                    {BRAD_SIZES.map(({ value, label, price }) => (
                      <tr key={value} className="last:border-0 border-b border-white/15">
                        <td className="px-2 py-2 text-[16px] text-start font-medium">{label}</td>
                        <td className="px-2 py-2 text-[16px] text-center">{price} ₪</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        <div className="flex flex-col gap-4">

          {/* Step 1 — الحجم */}
          <StepCard step={1} title="اختر الحجم" active done={s1Done}>
            <div className="flex flex-wrap gap-3">
              {BRAD_SIZES.map(({ value, label, price }) => (
                <Pill
                  key={value}
                  label={label}
                  sublabel={`${price} ₪`}
                  active={bradSize === value}
                  onClick={() => changeBradSize(value)}
                />
              ))}
            </div>
          </StepCard>

          {/* Step 2 — أطعمة البراد */}
          <StepCard step={2} title="اختر طعم البراد" active={s1Done} done={s2Done}>
            <div className="flex flex-wrap gap-3">
              {BRAD_FLAVORS.map(({ value, label }) => (
                <Pill
                  key={value}
                  label={label}
                  active={bradFlavor === value}
                  onClick={() => changeBradFlavor(value)}
                />
              ))}
            </div>
          </StepCard>

          {/* Step 3 — نوع الأيس كريم (براد مع بوظة only) */}
          {withIceCream && (
            <StepCard step={3} title="اختر نوع الأيس كريم" active={s2Done} done={s3Done}>
              <div className="flex flex-wrap gap-3">
                {ICE_TYPES.map(({ value, label, price }) => (
                  <Pill
                    key={value}
                    label={label}
                    sublabel={`+${price} ₪`}
                    active={iceType === value}
                    onClick={() => changeIceType(value)}
                  />
                ))}
              </div>
            </StepCard>
          )}

          {/* Step 4 — أطعمة الأيس كريم (براد مع بوظة only) */}
          {withIceCream && iceType !== "" && (
            <StepCard step={4} title="اختر أطعمة الأيس كريم" active done={s4Done}>
              <div className="flex flex-wrap gap-2 mb-4 -mt-2">
                <span className="inline-flex items-center gap-1.5 bg-white/8 rounded-full px-3 py-1 text-[11px] text-white/50">
                  <span className="text-green-400 font-bold">+</span> اضغط على الطعم لإضافته أو تكراره
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/8 rounded-full px-3 py-1 text-[11px] text-white/50">
                  <span className="text-red-400 font-bold">✕</span> اضغط على الكرة لإزالتها
                </span>
              </div>
              {iceType === "mix" ? (
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-white/60 text-[13px] font-semibold mb-3 pb-1.5 border-b border-white/15">كلاسيك</p>
                    <div className="flex flex-wrap gap-4">
                      {CLASSIC_FLAVORS.map((f) => (
                        <FlavorBall
                          key={f.id}
                          flavor={f}
                          count={selectedFlavors.includes(f.id) ? 1 : 0}
                          isFull={false}
                          onAdd={() => toggleFlavor(f.id)}
                          onRemove={(e) => { e.stopPropagation(); toggleFlavor(f.id); }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-[13px] font-semibold mb-3 pb-1.5 border-b border-white/15">سبيشل</p>
                    <div className="flex flex-wrap gap-4">
                      {SPECIAL_FLAVORS.map((f) => (
                        <FlavorBall
                          key={f.id}
                          flavor={f}
                          count={selectedFlavors.includes(f.id) ? 1 : 0}
                          isFull={false}
                          onAdd={() => toggleFlavor(f.id)}
                          onRemove={(e) => { e.stopPropagation(); toggleFlavor(f.id); }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {iceFlavors.map((f) => (
                    <FlavorBall
                      key={f.id}
                      flavor={f}
                      count={selectedFlavors.includes(f.id) ? 1 : 0}
                      isFull={false}
                      onAdd={() => toggleFlavor(f.id)}
                      onRemove={(e) => { e.stopPropagation(); toggleFlavor(f.id); }}
                    />
                  ))}
                </div>
              )}
              {selectedFlavors.length > 0 && (
                <p className="text-white/50 text-[12px] mt-3">{selectedFlavors.length} طعم مختار</p>
              )}
            </StepCard>
          )}

        </div>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div className="fixed bottom-[92px] lg:bottom-0 inset-x-0 z-9999997 px-4 pb-4 pt-6 bg-linear-to-t from-[#1a6278]/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-3xl bg-white/18 backdrop-blur-[20px] border border-white/20 rounded-[24px] px-5 py-4 flex flex-wrap items-center gap-4">
          {/* Qty */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 border border-white/25 text-white cursor-pointer">
              <Minus size={14} />
            </button>
            <span className="text-white font-bold text-[20px] min-w-7 text-center">{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => q + 1)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 border border-white/25 text-white cursor-pointer">
              <Plus size={14} />
            </button>
          </div>

          {/* Price */}
          <div className="flex-1">
            <p className="text-white/55 text-[12px]">الإجمالي</p>
            <p className="text-glace-yellow font-bold text-[22px] leading-none">{total.toFixed(2)} ₪</p>
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
