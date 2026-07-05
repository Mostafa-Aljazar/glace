"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import BackButton from "@/components/Order/BackButton";
import OrderLeaveConfirmationDialog from "@/components/Order/OrderLeaveConfirmationDialog";
import { useLeavePageGuard } from "@/hooks/order";
import { luqaimat, pancake, waffle, crepe, glassyPizza } from "@/assets/images";
import { ADDONS } from "@/data/OrderData";
import { useCartStore } from "@/store/cartStore";

const DESSERT_CATEGORIES = [
  {
    id: "luqaimat",
    label: "لقيمات",
    image: luqaimat,
    items: [
      { label: "نوتيلا", price: 10 },
      { label: "لوتس", price: 12 },
      { label: "بستاشيو", price: 15 },
      { label: "مكس (نوتيلا+لوتس)", price: 12 },
      { label: "سوبر مكس (نوتيلا+لوتس+بيستاشيو)", price: 15 },
    ],
  },
  {
    id: "pancake",
    label: "بان كيك",
    image: pancake,
    items: [
      { label: "نوتيلا", price: 11 },
      { label: "لوتس", price: 13 },
      { label: "مكس (نوتيلا+لوتس)", price: 15 },
      { label: "بيستاشيو", price: 17 },
    ],
  },
  {
    id: "waffle",
    label: "وافل",
    image: waffle,
    items: [
      { label: "نوتيلا", price: 10 },
      { label: "لوتس", price: 12 },
      { label: "بيستاشيو", price: 14 },
      { label: "مكس", price: 13 },
    ],
  },
  {
    id: "crepe",
    label: "كريب",
    image: crepe,
    items: [
      { label: "نوتيلا", price: 9 },
      { label: "لوتس", price: 11 },
      { label: "بيستاشيو", price: 13 },
      { label: "مكس", price: 12 },
    ],
  },
  {
    id: "pizza",
    label: "بيتزا جلاسيه",
    image: glassyPizza,
    items: [
      { label: "نوتيلا", price: 12 },
      { label: "لوتس", price: 14 },
      { label: "بيستاشيو", price: 16 },
      { label: "مكس (نوتيلا+لوتس)", price: 15 },
    ],
  },
];

export default function DessertsOrderClientPage({
  initialType = "luqaimat",
}: {
  initialType?: string;
}) {
  const defaultCategory =
    DESSERT_CATEGORIES.find((c) => c.id === initialType) ??
    DESSERT_CATEGORIES[0];
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [selectedFlavor, setSelectedFlavor] = useState(
    defaultCategory.items[0].label,
  );
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);

  const hasPendingSelections =
    activeCategory.id !== defaultCategory.id ||
    selectedFlavor !== defaultCategory.items[0].label ||
    selectedAddons.length > 0 ||
    quantity !== 1;

  const clearSelections = useCallback(() => {
    setActiveCategory(defaultCategory);
    setSelectedFlavor(defaultCategory.items[0].label);
    setSelectedAddons([]);
    setQuantity(1);
  }, [defaultCategory]);

  const {
    showCloseConfirm,
    handleCancelLeave,
    handleConfirmLeave,
    handleBeforeBack,
  } = useLeavePageGuard(hasPendingSelections, clearSelections);

  const addItem = useCartStore((s) => s.addItem);

  const flavorData =
    activeCategory.items.find((i) => i.label === selectedFlavor) ??
    activeCategory.items[0];
  const addonTotal = selectedAddons.reduce(
    (sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0),
    0,
  );

  function handleCategoryChange(cat: (typeof DESSERT_CATEGORIES)[0]) {
    setActiveCategory(cat);
    setSelectedFlavor(cat.items[0].label);
    setSelectedAddons([]);
    setQuantity(1);
  }

  function toggleAddon(id: number) {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  function handleAddToCart() {
    const addonNames = selectedAddons
      .map((id) => ADDONS.find((a) => a.id === id)?.name ?? "")
      .filter(Boolean);
    addItem({
      productId: activeCategory.id,
      name: `${activeCategory.label} ${selectedFlavor}`,
      type: selectedFlavor,
      addons: addonNames,
      addonTotal,
      unitPrice: flavorData.price,
      quantity,
    });
    setSelectedAddons([]);
    setQuantity(1);
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />
      <BackButton onBeforeBack={handleBeforeBack} />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-[100px] max-w-350">
        {/* Product card */}
        <div className="bg-white/[.17] backdrop-blur-[15px] mb-3 rounded-[30px] w-full overflow-hidden">
          <div className="flex md:flex-row flex-col p-5 w-full">
            <div className="w-full md:w-1/2 text-white text-center">
              <h1 className="text-[40px] sm:text-[45px]">الحلويات</h1>
              <Image
                src={activeCategory.image}
                alt={activeCategory.label}
                width={220}
                height={220}
                className="mx-auto mt-3 max-h-[220px] object-contain"
              />
            </div>
            <div className="w-full md:w-1/2">
              <div className="bg-[#2d849e94] backdrop-blur-[20px] p-[15px_20px] rounded-[20px]">
                <h3 className="mb-2 text-[18px] text-white">
                  {activeCategory.label}
                </h3>
                <table className="w-full text-white">
                  <tbody>
                    {activeCategory.items.map((i) => (
                      <tr
                        key={i.label}
                        className="border-white/20 last:border-0 border-b"
                      >
                        <td className="px-[5px] py-[7px] text-[18px] text-start">
                          {i.label}
                        </td>
                        <td className="px-[5px] py-[7px] text-[18px] text-center">
                          {i.price} ₪
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Order builder */}
        <div className="bg-white/[.17] backdrop-blur-[15px] mt-3 rounded-[30px] w-full overflow-hidden">
          <div className="flex flex-col p-5">
            <h1 className="mb-5 text-[40px] text-white text-center">
              إنشاء الطلب
            </h1>

            <div className="bg-[#2d849e94] backdrop-blur-[20px] mb-5 p-5 rounded-[20px] text-white">
              {/* Category */}
              <div className="mb-5">
                <h3 className="mb-3 text-[20px]">اختر نوع الحلوى :</h3>
                <div className="flex flex-wrap gap-3">
                  {DESSERT_CATEGORIES.map((cat) => (
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

              {/* Flavor */}
              <div className="mb-5">
                <h3 className="mb-3 text-[20px]">اختر الطعم :</h3>
                <div className="flex flex-wrap gap-3">
                  {activeCategory.items.map((i) => (
                    <button
                      key={i.label}
                      type="button"
                      onClick={() => setSelectedFlavor(i.label)}
                      className={`px-4 py-2 rounded-xl border text-[15px] cursor-pointer transition-colors ${
                        selectedFlavor === i.label
                          ? "bg-white text-[#2d849e] border-white font-bold"
                          : "bg-transparent border-white/50 text-white hover:border-white"
                      }`}
                    >
                      {i.label}
                      <span className="mr-1 text-[13px]">({i.price} ₪)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Addons */}
              <div className="mb-5">
                <h3 className="mb-3 text-[20px]">الإضافات (اختياري) :</h3>
                <div className="flex flex-wrap gap-3">
                  {ADDONS.map((addon) => (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`px-4 py-2 rounded-xl border text-[15px] cursor-pointer transition-colors ${
                        selectedAddons.includes(addon.id)
                          ? "bg-white text-[#2d849e] border-white font-bold"
                          : "bg-transparent border-white/50 text-white hover:border-white"
                      }`}
                    >
                      {addon.name}
                      <span className="mr-1 text-[13px]">
                        (+{addon.price} ₪)
                      </span>
                    </button>
                  ))}
                </div>
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
                  <span className="min-w-[30px] text-[24px] text-center">
                    {quantity}
                  </span>
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
                الإجمالي :{" "}
                <span className="font-bold text-[30px]">
                  {((flavorData.price + addonTotal) * quantity).toFixed(2)}
                </span>{" "}
                شيكل
              </h3>
              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-[#117291] hover:bg-[#0e6080] px-8 py-3 border-0 rounded-[30px] text-[22px] text-white transition-colors cursor-pointer"
              >
                أضف للسلة
              </button>
            </div>
          </div>
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
