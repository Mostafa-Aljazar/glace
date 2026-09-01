"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Package,
  MapPinned,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import {
  ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  type Order,
} from "@/store/orderStore";
import { useOrders } from "@/hooks/orders";
import { getLineItemTotal, useCartStore } from "@/store/cartStore";
import { getStatusSteps } from "@/lib/orderStatusSteps";
import { cn } from "@/lib/utils";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";

type FilterTab = "all" | "active" | "completed" | "cancelled" | "refunded";

const TABS: { key: FilterTab; label: string; subtext?: string }[] = [
  { key: "all", label: "الكل" },
  { key: "active", label: "نشط" },
  { key: "completed", label: "مكتمل", subtext: "تم التوصيل" },
  { key: "cancelled", label: "ملغي", subtext: "المبلغ قيد المراجعة" },
  { key: "refunded", label: "مسترد", subtext: "تم إرسال المبلغ" },
];

function matchesTab(order: Order, tab: FilterTab): boolean {
  switch (tab) {
    case "all":
      return true;
    case "active":
      return (
        order.status === "قيد المراجعة" ||
        order.status === "جاري التحضير" ||
        order.status === "جاهز للاستلام" ||
        order.status === "في الطريق"
      );
    case "completed":
      return order.status === "تم التسليم" || order.status === "تم الاستلام";
    case "cancelled":
      return order.status === "ملغي";
    case "refunded":
      return order.status === "مسترد";
  }
}

/** Best-effort customer name for the order — delivery/pickup orders carry it
 *  on the address, dine-in orders don't collect one. */
function customerName(order: Order): string | undefined {
  return order.address?.name;
}

export default function OrdersPanel() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isError, isLoading, isFetching, refetch } = useOrders({ page });
  const orders = data?.items ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>("all");
  const addItem = useCartStore((s) => s.addItem);

  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  function handleReorder(order: Order) {
    order.items.forEach((item) => {
      addItem({
        productId: item.productId,
        name: item.name,
        image: item.image,
        type: item.type,
        selections: item.selections || [],
        addonTotal: item.addonTotal,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      });
    });
    router.push("/checkout");
  }

  if (isLoading) {
    return (
      <DashboardCard title="طلباتي" icon={ShoppingBag}>
        <div className="flex justify-center py-12">
          <div className="border-4 border-white/25 border-t-glace-yellow rounded-full size-10 animate-spin" />
        </div>
      </DashboardCard>
    );
  }

  if (isError) {
    return (
      <DashboardCard title="طلباتي" icon={ShoppingBag}>
        <EmptyState
          icon={TriangleAlert}
          message="تعذر تحميل الطلبات، الرجاء المحاولة مرة أخرى"
          action={{ label: "إعادة المحاولة", onClick: () => refetch() }}
        />
      </DashboardCard>
    );
  }

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

  const filtered = sorted.filter((o) => matchesTab(o, tab));

  return (
    <DashboardCard title="طلباتي" icon={ShoppingBag}>
      {/* Filter tabs, each with a live count — counts only reflect the
       *  currently loaded page, not every order across all pages */}
      {data && data.totalPages > 1 && (
        <p className="mb-2 text-[12px] text-white/45">
          العدّاد يعرض طلبات هذه الصفحة فقط ({data.page} من {data.totalPages})
        </p>
      )}
      <div className="flex gap-2 mb-5 pb-1 overflow-x-auto no-scrollbar">
        {TABS.map(({ key, label, subtext }) => {
          const count = sorted.filter((o) => matchesTab(o, key)).length;
          const isActive = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              title={subtext}
              className={cn(
                "flex flex-col items-center px-4 py-2 rounded-full text-[14px] whitespace-nowrap transition-colors cursor-pointer shrink-0",
                isActive
                  ? "bg-glace-yellow text-[#1e6a7f] font-bold"
                  : "bg-white/10 text-white/80 hover:bg-white/20",
              )}
            >
              <span className="flex items-center gap-1.5">
                {label}
                <span className={isActive ? "opacity-70" : "opacity-50"}>
                  ({count})
                </span>
              </span>
              {subtext && (
                <span
                  className={cn(
                    "text-[10px]",
                    isActive ? "text-[#1e6a7f]/70" : "text-white/50",
                  )}
                >
                  {subtext}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingBag} message="لا يوجد طلبات في هذا التصنيف" />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const isOpen = expandedId === order.id;
            const name = customerName(order);

            return (
              <div
                key={order.id}
                className="border border-white/20 rounded-[20px] overflow-hidden"
              >
                {/* Row header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : order.id)}
                  className="flex flex-col gap-3 hover:bg-white/10 px-5 py-4 w-full text-white transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center gap-3">
                    <span className="font-bold text-[16px]">#{order.id}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[12px] px-3 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {order.status}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </div>

                  {name && (
                    <>
                      <p className="text-[14px] text-white/70 text-start">
                        الزبون: {name}
                      </p>
                      <div className="border-white/10 border-t" />
                    </>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="font-bold tabular-nums text-[17px] text-glace-yellow">
                      {order.total.toFixed(2)} ₪
                    </span>
                    <span className="text-[13px] text-white/60">
                      {new Date(order.createdAt).toLocaleDateString("ar-PS", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="flex flex-col gap-5 px-5 pt-4 pb-5 border-white/10 border-t">
                    {/* Status stepper — only meaningful for orders still being handled */}
                    {order.status === "ملغي" || order.status === "مسترد" ? (
                      <div
                        className={`rounded-[16px] px-4 py-3 text-[14px] font-medium text-center ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {order.status === "ملغي"
                          ? "تم إلغاء هذا الطلب، والمبلغ قيد المراجعة"
                          : "تم إرسال المبلغ المسترد لهذا الطلب"}
                        {order.status === "ملغي" && order.cancelReason && (
                          <p className="mt-1 font-normal text-[12px]">
                            سبب الإلغاء: {order.cancelReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="relative flex justify-between items-center py-2">
                        <div className="top-[50%] right-[5%] left-[5%] absolute bg-white/20 h-[2px] -translate-y-1/2" />
                        {getStatusSteps(order.deliveryMethod).map((step, idx) => {
                          const Icon = step.icon;
                          const done = idx <= getStatusSteps(order.deliveryMethod).findIndex((s) => s.key === order.status);
                          return (
                            <div
                              key={step.key}
                              className="z-10 relative flex flex-col items-center gap-1 text-center"
                            >
                              <div
                                className={`flex justify-center items-center rounded-full w-9 h-9 ${done ? "bg-glace-yellow text-[#388dab]" : "bg-white/20 text-white/40"}`}
                              >
                                <Icon size={18} />
                              </div>
                              <span
                                className={`text-[11px] sm:text-[13px] ${done ? "text-white font-bold" : "text-white/40"}`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <p className="flex items-center gap-2 mb-3 text-[14px] text-white/70">
                        <Package size={16} /> المنتجات
                      </p>
                      <div className="flex flex-col gap-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 pb-3 border-white/10 border-b text-[14px]"
                          >
                            <div className="relative flex justify-center items-center bg-linear-to-br from-white/20 to-white/5 border border-white/15 rounded-2xl size-11 overflow-hidden shrink-0">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={44}
                                  height={44}
                                  className="p-1 size-full object-contain"
                                />
                              ) : (
                                <Package
                                  size={18}
                                  strokeWidth={1.6}
                                  className="text-glace-yellow"
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="font-bold">{item.name}</span>
                              {item.size && (
                                <span className="mr-2 text-white/60">
                                  ({item.size})
                                </span>
                              )}
                              <span className="mr-2 text-white/60">
                                × {item.quantity}
                              </span>
                            </div>
                            <span className="shrink-0">
                              {getLineItemTotal(item).toFixed(2)} ₪
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-[13px] text-white/60">
                      <span>
                        الدفع:{" "}
                        {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                          order.paymentMethod}
                      </span>
                      <span>
                        الاستلام:{" "}
                        {order.deliveryMethod === "delivery"
                          ? "توصيل"
                          : order.deliveryMethod === "pickup"
                            ? "من المحل"
                            : "تناول الآن"}
                      </span>
                      {order.discount > 0 && (
                        <span className="text-green-300">
                          خصم: -{order.discount} ₪
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/order-status/${order.id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-glace-yellow hover:brightness-105 rounded-[14px] py-2.5 text-[14px] font-bold text-[#1e6a7f] transition"
                      >
                        <MapPinned size={16} />
                        تتبع الطلب
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        className="flex-1 flex items-center justify-center gap-2 bg-glace-yellow/80 hover:bg-glace-yellow border-0 rounded-[14px] py-2.5 text-[14px] font-bold text-[#1e6a7f] transition"
                      >
                        <RotateCcw size={16} />
                        إعادة الطلب
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center gap-3 mt-4 pt-4 border-white/15 border-t">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isFetching}
            className="flex items-center gap-1 disabled:opacity-40 hover:bg-white/10 px-3 py-2 rounded-[12px] text-[13px] text-white transition-colors disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={16} />
            السابق
          </button>
          <span className="text-[13px] text-white/70">
            صفحة {data.page} من {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages || isFetching}
            className="flex items-center gap-1 disabled:opacity-40 hover:bg-white/10 px-3 py-2 rounded-[12px] text-[13px] text-white transition-colors disabled:cursor-not-allowed cursor-pointer"
          >
            التالي
            <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </DashboardCard>
  );
}
