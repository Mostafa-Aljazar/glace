"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoNav from "@/components/Common/LogoNav";
import {
  imgL, imgIesPP, imgIesC, imgIcee, imgIesP,
  luqaimat, popImgG, addItemIcon, circleE,
} from "@/assets/images";
import {
  LUQAIMAT_TYPES, LUQAIMAT_PRICES, getLuqaimatItemPrice,
  type LuqaimatItem,
} from "@/data/OrderData";

let nextId = 2;

export default function LuqaimatOrderClientPage() {
  const [items, setItems] = useState<LuqaimatItem[]>([
    { id: 1, type: "لقيمات نوتيلا", quantity: 1 },
  ]);

  const lastItem = items[items.length - 1];
  const totalPrice = items.reduce((sum, item) => sum + getLuqaimatItemPrice(item), 0);

  function changeType(id: number, type: string) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, type } : item));
  }

  function changeQuantity(id: number, delta: number) {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      if (item.quantity + delta < 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i);
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
    <div className="min-h-screen bg-[#51c9f4] relative overflow-x-hidden">
      {/* Background blob */}
      <div className="absolute top-0 right-0 w-[350px] h-full pointer-events-none z-0 max-[991px]:w-[200px] max-[700px]:w-[130px]">
        <Image src={imgL} alt="" fill className="object-contain object-top" />
      </div>

      <LogoNav />

      {/* Decorative images */}
      <div className="absolute top-[80px] left-0 w-[120px] pointer-events-none z-0 max-[991px]:hidden">
        <Image src={imgIesPP} alt="" width={120} height={300} className="object-contain" />
      </div>
      <div className="absolute top-[80px] right-[320px] w-[80px] pointer-events-none z-0 max-[991px]:hidden">
        <Image src={imgIesC} alt="" width={80} height={200} className="object-contain" />
      </div>

      {/* Body */}
      <div className="relative z-10 px-4 pb-[60px]">
        <div className="w-[96%] max-w-[1720px] mx-auto relative">
          {/* Decorative ice cream images */}
          <div className="absolute right-0 bottom-0 w-[100px] pointer-events-none max-[991px]:hidden">
            <Image src={imgIcee} alt="" width={100} height={200} className="object-contain" />
          </div>
          <div className="absolute left-0 bottom-0 w-[80px] pointer-events-none max-[991px]:hidden">
            <Image src={imgIesP} alt="" width={80} height={180} className="object-contain" />
          </div>

          {/* Product info card */}
          <div className="flex items-center justify-center flex-col mt-[80px]">
            <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] w-full mb-[12px] overflow-hidden">
              <div className="flex w-full p-[20px] max-[991px]:flex-col">
                {/* Right: product title + image */}
                <div className="w-1/2 text-center text-white max-[991px]:w-full">
                  <h1 className="text-[45px]">لقيمات</h1>
                  <Image src={luqaimat} alt="لقيمات" width={220} height={220} className="mx-auto max-h-[220px] object-contain max-[991px]:max-h-[200px]" />
                </div>
                {/* Left: price table */}
                <div className="w-1/2 max-[991px]:w-full max-[991px]:mx-auto max-[991px]:max-w-[460px]">
                  <div className="bg-[#2d849e94] backdrop-blur-[20px] rounded-[20px] p-[15px_20px] max-h-[280px] overflow-y-auto max-[991px]:max-h-none">
                    <table className="w-full text-white">
                      <tbody>
                        {[
                          { name: "لقيمات نوتيلا", price: 10 },
                          { name: "لقيمات لوتس", price: 12 },
                          { name: "لقيمات بستاشيو", price: 15 },
                          { name: "لقيمات مكس (نوتيلا+لوتس)", price: 12 },
                          { name: "لقيمات سوبر مكس (نوتيلا+لوتس+بيستاشيو)", price: 15 },
                        ].map((row) => (
                          <tr key={row.name} className="border-b border-white/20 last:border-0">
                            <td className="py-[10px] px-[5px] text-[23px] text-start">{row.name}</td>
                            <td className="py-[10px] px-[5px] text-[23px] text-center">{row.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Order builder card */}
            <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] w-full overflow-hidden mt-[12px]">
              <div className="flex flex-col p-[20px]">
                <h1 className="text-center text-white mb-[15px] text-[45px] max-[768px]:text-[22px]">إنشاء الطلب</h1>

                {/* Order table */}
                <div className="bg-[#2d849e94] backdrop-blur-[20px] rounded-[20px] p-[15px_30px_20px] mb-[20px]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-white min-w-[440px]">
                      <thead>
                        <tr className="border-b border-white/30">
                          <td className="p-[10px] font-['Almarai',sans-serif] text-[16px]" />
                          <td className="p-[10px] font-['Almarai',sans-serif] text-[16px] w-[120px]">إختر النوع</td>
                          <td className="p-[10px] font-['Almarai',sans-serif] text-[16px]">العدد</td>
                          <td className="p-[10px] font-['Almarai',sans-serif] text-[16px]">السعر</td>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const isLast = item.id === lastItem?.id;
                          const price = getLuqaimatItemPrice(item);
                          return (
                            <tr key={item.id} className="border-b border-white/20 last:border-transparent">
                              {/* Delete */}
                              <td className="p-[10px] w-[40px]">
                                <button type="button" onClick={() => removeItem(item.id)} className="bg-transparent border-0 p-0 cursor-pointer">
                                  <Image src={circleE} alt="حذف" width={25} height={25} className="mx-auto block" />
                                </button>
                              </td>
                              {/* Type */}
                              <td className="p-[10px] w-[120px]">
                                {isLast ? (
                                  <select
                                    value={item.type}
                                    onChange={(e) => changeType(item.id, e.target.value)}
                                    className="bg-transparent border-0 text-white outline-none text-[16px] font-['Almarai',sans-serif] cursor-pointer min-w-[130px]"
                                  >
                                    {LUQAIMAT_TYPES.map((t) => (
                                      <option key={t.value} value={t.value} className="bg-[#2d849e]">{t.value}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-[16px] font-['Almarai',sans-serif]">{item.type}</span>
                                )}
                              </td>
                              {/* Quantity */}
                              <td className="p-[10px]">
                                <div className="flex items-center gap-[7px]">
                                  <button type="button" onClick={() => changeQuantity(item.id, -1)}
                                    className="w-[25px] h-[25px] border border-white rounded-full flex items-center justify-center text-white bg-transparent cursor-pointer text-[16px]">
                                    <i className="bx bx-minus" />
                                  </button>
                                  <span className="min-w-[22px] text-center text-[22px] font-['Almarai',sans-serif]">{item.quantity}</span>
                                  <button type="button" onClick={() => changeQuantity(item.id, 1)}
                                    className="w-[25px] h-[25px] border border-white rounded-full flex items-center justify-center text-white bg-transparent cursor-pointer text-[16px]">
                                    <i className="bx bx-plus" />
                                  </button>
                                </div>
                              </td>
                              {/* Price */}
                              <td className="p-[10px]">
                                <span className="text-[16px] font-['Almarai',sans-serif]">{price.toFixed(2)}</span>
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
                    className="flex items-center gap-[4px] text-white mt-[20px] cursor-pointer bg-transparent border-0 mr-auto"
                  >
                    <Image src={addItemIcon} alt="" width={25} height={25} className="w-[25px] h-[25px] object-contain" />
                    <span className="font-['Almarai',sans-serif] text-[16px]">إضافة عنصر جديد</span>
                  </button>
                </div>

                {/* Total + submit */}
                <div className="flex flex-wrap items-baseline justify-between text-white gap-[10px] px-4">
                  <div className="mr-[20px] max-[768px]:mr-0">
                    <h3 className="font-['Almarai',sans-serif] text-[20px] max-[991px]:text-[18px]">
                      الإجمالي : <span className="text-[30px] max-[991px]:text-[26px] font-['Almarai',sans-serif]">{totalPrice.toFixed(2)}</span> شيكل
                    </h3>
                  </div>
                  <div className="mt-[8px]">
                    <Link
                      href="/menu/order-details"
                      className="relative min-w-[150px] h-[70px] flex items-center justify-center bg-transparent border-0 cursor-pointer no-underline max-[768px]:min-w-[140px] max-[768px]:h-[55px] max-[768px]:w-[200px] max-[768px]:mx-auto"
                    >
                      <Image src={popImgG} alt="" fill className="object-fill rotate-[-5deg] opacity-80" />
                      <span className="relative text-white text-[40px] max-[768px]:text-[30px]">إضافة طلب</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
