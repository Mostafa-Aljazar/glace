"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import AddToCartButton from "@/components/Order/AddToCartButton";
import FlavorBall from "@/components/Order/FlavorBall";
import { dondurmaBasklava } from "@/assets/images";
import { CLASSIC_FLAVORS, SPECIAL_FLAVORS } from "@/data/OrderData";
import { useCartStore } from "@/store/cartStore";

type SubType = "كلاسيك" | "سبيشل" | "مكس";

const SUB_CATEGORIES = [
  {
    id: "shabak",
    label: "مشتركات شبك",
    sizes: [
      { label: "صغير", classic: 15, special: 20, mix: 18 },
      { label: "وسط",  classic: 25, special: 32, mix: 28 },
      { label: "كبير", classic: 35, special: 45, mix: 40 },
    ],
  },
  {
    id: "other",
    label: "مشتركات أخرى",
    sizes: [
      { label: "خاص صغير", classic: 20, special: 28, mix: 24 },
      { label: "خاص كبير", classic: 40, special: 55, mix: 48 },
    ],
  },
];

function getSizePrice(row: { classic: number; special: number; mix: number }, type: SubType): number {
  if (type === "سبيشل") return row.special;
  if (type === "مكس") return row.mix;
  return row.classic;
}

export default function SubscriptionsOrderClientPage() {
  const [activeCategory, setActiveCategory] = useState(SUB_CATEGORIES[0]);
  const [selectedSize, setSelectedSize] = useState(activeCategory.sizes[0].label);
  const [type, setType] = useState<SubType>("كلاسيك");
  const [selectedFlavors, setSelectedFlavors] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart,   setAddedToCart]   = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  const addItem = useCartStore((s) => s.addItem);

  const sizeRow = activeCategory.sizes.find((s) => s.label === selectedSize) ?? activeCategory.sizes[0];
  const unitPrice = getSizePrice(sizeRow, type);

  const flavors = type === "كلاسيك" ? CLASSIC_FLAVORS
    : type === "سبيشل" ? SPECIAL_FLAVORS
    : [...CLASSIC_FLAVORS, ...SPECIAL_FLAVORS];

  function handleCategoryChange(cat: typeof SUB_CATEGORIES[0]) {
    setActiveCategory(cat);
    setSelectedSize(cat.sizes[0].label);
    setSelectedFlavors([]);
    setQuantity(1);
  }

  function toggleFlavor(id: number) {
    setSelectedFlavors((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  function showValidation(msg: string) {
    setValidationMsg(msg);
    setTimeout(() => setValidationMsg(""), 3000);
  }

  function handleAddToCart() {
    if (selectedFlavors.length === 0) return showValidation("اختر طعماً واحداً على الأقل");

    const allFlavors = [...CLASSIC_FLAVORS, ...SPECIAL_FLAVORS];
    const flavorNames = selectedFlavors
      .map((id) => allFlavors.find((f) => f.id === id)?.name ?? "")
      .filter(Boolean);

    addItem({
      productId: "subscriptions",
      name: `${activeCategory.label} — ${selectedSize}`,
      size: selectedSize,
      type,
      flavors: flavorNames,
      addons: [],
      addonTotal: 0,
      unitPrice,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    setSelectedFlavors([]);
    setQuantity(1);
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-[100px] max-w-350">

        {/* Product card */}
        <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] w-full mb-3 overflow-hidden">
          <div className="flex md:flex-row flex-col w-full p-5">
            <div className="w-full md:w-1/2 text-white text-center">
              <h1 className="text-[40px] sm:text-[45px]">المشتركات</h1>
              <Image
                src={dondurmaBasklava}
                alt="مشتركات"
                width={220}
                height={220}
                className="mx-auto max-h-[220px] object-contain mt-3"
              />
            </div>
            <div className="w-full md:w-1/2">
              <div className="bg-[#2d849e94] backdrop-blur-[20px] rounded-[20px] p-[15px_20px] max-h-[320px] overflow-y-auto">
                {SUB_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="mb-4 last:mb-0">
                    <h3 className="mb-2 text-white text-[17px] font-bold border-b border-white/20 pb-1">
                      {cat.label}
                    </h3>
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-white/10">
                          <td className="px-[5px] py-[4px] text-[14px] text-start">الحجم</td>
                          <td className="px-[5px] py-[4px] text-[14px] text-center">كلاسيك</td>
                          <td className="px-[5px] py-[4px] text-[14px] text-center">سبيشل</td>
                          <td className="px-[5px] py-[4px] text-[14px] text-center">مكس</td>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.sizes.map((row) => (
                          <tr key={row.label} className="last:border-0 border-b border-white/10">
                            <td className="px-[5px] py-[6px] text-[17px] text-start">{row.label}</td>
                            <td className="px-[5px] py-[6px] text-[17px] text-center">{row.classic} ₪</td>
                            <td className="px-[5px] py-[6px] text-[17px] text-center">{row.special} ₪</td>
                            <td className="px-[5px] py-[6px] text-[17px] text-center">{row.mix} ₪</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order builder */}
        <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] w-full overflow-hidden mt-3">
          <div className="flex flex-col p-5">
            <h1 className="mb-5 text-white text-[40px] sm:text-[45px] text-center">إنشاء الطلب</h1>

            <div className="bg-[#2d849e94] backdrop-blur-[20px] rounded-[20px] p-5 mb-5 text-white">

              {/* Sub category */}
              <div className="mb-5">
                <h3 className="mb-3 text-[20px]">اختر نوع المشترك :</h3>
                <div className="flex flex-wrap gap-3">
                  {SUB_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-4 py-2 rounded-xl border text-[16px] cursor-pointer transition-colors ${
                        activeCategory.id === cat.id
                          ? "bg-white text-[#2d849e] border-white font-bold"
                          : "bg-transparent border-white/50 text-white hover:border-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-5">
                <h3 className="mb-3 text-[20px]">اختر الحجم :</h3>
                <div className="flex flex-wrap gap-3">
                  {activeCategory.sizes.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSelectedSize(s.label)}
                      className={`px-4 py-2 rounded-xl border text-[16px] cursor-pointer transition-colors ${
                        selectedSize === s.label
                          ? "bg-white text-[#2d849e] border-white font-bold"
                          : "bg-transparent border-white/50 text-white hover:border-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice cream type */}
              <div className="mb-5">
                <h3 className="mb-3 text-[20px]">اختر نوع الأطعمة :</h3>
                <div className="flex flex-wrap gap-3">
                  {(["كلاسيك", "سبيشل", "مكس"] as SubType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setType(t); setSelectedFlavors([]); }}
                      className={`px-4 py-2 rounded-xl border text-[16px] cursor-pointer transition-colors ${
                        type === t
                          ? "bg-white text-[#2d849e] border-white font-bold"
                          : "bg-transparent border-white/50 text-white hover:border-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flavors */}
              <div className="mb-5">
                <h3 className="mb-3 text-[20px]">اختر الأطعمة :</h3>
                <div className="flex flex-wrap gap-2 mb-3 -mt-1">
                  <span className="inline-flex items-center gap-1.5 bg-white/8 rounded-full px-3 py-1 text-[11px] text-white/50">
                    <span className="text-green-400 font-bold">+</span> اضغط على الطعم لإضافته أو تكراره
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/8 rounded-full px-3 py-1 text-[11px] text-white/50">
                    <span className="text-red-400 font-bold">✕</span> اضغط على الكرة لإزالتها
                  </span>
                </div>
                {type === "مكس" ? (
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
                    {flavors.map((f) => (
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
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <h3 className="text-[20px]">الكمية :</h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex justify-center items-center bg-transparent border border-white rounded-full w-[30px] h-[30px] text-white cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-[30px] text-[24px] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex justify-center items-center bg-transparent border border-white rounded-full w-[30px] h-[30px] text-white cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 px-4 text-white">
              <h3 className="text-[20px]">
                الإجمالي : <span className="font-bold text-[30px]">{(unitPrice * quantity).toFixed(2)}</span> شيكل
              </h3>
              <AddToCartButton
                onClick={handleAddToCart}
                canAdd={selectedFlavors.length > 0}
                addedToCart={addedToCart}
                validationMsg={validationMsg}
              />
            </div>
          </div>
        </div>
      </div>

      <CartBar />
    </div>
  );
}
