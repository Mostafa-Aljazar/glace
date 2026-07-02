"use client";

import { useState } from "react";
import { ShoppingBag, Clock, ChefHat, Truck, CheckCircle2, ChevronDown, ChevronUp, Package } from "lucide-react";
import { useOrderStore, type OrderStatus } from "@/store/orderStore";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";

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

const STATUS_COLORS: Record<OrderStatus, string> = {
  "قيد المراجعة": "bg-yellow-500/30 text-yellow-200",
  "قيد التحضير": "bg-blue-500/30 text-blue-200",
  "في الطريق": "bg-purple-500/30 text-purple-200",
  "تم التسليم": "bg-green-500/30 text-green-200",
};

export default function OrdersPanel() {
  const orders = useOrderStore((s) => s.orders);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <DashboardCard title="طلباتي" icon={ShoppingBag}>
        <EmptyState
          icon={ShoppingBag}
          message="لا يوجد طلبات بعد"
          action={{ label: "تصفح المنيو", href: "/menu" }}
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="طلباتي" icon={ShoppingBag}>
      <div className="flex flex-col gap-3">
        {sorted.map((order) => {
          const isOpen = expandedId === order.id;
          const currentStep = STATUS_STEPS.findIndex((s) => s.key === order.status);

          return (
            <div key={order.id} className="border border-white/20 rounded-[20px] overflow-hidden">
              {/* Row header */}
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : order.id)}
                className="flex items-center justify-between w-full px-5 py-4 text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-glace-yellow font-bold text-[15px]">{order.id}</span>
                  <span className="text-white/60 text-[13px]">
                    {new Date(order.createdAt).toLocaleDateString("ar-PS", { dateStyle: "medium" })}
                  </span>
                  <span className={`text-[12px] px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-[17px]">{order.total.toFixed(2)} ₪</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-white/10 pt-4 flex flex-col gap-5">
                  {/* Status stepper */}
                  <div className="flex justify-between items-center relative py-2">
                    <div className="absolute top-[50%] right-[5%] left-[5%] h-[2px] bg-white/20 -translate-y-1/2" />
                    {STATUS_STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const done = idx <= currentStep;
                      return (
                        <div key={step.key} className="z-10 relative flex flex-col items-center gap-1 text-center">
                          <div className={`flex justify-center items-center rounded-full w-9 h-9 ${done ? "bg-glace-yellow text-[#388dab]" : "bg-white/20 text-white/40"}`}>
                            <Icon size={18} />
                          </div>
                          <span className={`text-[11px] sm:text-[13px] ${done ? "text-white font-bold" : "text-white/40"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="flex items-center gap-2 text-white/70 text-[14px] mb-3">
                      <Package size={16} /> المنتجات
                    </p>
                    <div className="flex flex-col gap-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-[14px] pb-2 border-b border-white/10">
                          <div>
                            <span className="font-bold">{item.name}</span>
                            {item.size && <span className="text-white/60 mr-2">({item.size})</span>}
                            <span className="text-white/60 mr-2">× {item.quantity}</span>
                          </div>
                          <span>{((item.unitPrice + item.addonTotal) * item.quantity).toFixed(2)} ₪</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex gap-4 text-[13px] text-white/60 flex-wrap">
                    <span>الدفع: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
                    <span>الاستلام: {order.deliveryMethod === "delivery" ? "توصيل" : "من المحل"}</span>
                    {order.discount > 0 && <span className="text-green-300">خصم: -{order.discount} ₪</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
