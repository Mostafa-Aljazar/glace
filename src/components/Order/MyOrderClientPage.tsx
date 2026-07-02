"use client";

import Link from "next/link";
import EventsBackground from "@/components/Events/EventsBackground";
import { useOrderStore } from "@/store/orderStore";
import { ShoppingBag, Clock, Calendar, CreditCard, Package, ArrowLeft, ChevronLeft } from "lucide-react";
import type { Order } from "@/store/orderStore";

const STATUS_STYLES: Record<Order["status"], string> = {
  "قيد المراجعة": "bg-yellow-400/20 text-yellow-200 border-yellow-400/30",
  "قيد التحضير": "bg-blue-400/20 text-blue-200 border-blue-400/30",
  "في الطريق":   "bg-purple-400/20 text-purple-200 border-purple-400/30",
  "تم التسليم":  "bg-green-400/20 text-green-200 border-green-400/30",
};

const PAYMENT_LABELS: Record<string, string> = {
  jawwal: "جوال باي",
  paypal: "باي بال",
  cash:   "كاش",
  visa:   "فيزا",
  wallet: "المحفظة",
};

const DELIVERY_LABELS: Record<string, string> = {
  delivery: "توصيل",
  pickup:   "استلام من المحل",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center">
      <div className="flex items-center justify-center size-20 rounded-full bg-white/10 border border-white/15">
        <ShoppingBag size={36} className="text-white/50" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-white text-[22px] font-bold mb-2">لا توجد طلبات بعد</h3>
        <p className="text-white/55 text-[15px]">ابدأ بتصفح المنيو وأضف ما يعجبك للسلة</p>
      </div>
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[15px] px-6 py-2.5 rounded-full transition-all shadow-[0_4px_16px_rgba(244,228,81,0.35)]"
      >
        <ShoppingBag size={16} />
        تصفح المنيو
      </Link>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <Link
      href={`/order-status/${order.id}`}
      className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 bg-white/[.08] hover:bg-white/[.14] border border-white/10 hover:border-white/25 rounded-[18px] px-5 py-4 transition-all duration-200"
    >
      {/* Order ID */}
      <div className="sm:w-[22%] shrink-0">
        <p className="text-white/45 text-[11px] mb-0.5">رقم الطلب</p>
        <p className="text-glace-yellow font-bold text-[15px] tracking-wide">{order.id}</p>
      </div>

      {/* Date + time */}
      <div className="sm:w-[22%] shrink-0">
        <div className="flex items-center gap-1.5 text-white/70 text-[13px] mb-1">
          <Calendar size={12} className="text-white/40" />
          {formatDate(order.createdAt)}
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-[12px]">
          <Clock size={11} className="text-white/30" />
          {formatTime(order.createdAt)}
        </div>
      </div>

      {/* Payment + delivery */}
      <div className="sm:w-[22%] shrink-0">
        <div className="flex items-center gap-1.5 text-white/70 text-[13px] mb-1">
          <CreditCard size={12} className="text-white/40" />
          {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-[12px]">
          <Package size={11} className="text-white/30" />
          {DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod}
        </div>
      </div>

      {/* Status badge */}
      <div className="sm:w-[20%] shrink-0">
        <span className={`inline-block border rounded-full px-3 py-1 text-[12px] font-semibold ${STATUS_STYLES[order.status]}`}>
          {order.status}
        </span>
      </div>

      {/* Total + arrow */}
      <div className="sm:flex-1 flex items-center justify-between sm:justify-end gap-3">
        <p className="text-white font-bold text-[16px]">
          {order.total} <span className="text-white/50 text-[13px] font-normal">₪</span>
        </p>
        <ChevronLeft size={16} className="text-white/30 group-hover:text-glace-yellow group-hover:-translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

export default function MyOrderClientPage() {
  const { orders } = useOrderStore();

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const delivered  = orders.filter((o) => o.status === "تم التسليم").length;
  const pending    = orders.filter((o) => o.status !== "تم التسليم").length;

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      <div className="z-90 relative flex justify-center px-4 py-12 pt-22.5 lg:pt-26.5">
        <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] w-full max-w-[1100px] overflow-hidden mb-12">
          <div className="mx-auto p-5 sm:p-8 w-full text-white">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 mt-2">
              <div>
                <h1 className="text-white text-[36px] sm:text-[44px] font-bold leading-tight">طلباتي</h1>
                <p className="text-white/55 text-[14px] mt-1">سجل طلباتك ومتابعة حالتها</p>
              </div>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[14px] px-5 py-2.5 rounded-full transition-all shadow-[0_4px_14px_rgba(244,228,81,0.3)] self-start sm:self-auto"
              >
                <ArrowLeft size={15} />
                طلب جديد
              </Link>
            </div>

            {/* ── Stat pills ── */}
            {orders.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { label: "إجمالي الطلبات", value: orders.length, suffix: "" },
                  { label: "تم التسليم",     value: delivered,     suffix: "" },
                  { label: "المبلغ الكلي",   value: totalSpent,    suffix: " ₪" },
                ].map(({ label, value, suffix }) => (
                  <div key={label} className="bg-white/[.1] border border-white/15 rounded-[18px] px-4 py-4 text-center">
                    <p className="text-white font-bold text-[22px] sm:text-[28px]">{value}{suffix}</p>
                    <p className="text-white/50 text-[12px] sm:text-[13px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Divider ── */}
            {orders.length > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[2px] bg-glace-yellow rounded-full" />
                <span className="text-white/40 text-[13px]">{orders.length} طلب</span>
                <div className="flex-1 h-px bg-white/10" />
                {pending > 0 && (
                  <span className="text-[12px] text-yellow-200/70">{pending} قيد التنفيذ</span>
                )}
              </div>
            )}

            {/* ── Orders list ── */}
            {orders.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </div>
            )}

            {/* ── Footer note ── */}
            {orders.length > 0 && (
              <p className="text-white/35 text-[12px] text-center mt-8">
                جميع الأسعار بالشيكل الإسرائيلي ₪
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
