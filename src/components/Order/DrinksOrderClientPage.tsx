"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import BackButton from "@/components/Order/BackButton";
import OrderLeaveConfirmationDialog from "@/components/Order/OrderLeaveConfirmationDialog";
import { useLeavePageGuard } from "@/hooks/order";
import { naturalJuices, coldDrinks } from "@/assets/images";
import { useCartStore } from "@/store/cartStore";

const DRINK_CATEGORIES = [
  {
    id: "juices",
    label: "عصائر طبيعية",
    image: naturalJuices,
    items: [
      { label: "فراولة", price: 5 },
      { label: "بلوليمونادا", price: 6 },
      { label: "مانجا", price: 7 },
    ],
  },
  {
    id: "cold",
    label: "مشروبات باردة",
    image: coldDrinks,
    items: [
      { label: "آيس كوفي كراميل", price: 8 },
      { label: "آيس موكا", price: 8 },
      { label: "سبانش لاتيه كراميل", price: 10 },
      { label: "بوبا شيك كوفي/فراولة", price: 12 },
      { label: "مياه صغيرة", price: 1 },
    ],
  },
];

export default function DrinksOrderClientPage({
  initialType = "juices",
}: {
  initialType?: string;
}) {
  const defaultCategory =
    DRINK_CATEGORIES.find((c) => c.id === initialType) ?? DRINK_CATEGORIES[0];
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [selectedItem, setSelectedItem] = useState(
    defaultCategory.items[0].label,
  );
  const [quantity, setQuantity] = useState(1);

  const hasPendingSelections =
    activeCategory.id !== defaultCategory.id ||
    selectedItem !== defaultCategory.items[0].label ||
    quantity !== 1;

  const clearSelections = useCallback(() => {
    setActiveCategory(defaultCategory);
    setSelectedItem(defaultCategory.items[0].label);
    setQuantity(1);
  }, [defaultCategory]);

  const {
    showCloseConfirm,
    handleCancelLeave,
    handleConfirmLeave,
    handleBeforeBack,
  } = useLeavePageGuard(hasPendingSelections, clearSelections);

  const addItem = useCartStore((s) => s.addItem);

  const itemData =
    activeCategory.items.find((i) => i.label === selectedItem) ??
    activeCategory.items[0];

  function handleCategoryChange(cat: (typeof DRINK_CATEGORIES)[0]) {
    setActiveCategory(cat);
    setSelectedItem(cat.items[0].label);
    setQuantity(1);
  }

  function handleAddToCart() {
    addItem({
      productId: activeCategory.id,
      name: `${activeCategory.label} — ${selectedItem}`,
      image: activeCategory.image.src,
      type: selectedItem,
      addons: [],
      addonTotal: 0,
      unitPrice: itemData.price,
      quantity,
    });
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
              <h1 className="text-[40px] sm:text-[45px]">المشروبات</h1>
              <Image
                src={activeCategory.image}
                alt={activeCategory.label}
                width={220}
                height={220}
                className="mx-auto mt-3 max-h-[220px] object-contain"
              />
            </div>
            <div className="w-full md:w-1/2">
              <div className="bg-[#2d849e94] backdrop-blur-[20px] p-[15px_20px] rounded-[20px] max-h-[300px] overflow-y-auto">
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
              {/* Category tabs */}
              <div className="mb-5">
                <h3 className="mb-3 text-[20px]">اختر نوع المشروب :</h3>
                <div className="flex flex-wrap gap-3">
                  {DRINK_CATEGORIES.map((cat) => (
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

              {/* Item selection */}
              <div className="mb-5">
                <h3 className="mb-3 text-[20px]">اختر الصنف :</h3>
                <div className="flex flex-wrap gap-3">
                  {activeCategory.items.map((i) => (
                    <button
                      key={i.label}
                      type="button"
                      onClick={() => setSelectedItem(i.label)}
                      className={`px-4 py-2 rounded-xl border text-[15px] cursor-pointer transition-colors ${
                        selectedItem === i.label
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
                  {(itemData.price * quantity).toFixed(2)}
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
