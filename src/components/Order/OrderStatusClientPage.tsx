"use client";

import Link from "next/link";
import { CheckCircle2, Clock, ChefHat, Truck, Package } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import { Button } from "@/components/ui/button";
import { useOrderStore, type OrderStatus } from "@/store/orderStore";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: typeof Clock }[] = [
  { key: "قيد المراجعة", label: "قيد المراجعة", icon: Clock },
  { key: "قيد التحضير", label: "قيد التحضير", icon: ChefHat },
  { key: "في الطريق", label: "في الطريق", icon: Truck },
  { key: "تم التسليم", label: "تم التسليم", icon: CheckCircle2 },
];

const PAYMENT_LABELS: Record<string, string> = {
  jawwal: "جوال باي",
  paypal: "باي بال",
  cash: "كاش",
  visa: "فيزا",
  wallet: "محفظة النظام",
};

export default function OrderStatusClientPage({ id }: { id: string }) {
  const getOrder = useOrderStore((s) => s.getOrder);
  const order = getOrder(id);

  if (!order) {
    return (
      <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
        
        <EventsBackground />
        <div className="z-90 relative flex flex-col justify-center items-center gap-6 mx-auto px-4 pt-20 max-w-300 text-white text-center">
          <p className="text-[26px]">الطلب غير موجود</p>
          <Button asChild className="bg-[#117291] hover:bg-[#0e6080] px-8 py-3 rounded-[30px] text-white text-[20px] h-auto">
            <Link href="/menu">العودة للمنيو</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-12 max-w-300">
        <h1 className="mb-2 text-white text-[40px] sm:text-[50px] text-center">تتبع الطلب</h1>
        <p className="mb-6 text-white/80 text-[18px] text-center">رقم الطلب: <span className="font-bold text-glace-yellow">{order.id}</span></p>

        {/* Status stepper */}
        <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-6 mb-6">
          <div className="flex justify-between items-center relative">
            <div className="top-[22px] left-[10%] absolute bg-white/20 h-[2px] w-[80%]" />
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const done = idx <= currentStep;
              return (
                <div key={step.key} className="z-10 relative flex flex-col items-center gap-2 text-center">
                  <div className={`flex justify-center items-center rounded-full w-11 h-11 transition-colors ${
                    done ? "bg-glace-yellow text-[#388dab]" : "bg-white/20 text-white/50"
                  }`}>
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <span className={`text-[13px] sm:text-[15px] ${done ? "text-white font-bold" : "text-white/50"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex lg:flex-row flex-col gap-6">
          {/* Items */}
          <div className="flex-1 bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-6 text-white">
            <h2 className="mb-4 text-[22px] flex items-center gap-2">
              <Package size={22} /> المنتجات
            </h2>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between border-b border-white/20 pb-3">
                  <div>
                    <p className="text-[17px] font-bold">{item.name}</p>
                    {item.size && <p className="text-[14px] opacity-70">الحجم: {item.size}</p>}
                    {item.type && <p className="text-[14px] opacity-70">النوع: {item.type}</p>}
                    <p className="text-[14px] opacity-70">الكمية: {item.quantity}</p>
                  </div>
                  <p className="text-[17px] font-bold">
                    {((item.unitPrice + item.addonTotal) * item.quantity).toFixed(2)} ₪
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order details */}
          <div className="lg:w-[280px] w-full bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-6 text-white">
            <h2 className="mb-4 text-[22px]">تفاصيل الطلب</h2>
            <div className="flex flex-col gap-2 text-[16px]">
              <div className="flex justify-between">
                <span className="opacity-70">المجموع الجزئي</span>
                <span>{order.subtotal.toFixed(2)} ₪</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-300">
                  <span>خصم</span>
                  <span>- {order.discount} ₪</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/30 font-bold text-[20px]">
                <span>الإجمالي</span>
                <span>{order.total.toFixed(2)} ₪</span>
              </div>
              <div className="mt-2 pt-2 border-t border-white/20 opacity-70 text-[14px]">
                <p>طريقة الدفع: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
                <p>الاستلام: {order.deliveryMethod === "delivery" ? "توصيل" : "من المحل"}</p>
                {order.address && <p className="mt-1">{order.address.city}، {order.address.area}، {order.address.street}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6 justify-center flex-wrap">
          <Button asChild className="bg-[#117291] hover:bg-[#0e6080] border-0 rounded-[30px] text-white text-[18px] h-auto py-3 px-8">
            <Link href="/menu">العودة للمنيو</Link>
          </Button>
          <Button asChild variant="outline" className="border-white rounded-[30px] text-white bg-transparent hover:bg-white/10 text-[18px] h-auto py-3 px-8">
            <Link href="/my-orders">طلباتي</Link>
          </Button>
        </div>
      </div>

    </div>
  );
}
