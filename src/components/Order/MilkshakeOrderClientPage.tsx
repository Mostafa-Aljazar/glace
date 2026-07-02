"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import AddToCartButton from "@/components/Order/AddToCartButton";
import BackButton from "@/components/Order/BackButton";
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
import type { StaticIMG } from "@/assets/images";

interface MilkshakeItem {
  id: string;
  label: string;
  price: number;
  image: StaticIMG;
}

const MILKSHAKE_ITEMS: MilkshakeItem[] = [
  {
    id: "classic-chocolate",
    label: "كلاسيك شوكولاته",
    price: 8,
    image: chocolateIce,
  },
  {
    id: "classic-vanilla",
    label: "كلاسيك فانيلا",
    price: 8,
    image: vanillaaIce,
  },
  {
    id: "classic-strawberry",
    label: "كلاسيك فراولة",
    price: 8,
    image: strawberryIce,
  },
  {
    id: "classic-caramel",
    label: "كلاسيك كاراميل",
    price: 8,
    image: caramelIce,
  },
  {
    id: "classic-nescafe",
    label: "كلاسيك نسكافيه",
    price: 8,
    image: nescafeIce,
  },
  {
    id: "classic-barouka",
    label: "كلاسيك باروكا",
    price: 8,
    image: caramelIce,
  },
  {
    id: "special-nutella",
    label: "سبيشال نوتيلا",
    price: 10,
    image: nutellaIce,
  },
  { id: "special-lotus", label: "سبيشال لوتس", price: 10, image: lotusIce },
  {
    id: "special-kinder",
    label: "سبيشال كندر",
    price: 10,
    image: kinderBuenoIce,
  },
  { id: "special-oreo", label: "سبيشال أوريو", price: 10, image: oreoIce },
  { id: "special-kitkat", label: "سبيشال كت كات", price: 10, image: kitKatIce },
  {
    id: "special-fitness",
    label: "سبيشال فيتنس",
    price: 10,
    image: nescafeIce,
  },
  {
    id: "special-shoufan",
    label: "سبيشال شوفان",
    price: 10,
    image: nutellaIce,
  },
  { id: "serlac", label: "سيرلاك (أطعم خاصة)", price: 8, image: marioIce },
  { id: "einstein", label: "اينشتاين (أطعم خاصة)", price: 9, image: marioIce },
  {
    id: "pistachio",
    label: "بيستاشيو (أطعم خاصة)",
    price: 13,
    image: pistachioIce,
  },
];

const PRICE_TABLE = [
  {
    label: "أطعم كلاسيك",
    price: "8 ₪",
    image: chocolateIce,
    flavors: ["شوكولاته", "فانيلا", "فراولة", "كاراميل"],
  },
  {
    label: "أطعم سبيشل",
    price: "10 ₪",
    image: nutellaIce,
    flavors: ["نوتيلا", "لوتس", "كندر", "أوريو"],
  },
  {
    label: "طعم السيرلاك",
    price: "8 ₪",
    image: marioIce,
    flavors: ["سيرلاك"],
  },
  {
    label: "طعم البيستاشيو",
    price: "13 ₪",
    image: pistachioIce,
    flavors: ["بيستاشيو"],
  },
];

export default function MilkshakeOrderClientPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  const addItem = useCartStore((s) => s.addItem);

  const totalItems = Object.values(counts).reduce((s, c) => s + c, 0);
  const totalPrice = MILKSHAKE_ITEMS.reduce(
    (s, item) => s + (counts[item.id] ?? 0) * item.price,
    0,
  );

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
    MILKSHAKE_ITEMS.forEach((item) => {
      const qty = counts[item.id] ?? 0;
      if (qty > 0) {
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
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    setCounts({});
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-36 max-w-3xl">
        {/* ── Hero card ── */}
        <div className="bg-white/17 backdrop-blur-[15px] mb-6 rounded-[28px] overflow-hidden">
          <div className="flex md:flex-row flex-col gap-5 p-5 w-full">
            {/* Left: title + image below */}
            <div className="flex flex-col items-center gap-4 md:w-1/2">
              <div className="text-center">
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

            {/* Right: price table */}
            <div className="md:w-1/2">
              <div className="bg-[#2d849e94] backdrop-blur-[20px] p-4 rounded-[20px]">
                <h3 className="mb-3 font-bold text-[16px] text-white">
                  أسعار الميلك شيك
                </h3>
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-white/20 border-b text-[13px] text-white/60">
                      <th className="px-2 py-1.5 font-medium text-start">
                        النوع
                      </th>
                      <th className="px-2 py-1.5 font-medium text-center">
                        السعر
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRICE_TABLE.map((row) => (
                      <tr
                        key={row.label}
                        className="border-white/15 last:border-0 border-b"
                      >
                        <td className="px-2 py-2 text-start align-top">
                          <div className="flex items-center gap-2">
                            <Image
                              src={row.image}
                              alt={row.label}
                              width={24}
                              height={24}
                              className="w-6 h-6 object-contain shrink-0"
                            />
                            <div>
                              <p className="text-[14px] text-white">
                                {row.label}
                              </p>
                              {row.flavors.length > 1 && (
                                <p className="mt-0.5 text-[11px] text-white/55">
                                  {row.flavors.join(" · ")}
                                  {row.flavors.length >= 4 && (
                                    <span className="text-white/35">
                                      {" "}
                                      · ...
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 font-bold text-[14px] text-glace-yellow text-center align-top">
                          {row.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── Items list ── */}
        <div className="bg-white/17 backdrop-blur-[15px] mb-4 rounded-[28px] overflow-hidden">
          <div className="p-5">
            <h2 className="mb-4 font-bold text-[18px] text-white">
              اختر أطعمة الميلك شيك
            </h2>
            <div className="flex flex-col gap-2">
              {MILKSHAKE_ITEMS.map((item) => {
                const count = counts[item.id] ?? 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 border rounded-[16px] px-4 py-3 transition-all
                      ${count > 0 ? "bg-glace-yellow/10 border-glace-yellow/50" : "bg-white/8 border-white/10 hover:bg-white/12"}`}
                  >
                    {/* Image */}
                    <Image
                      src={item.image}
                      alt={item.label}
                      width={44}
                      height={44}
                      className="w-11 h-11 object-contain shrink-0"
                    />

                    {/* Label + price */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[14px] text-white sm:text-[15px] truncate">
                        {item.label}
                      </p>
                      <p className="text-[12px] text-white/50">
                        {item.price} ₪
                      </p>
                    </div>

                    {/* Add button or counter */}
                    {count === 0 ? (
                      <button
                        type="button"
                        onClick={() => increment(item.id)}
                        className="flex items-center gap-1.5 bg-white/15 hover:bg-glace-yellow px-4 py-1.5 border border-white/25 hover:border-glace-yellow rounded-full font-bold text-[13px] text-white hover:text-[#1e6a7f] transition-all cursor-pointer shrink-0"
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

      {/* ── Sticky bottom bar — same pattern as other order pages ── */}
      <div className="bottom-[92px] lg:bottom-0 z-9999997 fixed inset-x-0 bg-linear-to-t from-[#1a6278]/95 to-transparent px-4 pt-6 pb-4 pointer-events-none">
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

      <CartBar />
    </div>
  );
}
