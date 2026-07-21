"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, Tag, CheckCircle, XCircle, ChevronLeft } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/store/cartStore";

function ItemCard({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem     = useCartStore((s) => s.removeItem);
  const linePrice      = (item.unitPrice + item.addonTotal) * item.quantity;

  return (
    <div className="flex items-start gap-4 bg-white/[.08] hover:bg-white/[.11] border border-white/10 rounded-[20px] p-4 sm:p-5 transition-colors">

      {/* Icon placeholder */}
      <div className="flex items-center justify-center shrink-0 size-12 rounded-[14px] bg-white/10 border border-white/15 text-white/50">
        <ShoppingCart size={20} strokeWidth={1.5} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-[16px] sm:text-[17px] leading-snug mb-1 truncate">
          {item.name}
        </p>
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex flex-wrap gap-2">
            {item.size && (
              <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-0.5 text-[11px] text-white/70">
                <span className="text-white/40">الحجم</span> {item.size}
              </span>
            )}
            {item.type && (
              <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-0.5 text-[11px] text-white/70">
                <span className="text-white/40">النوع</span> {item.type}
              </span>
            )}
          </div>
          {item.flavors && item.flavors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(
                item.flavors.reduce<Record<string, number>>((acc, f) => ({ ...acc, [f]: (acc[f] ?? 0) + 1 }), {})
              ).map(([name, count]) => (
                <span key={name} className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-0.5 text-[11px] text-white/80">
                  {name}
                  {count > 1 && <span className="bg-glace-yellow text-[#1e6a7f] font-bold rounded-full px-1.5 py-px text-[10px] leading-none">×{count}</span>}
                </span>
              ))}
            </div>
          )}
          {item.addons && item.addons.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.addons.map((a) => (
                <span key={a} className="inline-flex items-center bg-white/10 rounded-full px-2.5 py-0.5 text-[11px] text-white/70">
                  {a}
                </span>
              ))}
            </div>
          )}
          {item.notes && (
            <div className="mt-2 p-2.5 bg-white/8 border border-white/15 rounded-[12px]">
              <p className="text-[11px] text-white/50 mb-1">ملاحظة:</p>
              <p className="text-[12px] text-white/80 leading-relaxed">{item.notes}</p>
            </div>
          )}
        </div>

        {/* Unit price */}
        <p className="text-white/40 text-[12px] mt-1.5">
          {(item.unitPrice + item.addonTotal).toFixed(2)} ₪ × {item.quantity}
        </p>
      </div>

      {/* Qty + total + delete */}
      <div className="flex flex-col items-end gap-3 shrink-0">
        {/* Line total */}
        <p className="text-white font-bold text-[17px]">{linePrice.toFixed(2)} ₪</p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-2 py-1">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="flex items-center justify-center size-6 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            <Minus size={12} />
          </button>
          <span className="text-white text-[14px] font-bold min-w-[18px] text-center">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="flex items-center justify-center size-6 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="flex items-center gap-1 text-white/35 hover:text-red-300 text-[12px] transition-colors cursor-pointer"
        >
          <Trash2 size={13} />
          حذف
        </button>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="flex items-center justify-center size-24 rounded-full bg-white/10 border border-white/15">
        <ShoppingCart size={40} className="text-white/40" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-white text-[24px] font-bold mb-2">سلتك فارغة</h2>
        <p className="text-white/50 text-[15px]">أضف منتجات من المنيو لتبدأ طلبك</p>
      </div>
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[15px] px-7 py-3 rounded-full transition-all shadow-[0_4px_16px_rgba(244,228,81,0.35)]"
      >
        <ShoppingCart size={16} />
        تصفح المنيو
      </Link>
    </div>
  );
}

export default function CartClientPage() {
  const items          = useCartStore((s) => s.items);
  const subtotal       = useCartStore((s) => s.subtotal);
  const total          = useCartStore((s) => s.total);
  const discount       = useCartStore((s) => s.discount);
  const coupon         = useCartStore((s) => s.coupon);
  const applyCoupon    = useCartStore((s) => s.applyCoupon);
  const clearCart      = useCartStore((s) => s.clearCart);

  const [couponInput, setCouponInput] = useState(coupon);
  const couponApplied  = discount > 0;
  const couponInvalid  = couponInput.length > 0 && !couponApplied;

  function handleApply() {
    applyCoupon(couponInput.trim());
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-16 max-w-[1200px]">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mt-4 mb-8">
          <div>
            <h1 className="text-white text-[34px] sm:text-[44px] font-bold leading-tight">سلة التسوق</h1>
            {items.length > 0 && (
              <p className="text-white/50 text-[14px] mt-1">{items.length} منتج في سلتك</p>
            )}
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-[14px] transition-colors"
          >
            <ArrowRight size={15} />
            متابعة التسوق
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px]">
            <EmptyCart />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ── Items column ── */}
            <div className="flex-1 w-full">
              <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-5 sm:p-7">

                {/* Column header */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white text-[20px] font-bold">المنتجات</h2>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="inline-flex items-center gap-1.5 text-white/40 hover:text-red-300 text-[13px] transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    حذف الكل
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Summary column ── */}
            <div className="w-full lg:w-[340px] shrink-0">
              <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-6 text-white">

                <h2 className="text-[20px] font-bold mb-6">ملخص الطلب</h2>

                {/* Price rows */}
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-white/65">المجموع الجزئي</span>
                    <span className="font-medium">{subtotal().toFixed(2)} ₪</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-[15px]">
                      <span className="text-green-300/80">خصم الكوبون</span>
                      <span className="text-green-300 font-medium">− {discount} ₪</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/15 mb-5" />

                {/* Total */}
                <div className="flex justify-between items-center mb-7">
                  <span className="text-[17px] font-bold">الإجمالي</span>
                  <span className="text-glace-yellow text-[24px] font-bold">{total().toFixed(2)} ₪</span>
                </div>

                {/* Coupon */}
                <div className="mb-6">
                  <p className="text-white/60 text-[13px] mb-2 flex items-center gap-1.5">
                    <Tag size={13} />
                    كود الخصم
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApply()}
                      placeholder="أدخل الكود"
                      disabled={couponApplied}
                      className="flex-1 bg-white/10 border border-white/20 focus:border-white/40 rounded-[14px] px-4 py-2.5 text-white text-[14px] placeholder:text-white/35 outline-none transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={couponApplied || !couponInput.trim()}
                      className="bg-white/15 hover:bg-white/25 border border-white/20 rounded-[14px] px-4 py-2.5 text-white text-[14px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      تطبيق
                    </button>
                  </div>

                  {couponApplied && (
                    <p className="flex items-center gap-1.5 text-green-300 text-[13px] mt-2">
                      <CheckCircle size={13} />
                      تم تطبيق خصم {discount} ₪
                    </p>
                  )}
                  {couponInvalid && !couponApplied && (
                    <p className="flex items-center gap-1.5 text-red-300 text-[13px] mt-2">
                      <XCircle size={13} />
                      كود غير صالح
                    </p>
                  )}
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[16px] w-full py-3.5 rounded-[20px] transition-all shadow-[0_4px_20px_rgba(244,228,81,0.35)] hover:shadow-[0_6px_28px_rgba(244,228,81,0.5)] hover:-translate-y-0.5"
                >
                  إتمام الطلب
                  <ChevronLeft size={18} />
                </Link>

                <p className="text-white/30 text-[12px] text-center mt-4">
                  جميع الأسعار بالشيكل الإسرائيلي ₪
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
