"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Tag, CheckCircle, XCircle } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCartStore } from "@/store/cartStore";
import { useWalletStore } from "@/store/walletStore";
import { useOrderStore } from "@/store/orderStore";
import type { PaymentMethod, DeliveryMethod, DeliveryAddress } from "@/store/orderStore";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: string }[] = [
  { id: "jawwal", label: "جوال باي", desc: "ادفع عبر محفظة جوال باي" },
  { id: "paypal", label: "باي بال", desc: "ادفع عبر PayPal" },
  { id: "cash", label: "كاش", desc: "الدفع عند الاستلام" },
  { id: "visa", label: "فيزا / ماستر كارت", desc: "ادفع ببطاقة الائتمان" },
  { id: "wallet", label: "محفظتي في النظام", desc: "ادفع من رصيد محفظتك" },
];

interface Props {
  deliveryMethod: DeliveryMethod;
  address?: DeliveryAddress;
}

export default function PaymentClientPage({ deliveryMethod, address }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [jawwalPhone, setJawwalPhone] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cashPaid, setCashPaid] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = useCartStore((s) => s.total);
  const discount = useCartStore((s) => s.discount);
  const coupon = useCartStore((s) => s.coupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const clearCart = useCartStore((s) => s.clearCart);
  const walletBalance = useWalletStore((s) => s.balance);
  const walletDeduct = useWalletStore((s) => s.deduct);
  const walletTopUp = useWalletStore((s) => s.topUp);
  const placeOrder = useOrderStore((s) => s.placeOrder);

  const [couponInput, setCouponInput] = useState(coupon);
  const couponApplied = discount > 0;
  const couponInvalid =
    couponInput.trim().length > 0 && !couponApplied && couponInput !== coupon;

  const orderTotal = total();
  const cashChange = cashPaid ? Math.max(0, parseFloat(cashPaid) - orderTotal) : 0;

  function handleApplyCoupon() {
    applyCoupon(couponInput.trim());
  }

  function handleConfirm() {
    if (method === "wallet" && walletBalance < orderTotal) return;

    if (method === "wallet") {
      walletDeduct(orderTotal, "دفع طلب");
    } else if (method === "cash" && cashChange > 0) {
      walletTopUp(cashChange, "باقي كاش");
    }

    const orderId = placeOrder({
      items,
      subtotal: subtotal(),
      discount,
      total: orderTotal,
      paymentMethod: method,
      deliveryMethod,
      address,
    });
    clearCart();
    setPlacedOrderId(orderId);
    setSuccessOpen(true);
  }

  const inputClass = "bg-transparent border-white text-white placeholder:text-white/60 rounded-[20px] focus-visible:ring-white/30";

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-12 max-w-300">
        <h1 className="mb-6 text-white text-[40px] sm:text-[50px] text-center">الدفع</h1>

        <div className="flex lg:flex-row flex-col gap-6">
          {/* Payment methods */}
          <div className="flex-1">
            <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-6 text-white">
              <h2 className="mb-5 text-[24px]">اختر طريقة الدفع</h2>

              <div className="mb-6 rounded-[20px] border border-white/25 bg-white/10 p-4">
                <p className="text-white/80 text-[14px] mb-2.5 flex items-center gap-1.5">
                  <Tag size={14} className="text-glace-yellow" />
                  كود الخصم
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="أدخل الكود"
                    disabled={couponApplied}
                    className="flex-1 bg-white/10 border border-white/25 focus:border-glace-yellow/50 rounded-[14px] px-3.5 py-2.5 text-white text-[15px] placeholder:text-white/40 outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponApplied || !couponInput.trim()}
                    className="bg-glace-yellow hover:brightness-105 text-[#1e6a7f] rounded-[14px] px-4 py-2.5 text-[14px] font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    تطبيق
                  </button>
                </div>
                {couponApplied && (
                  <p className="flex items-center gap-1.5 text-green-300 text-[13px] mt-2.5">
                    <CheckCircle size={14} />
                    تم تطبيق خصم {discount} ₪
                  </p>
                )}
                {couponInvalid && !couponApplied && (
                  <p className="flex items-center gap-1.5 text-red-300 text-[13px] mt-2.5">
                    <XCircle size={14} />
                    كود غير صالح
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-4 p-4 rounded-[20px] border cursor-pointer transition-colors ${
                      method === m.id ? "border-white bg-white/20" : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    <input type="radio" name="payment" value={m.id} checked={method === m.id}
                      onChange={() => setMethod(m.id)} className="w-5 h-5 accent-white" />
                    <div>
                      <p className="text-[18px] font-bold">{m.label}</p>
                      <p className="text-[14px] opacity-80">{m.desc}</p>
                      {m.id === "wallet" && (
                        <p className="text-[14px] text-glace-yellow">رصيدك: {walletBalance.toFixed(2)} ₪</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Method-specific inputs */}
              {method === "jawwal" && (
                <div className="mb-5">
                  <label className="block mb-2 text-[16px]">رقم جوال باي</label>
                  <Input value={jawwalPhone} onChange={(e) => setJawwalPhone(e.target.value)}
                    placeholder="05XXXXXXXX" className={inputClass} />
                </div>
              )}

              {method === "paypal" && (
                <div className="mb-5">
                  <label className="block mb-2 text-[16px]">البريد الإلكتروني لـ PayPal</label>
                  <Input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)}
                    type="email" placeholder="email@example.com" className={inputClass} />
                </div>
              )}

              {method === "visa" && (
                <div className="flex flex-col gap-3 mb-5">
                  <div>
                    <label className="block mb-1 text-[16px]">رقم البطاقة</label>
                    <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="XXXX XXXX XXXX XXXX" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-[16px]">تاريخ الانتهاء</label>
                      <Input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY" className={inputClass} />
                    </div>
                    <div>
                      <label className="block mb-1 text-[16px]">CVV</label>
                      <Input value={cardCvv} onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="XXX" className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              {method === "cash" && (
                <div className="mb-5">
                  <label className="block mb-2 text-[16px]">المبلغ المدفوع</label>
                  <Input value={cashPaid} onChange={(e) => setCashPaid(e.target.value)}
                    type="number" placeholder="أدخل المبلغ" className={inputClass} />
                  {cashChange > 0 && (
                    <p className="mt-2 text-glace-yellow text-[16px]">
                      المتبقي: {cashChange.toFixed(2)} ₪ — سيُضاف لمحفظتك في النظام
                    </p>
                  )}
                </div>
              )}

              {method === "wallet" && walletBalance < orderTotal && (
                <p className="mb-5 text-red-300 text-[16px]">
                  رصيد غير كافٍ. رصيدك {walletBalance.toFixed(2)} ₪ والمطلوب {orderTotal.toFixed(2)} ₪
                </p>
              )}

              <Button
                type="button"
                onClick={handleConfirm}
                disabled={method === "wallet" && walletBalance < orderTotal}
                className="bg-[#117291] hover:bg-[#0e6080] disabled:opacity-50 border-0 rounded-[30px] w-full text-white text-[20px] h-auto py-3 cursor-pointer"
              >
                تأكيد الدفع
              </Button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:w-[280px] w-full">
            <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-6 text-white">
              <h2 className="mb-4 text-[22px]">الإجمالي</h2>
              <div className="flex justify-between mb-2 text-[16px]">
                <span>المجموع الجزئي</span>
                <span>{subtotal().toFixed(2)} ₪</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between mb-2 text-[16px] text-green-300">
                  <span>خصم</span>
                  <span>- {discount} ₪</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-white/30 font-bold text-[24px]">
                <span>الإجمالي</span>
                <span>{orderTotal.toFixed(2)} ₪</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/30 text-[15px] opacity-80">
                <p>طريقة الاستلام: {deliveryMethod === "delivery" ? "توصيل" : "استلام من المحل"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent
          showCloseButton={false}
          className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] text-center text-white ring-0"
        >
          <DialogHeader className="items-center gap-3">
            <div className="flex justify-center items-center bg-glace-yellow rounded-full size-16">
              <CheckCircle2 className="size-9 text-[#388dab]" strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-2xl text-white">تم تأكيد طلبك بنجاح!</DialogTitle>
            <DialogDescription className="text-base text-white/90">
              رقم طلبك هو: <span className="font-bold text-glace-yellow">{placedOrderId}</span>
            </DialogDescription>
          </DialogHeader>
          <Button asChild className="bg-[#4397ae] hover:bg-[#4397ae]/90 mt-4 px-6 py-2.5 rounded-[30px] w-full text-white text-lg h-auto">
            <Link href={`/order-status/${placedOrderId}`}>تتبع الطلب</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
