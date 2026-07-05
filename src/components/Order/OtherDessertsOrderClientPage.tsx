"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import BackButton from "@/components/Order/BackButton";
import OrderLeaveConfirmationDialog from "@/components/Order/OrderLeaveConfirmationDialog";
import { useLeavePageGuard } from "@/hooks/order";
import {
  iceCreamKunafa,
  moltenCake,
  browniesCake,
  mochi,
  sanSebastian,
} from "@/assets/images";
import { useCartStore } from "@/store/cartStore";

const OTHER_DESSERTS = [
  {
    id: "kunafa",
    label: "كنافة آيس كريم",
    image: iceCreamKunafa,
    items: [
      { label: "كنافة عربية", price: 8 },
      { label: "كنافة لوتس", price: 8 },
      { label: "كنافة نوتيلا", price: 8 },
      { label: "كنافة بلوبيري", price: 8 },
      { label: "كنافة دوندورما بيستاشيو", price: 12 },
      { label: "كنافة طاقة (كل خميس)", price: 12 },
    ],
  },
  {
    id: "molten",
    label: "مولتن كيك",
    image: moltenCake,
    items: [
      { label: "نوتيلا", price: 8 },
      { label: "لوتس", price: 12 },
      { label: "بستاشيو", price: 12 },
    ],
  },
  {
    id: "brownie",
    label: "براونيز",
    image: browniesCake,
    items: [
      { label: "براونيز عادي", price: 8 },
      { label: "براونيز نوتيلا", price: 10 },
      { label: "براونيز لوتس", price: 10 },
    ],
  },
  {
    id: "cookies",
    label: "كوكيز",
    image: mochi,
    items: [
      { label: "كوكيز نوتيلا", price: 8 },
      { label: "كوكيز لوتس", price: 10 },
      { label: "كوكيز بيستاشيو", price: 12 },
      { label: "كوكيز مكس", price: 10 },
    ],
  },
  {
    id: "cheesecake",
    label: "تشيز كيك",
    image: sanSebastian,
    items: [
      { label: "تشيز كيك فراولة", price: 12 },
      { label: "تشيز كيك لوتس", price: 14 },
      { label: "تشيز كيك بيستاشيو", price: 16 },
      { label: "تشيز كيك مكس", price: 14 },
    ],
  },
];

export default function OtherDessertsOrderClientPage({
  initialType = "kunafa",
}: {
  initialType?: string;
}) {
  const [activeCategory, setActiveCategory] = useState(
    OTHER_DESSERTS.find((c) => c.id === initialType) ?? OTHER_DESSERTS[0],
  );
  const [selectedItem, setSelectedItem] = useState(
    activeCategory.items[0].label,
  );
  const [quantity, setQuantity] = useState(1);

  const hasPendingSelections =
    activeCategory.id !==
      (OTHER_DESSERTS.find((c) => c.id === initialType) ?? OTHER_DESSERTS[0])
        .id ||
    selectedItem !== activeCategory.items[0].label ||
    quantity !== 1;

  const clearSelections = useCallback(() => {
    const defaultCategory =
      OTHER_DESSERTS.find((c) => c.id === initialType) ?? OTHER_DESSERTS[0];
    setActiveCategory(defaultCategory);
    setSelectedItem(defaultCategory.items[0].label);
    setQuantity(1);
  }, [initialType]);

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

  function handleCategoryChange(cat: (typeof OTHER_DESSERTS)[0]) {
    setActiveCategory(cat);
    setSelectedItem(cat.items[0].label);
    setQuantity(1);
  }

  function handleAddToCart() {
    addItem({
      productId: activeCategory.id,
      name: `${activeCategory.label} — ${selectedItem}`,
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
              <h1 className="text-[40px] sm:text-[45px]">حلويات أخرى</h1>
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
                  {OTHER_DESSERTS.map((cat) => (
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

              {/* Item */}
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
