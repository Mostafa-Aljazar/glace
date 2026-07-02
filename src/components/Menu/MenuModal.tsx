"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Star } from "lucide-react";
import { popImgG } from "@/assets/images";
import type { ApiMenuItem } from "@/data/fake-data/menuApiData";

interface MenuModalProps {
  item: ApiMenuItem | null;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function MenuModal({ item, onClose, onConfirm }: MenuModalProps) {
  if (!item) return null;

  return (
    <div
      className="z-[120000] fixed inset-0 flex justify-center items-end sm:items-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" onClick={onClose} />

      {/* Dialog — slides up from bottom on mobile, centered on sm+ */}
      <div className="relative z-10 w-full sm:w-[92%] sm:max-w-[1000px] max-h-[92vh] sm:max-h-[88vh] overflow-hidden bg-[#1b7496]/90 backdrop-blur-[30px] border border-white/20 rounded-t-[32px] sm:rounded-[32px] shadow-[0_20px_80px_rgba(0,0,0,0.5)] flex flex-col">

        {/* ── Modal header ── */}
        <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b border-white/15 shrink-0">
          <h2 className="text-white text-[20px] sm:text-[24px] font-bold truncate ml-3">
            {item.modalType !== "confirmation" ? item.name : "تنبيه"}
          </h2>
          <button
            onClick={onClose}
            className="flex justify-center items-center bg-white/15 hover:bg-white/25 border border-white/20 rounded-full w-[38px] h-[38px] text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Modal body ── */}
        <div className="overflow-y-auto flex-1">
          <div className="px-5 py-5">

            {/* ════ FLAVORS MODAL ════ */}
            {item.modalType === "flavors" && item.flavors && (
              <div className="w-full">
                <p className="text-white/60 text-[14px] text-center mb-5">
                  <Star size={13} className="inline ml-1 text-glace-yellow" />
                  {item.flavors.length} طعم متاح
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                  {item.flavors.map((f, i) => (
                    <div key={i} className="group flex flex-col items-center text-center gap-1 bg-white/[.08] hover:bg-white/[.16] border border-white/10 hover:border-white/30 rounded-[18px] p-3 transition-all duration-200 cursor-default">
                      <Image
                        src={f.image}
                        alt={f.nameAr}
                        width={80}
                        height={75}
                        className="w-[65px] h-[65px] sm:w-[80px] sm:h-[75px] object-contain group-hover:scale-105 transition-transform duration-200"
                      />
                      <p className="text-white text-[14px] sm:text-[15px] font-bold leading-tight">{f.nameAr}</p>
                      <p className="text-white/50 text-[11px] leading-tight">{f.nameEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════ TABLE MODAL ════ */}
            {item.modalType === "table" && (
              <div className="flex sm:flex-row flex-col gap-5 sm:gap-8">

                {/* Product image + name */}
                <div className="sm:w-[45%] flex flex-col items-center justify-center text-white text-center">
                  <div className="relative flex justify-center items-center bg-white/[.08] border border-white/15 rounded-[24px] p-5 w-full max-w-[300px] sm:max-w-none">
                    <div className="absolute inset-0 bg-radial-[ellipse_at_50%_70%] from-white/15 to-transparent rounded-[24px] pointer-events-none" />
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={300}
                      height={280}
                      className="relative z-10 w-[160px] h-[155px] sm:w-[220px] sm:h-[210px] md:w-[280px] md:h-[265px] object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
                    />
                  </div>
                  {item.priceRows && item.priceRows.length > 0 && (
                    <p className="mt-3 text-white/50 text-[13px]">
                      {item.priceRows[0].price !== undefined
                        ? `يبدأ من ${item.priceRows[0].price} ₪`
                        : item.priceRows[0].classic !== undefined
                        ? `يبدأ من ${item.priceRows[0].classic} ₪`
                        : null}
                    </p>
                  )}
                </div>

                {/* Price table */}
                <div className="sm:w-[55%] flex flex-col gap-3">
                  <h3 className="text-white/70 text-[14px] font-bold uppercase tracking-wider mb-1">الأسعار</h3>
                  <div className="bg-[#2d849e]/50 backdrop-blur-[10px] border border-white/15 rounded-[20px] overflow-hidden">
                    {item.tableHeaders && (
                      <div className="grid text-center bg-white/[.08] border-b border-white/15"
                        style={{ gridTemplateColumns: `2fr ${Array(item.tableHeaders.length - 1).fill("1fr").join(" ")}` }}
                      >
                        {item.tableHeaders.map((h, i) => (
                          <div key={i} className={`px-3 py-2.5 text-white/70 text-[13px] font-bold ${i === 0 ? "text-right" : "text-center"}`}>
                            {h}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="divide-y divide-white/10 max-h-[260px] overflow-y-auto">
                      {item.priceRows?.map((row, i) => (
                        <div
                          key={i}
                          className="grid items-center hover:bg-white/[.06] transition-colors"
                          style={{
                            gridTemplateColumns: row.classic !== undefined
                              ? `2fr 1fr 1fr`
                              : `2fr 1fr`,
                          }}
                        >
                          <div className="px-3 py-2.5 text-white text-[15px] font-bold text-right">{row.label}</div>
                          {row.classic !== undefined && (
                            <div className="px-3 py-2.5 text-center">
                              <span className="inline-block bg-[#51c9f4]/20 text-[#a8e8f8] text-[14px] font-bold rounded-lg px-2 py-0.5">
                                {row.classic} ₪
                              </span>
                            </div>
                          )}
                          {row.special !== undefined && (
                            <div className="px-3 py-2.5 text-center">
                              <span className="inline-block bg-glace-yellow/20 text-glace-yellow text-[14px] font-bold rounded-lg px-2 py-0.5">
                                {row.special} ₪
                              </span>
                            </div>
                          )}
                          {row.price !== undefined && row.classic === undefined && (
                            <div className="px-3 py-2.5 text-center">
                              <span className="inline-block bg-white/15 text-white text-[14px] font-bold rounded-lg px-2 py-0.5">
                                {row.price} ₪
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ CONFIRMATION MODAL ════ */}
            {item.modalType === "confirmation" && (
              <div className="flex flex-col items-center gap-6 py-6 text-center">
                <div className="flex justify-center items-center bg-yellow-400/20 border border-yellow-400/30 rounded-full w-16 h-16">
                  <span className="text-[32px]">⚠️</span>
                </div>
                <div>
                  <h3 className="text-white text-[22px] font-bold mb-2">انتبه!</h3>
                  <p className="text-white/70 text-[16px] max-w-[380px] leading-relaxed">
                    هذا المنتج لا يتناسب للتوصيل — متوفر داخل المعرض فقط
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex justify-center items-center border border-white/30 rounded-full w-[110px] h-[46px] text-white/80 hover:bg-white/10 transition-colors cursor-pointer text-[16px]"
                  >
                    إلغاء
                  </button>
                  <Link
                    href="/menu/order-cup"
                    onClick={onClose}
                    className="relative flex justify-center items-center w-[130px] h-[46px]"
                  >
                    <Image src={popImgG} alt="" fill className="absolute inset-0 object-fill" />
                    <span className="z-10 relative text-glace-yellow text-[20px] font-bold">تأكيد</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Modal footer — Order Now CTA ── */}
        {((item.modalType === "table" && item.orderHref) ||
          (item.modalType === "table" && item.confirmationModal) ||
          item.modalType === "flavors") && (
          <div className="shrink-0 border-t border-white/15 px-5 py-4 flex justify-between items-center gap-4 bg-[#1b7496]/60">
            <p className="text-white/50 text-[13px]">
              {item.modalType === "flavors"
                ? "هذه الأطعمة متوفرة في الكاسة والعائلي"
                : "اضغط لبدء الطلب"}
            </p>

            {item.modalType === "table" && item.orderHref && (
              <Link
                href={item.orderHref}
                className="flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[16px] px-6 py-2.5 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(244,228,81,0.35)] hover:-translate-y-0.5 shrink-0"
              >
                <ShoppingCart size={17} />
                اطلب الآن
              </Link>
            )}
            {item.modalType === "table" && item.confirmationModal && (
              <button
                onClick={onConfirm}
                className="flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[16px] px-6 py-2.5 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(244,228,81,0.35)] hover:-translate-y-0.5 cursor-pointer shrink-0 border-0"
              >
                <ShoppingCart size={17} />
                اطلب الآن
              </button>
            )}
            {item.modalType === "flavors" && (
              <Link
                href="/menu/order-cup"
                className="flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[16px] px-6 py-2.5 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(244,228,81,0.35)] hover:-translate-y-0.5 shrink-0"
              >
                <ShoppingCart size={17} />
                اطلب كاسة
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
