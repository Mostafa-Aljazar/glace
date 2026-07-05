"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoNav from "@/components/Common/LogoNav";
import OrderLeaveConfirmationDialog from "@/components/Order/OrderLeaveConfirmationDialog";
import { useLeavePageGuard } from "@/hooks/order";
import {
  imgL,
  imgIesPP,
  imgIesC,
  imgIcee,
  imgIesP,
  luqaimat,
  popImgG,
  addItemIcon,
  circleE,
} from "@/assets/images";
import {
  LUQAIMAT_TYPES,
  getLuqaimatItemPrice,
  type LuqaimatItem,
} from "@/data/OrderData";

let nextId = 2;

const DEFAULT_LUQAIMAT_ITEMS: LuqaimatItem[] = [
  { id: 1, type: "لقيمات نوتيلا", quantity: 1 },
];

export default function LuqaimatOrderClientPage() {
  const [items, setItems] = useState<LuqaimatItem[]>([
    ...DEFAULT_LUQAIMAT_ITEMS,
  ]);

  const lastItem = items[items.length - 1];
  const totalPrice = items.reduce(
    (sum, item) => sum + getLuqaimatItemPrice(item),
    0,
  );

  const hasPendingSelections =
    items.length !== DEFAULT_LUQAIMAT_ITEMS.length ||
    items.some((item, index) => {
      const defaultItem = DEFAULT_LUQAIMAT_ITEMS[index];
      return (
        !defaultItem ||
        item.type !== defaultItem.type ||
        item.quantity !== defaultItem.quantity
      );
    });

  const clearSelections = useCallback(() => {
    setItems([...DEFAULT_LUQAIMAT_ITEMS]);
  }, []);

  const { showCloseConfirm, handleCancelLeave, handleConfirmLeave } =
    useLeavePageGuard(hasPendingSelections, clearSelections);

  function changeType(id: number, type: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, type } : item)),
    );
  }

  function changeQuantity(id: number, delta: number) {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      if (item.quantity + delta < 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + delta } : i,
      );
    });
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function addNewItem() {
    const id = nextId++;
    setItems((prev) => [...prev, { id, type: "لقيمات نوتيلا", quantity: 1 }]);
  }

  return (
    <div className="relative bg-[#51c9f4] min-h-screen overflow-x-hidden">
      {/* Background blob */}
      <div className="top-0 right-0 z-0 absolute w-[350px] max-[700px]:w-[130px] max-[991px]:w-[200px] h-full pointer-events-none">
        <Image src={imgL} alt="" fill className="object-contain object-top" />
      </div>

      <LogoNav />

      {/* Decorative images */}
      <div className="max-[991px]:hidden top-[80px] left-0 z-0 absolute w-[120px] pointer-events-none">
        <Image
          src={imgIesPP}
          alt=""
          width={120}
          height={300}
          className="object-contain"
        />
      </div>
      <div className="max-[991px]:hidden top-[80px] right-[320px] z-0 absolute w-[80px] pointer-events-none">
        <Image
          src={imgIesC}
          alt=""
          width={80}
          height={200}
          className="object-contain"
        />
      </div>

      {/* Body */}
      <div className="z-10 relative px-4 pb-[60px]">
        <div className="relative mx-auto w-[96%] max-w-[1720px]">
          {/* Decorative ice cream images */}
          <div className="max-[991px]:hidden right-0 bottom-0 absolute w-[100px] pointer-events-none">
            <Image
              src={imgIcee}
              alt=""
              width={100}
              height={200}
              className="object-contain"
            />
          </div>
          <div className="max-[991px]:hidden bottom-0 left-0 absolute w-[80px] pointer-events-none">
            <Image
              src={imgIesP}
              alt=""
              width={80}
              height={180}
              className="object-contain"
            />
          </div>

          {/* Product info card */}
          <div className="flex flex-col justify-center items-center mt-[80px]">
            <div className="bg-white/[.17] backdrop-blur-[15px] mb-[12px] rounded-[30px] w-full overflow-hidden">
              <div className="flex max-[991px]:flex-col p-[20px] w-full">
                {/* Right: product title + image */}
                <div className="w-1/2 max-[991px]:w-full text-white text-center">
                  <h1 className="text-[45px]">لقيمات</h1>
                  <Image
                    src={luqaimat}
                    alt="لقيمات"
                    width={220}
                    height={220}
                    className="mx-auto max-h-[220px] max-[991px]:max-h-[200px] object-contain"
                  />
                </div>
                {/* Left: price table */}
                <div className="max-[991px]:mx-auto w-1/2 max-[991px]:w-full max-[991px]:max-w-[460px]">
                  <div className="bg-[#2d849e94] backdrop-blur-[20px] p-[15px_20px] rounded-[20px] max-h-[280px] max-[991px]:max-h-none overflow-y-auto">
                    <table className="w-full text-white">
                      <tbody>
                        {[
                          { name: "لقيمات نوتيلا", price: 10 },
                          { name: "لقيمات لوتس", price: 12 },
                          { name: "لقيمات بستاشيو", price: 15 },
                          { name: "لقيمات مكس (نوتيلا+لوتس)", price: 12 },
                          {
                            name: "لقيمات سوبر مكس (نوتيلا+لوتس+بيستاشيو)",
                            price: 15,
                          },
                        ].map((row) => (
                          <tr
                            key={row.name}
                            className="border-white/20 last:border-0 border-b"
                          >
                            <td className="px-[5px] py-[10px] text-[23px] text-start">
                              {row.name}
                            </td>
                            <td className="px-[5px] py-[10px] text-[23px] text-center">
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

            {/* Order builder card */}
            <div className="bg-white/[.17] backdrop-blur-[15px] mt-[12px] rounded-[30px] w-full overflow-hidden">
              <div className="flex flex-col p-[20px]">
                <h1 className="mb-[15px] text-[45px] text-white max-[768px]:text-[22px] text-center">
                  إنشاء الطلب
                </h1>

                {/* Order table */}
                <div className="bg-[#2d849e94] backdrop-blur-[20px] mb-[20px] p-[15px_30px_20px] rounded-[20px]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[440px] text-white">
                      <thead>
                        <tr className="border-white/30 border-b">
                          <td className="p-[10px] font-['Almarai',sans-serif] text-[16px]" />
                          <td className="p-[10px] w-[120px] font-['Almarai',sans-serif] text-[16px]">
                            إختر النوع
                          </td>
                          <td className="p-[10px] font-['Almarai',sans-serif] text-[16px]">
                            العدد
                          </td>
                          <td className="p-[10px] font-['Almarai',sans-serif] text-[16px]">
                            السعر
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const isLast = item.id === lastItem?.id;
                          const price = getLuqaimatItemPrice(item);
                          return (
                            <tr
                              key={item.id}
                              className="border-white/20 last:border-transparent border-b"
                            >
                              {/* Delete */}
                              <td className="p-[10px] w-[40px]">
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="bg-transparent p-0 border-0 cursor-pointer"
                                >
                                  <Image
                                    src={circleE}
                                    alt="حذف"
                                    width={25}
                                    height={25}
                                    className="block mx-auto"
                                  />
                                </button>
                              </td>
                              {/* Type */}
                              <td className="p-[10px] w-[120px]">
                                {isLast ? (
                                  <select
                                    value={item.type}
                                    onChange={(e) =>
                                      changeType(item.id, e.target.value)
                                    }
                                    className="bg-transparent border-0 outline-none min-w-[130px] font-['Almarai',sans-serif] text-[16px] text-white cursor-pointer"
                                  >
                                    {LUQAIMAT_TYPES.map((t) => (
                                      <option
                                        key={t.value}
                                        value={t.value}
                                        className="bg-[#2d849e]"
                                      >
                                        {t.value}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="font-['Almarai',sans-serif] text-[16px]">
                                    {item.type}
                                  </span>
                                )}
                              </td>
                              {/* Quantity */}
                              <td className="p-[10px]">
                                <div className="flex items-center gap-[7px]">
                                  <button
                                    type="button"
                                    onClick={() => changeQuantity(item.id, -1)}
                                    className="flex justify-center items-center bg-transparent border border-white rounded-full w-[25px] h-[25px] text-[16px] text-white cursor-pointer"
                                  >
                                    <i className="bx bx-minus" />
                                  </button>
                                  <span className="min-w-[22px] font-['Almarai',sans-serif] text-[22px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => changeQuantity(item.id, 1)}
                                    className="flex justify-center items-center bg-transparent border border-white rounded-full w-[25px] h-[25px] text-[16px] text-white cursor-pointer"
                                  >
                                    <i className="bx bx-plus" />
                                  </button>
                                </div>
                              </td>
                              {/* Price */}
                              <td className="p-[10px]">
                                <span className="font-['Almarai',sans-serif] text-[16px]">
                                  {price.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Add new item */}
                  <button
                    type="button"
                    onClick={addNewItem}
                    className="flex items-center gap-[4px] bg-transparent mt-[20px] mr-auto border-0 text-white cursor-pointer"
                  >
                    <Image
                      src={addItemIcon}
                      alt=""
                      width={25}
                      height={25}
                      className="w-[25px] h-[25px] object-contain"
                    />
                    <span className="font-['Almarai',sans-serif] text-[16px]">
                      إضافة عنصر جديد
                    </span>
                  </button>
                </div>

                {/* Total + submit */}
                <div className="flex flex-wrap justify-between items-baseline gap-[10px] px-4 text-white">
                  <div className="mr-[20px] max-[768px]:mr-0">
                    <h3 className="font-['Almarai',sans-serif] text-[20px] max-[991px]:text-[18px]">
                      الإجمالي :{" "}
                      <span className="font-['Almarai',sans-serif] text-[30px] max-[991px]:text-[26px]">
                        {totalPrice.toFixed(2)}
                      </span>{" "}
                      شيكل
                    </h3>
                  </div>
                  <div className="mt-[8px]">
                    <Link
                      href="/menu/order-details"
                      className="relative flex justify-center items-center bg-transparent max-[768px]:mx-auto border-0 max-[768px]:w-[200px] min-w-[150px] max-[768px]:min-w-[140px] h-[70px] max-[768px]:h-[55px] no-underline cursor-pointer"
                    >
                      <Image
                        src={popImgG}
                        alt=""
                        fill
                        className="opacity-80 object-fill rotate-[-5deg]"
                      />
                      <span className="relative text-[40px] text-white max-[768px]:text-[30px]">
                        إضافة طلب
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <OrderLeaveConfirmationDialog
            open={showCloseConfirm}
            onClose={handleCancelLeave}
            onConfirm={handleConfirmLeave}
          />
        </div>
      </div>
    </div>
  );
}
