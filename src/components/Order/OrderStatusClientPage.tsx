"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Package,
  Send,
  Receipt,
  CreditCard,
  Truck,
  MapPin,
  StickyNote,
  UtensilsCrossed,
  ClipboardList,
  XCircle,
  MessageCircle,
  Phone,
  User,
  Clock,
} from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useOrderStore,
  ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  RECEIPT_METHODS,
  isOrderFinal,
  type OrderStatus,
} from "@/store/orderStore";
import { getLineItemTotal, useCartStore } from "@/store/cartStore";
import { getStatusSteps } from "@/lib/orderStatusSteps";
import ReceiptUploadForm from "@/components/Payment/ReceiptUploadForm";

const CANCEL_REASONS = [
  "غيرت رأيي",
  "الوقت أطول من المتوقع",
  "طلبت بالخطأ",
  "سبب آخر",
];

export default function OrderStatusClientPage({ id }: { id: string }) {
  const router = useRouter();
  const getOrder = useOrderStore((s) => s.getOrder);
  const updateReceipt = useOrderStore((s) => s.updateReceipt);
  const cancelOrder = useOrderStore((s) => s.cancelOrder);
  const order = getOrder(id);
  const addItem = useCartStore((s) => s.addItem);

  const [reuploadOpen, setReuploadOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  if (!order) {
    return (
      <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
        <EventsBackground />
        <div className="z-90 relative flex flex-col justify-center items-center gap-8 mx-auto px-4 py-20 max-w-300 min-h-screen text-white text-center">
          <div className="flex flex-col gap-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-glace-yellow/20 to-transparent blur-3xl rounded-full w-32 h-32" />
                <Package size={80} className="relative text-glace-yellow/60" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-[32px] font-bold">الطلب غير موجود</h2>
              <p className="text-[15px] text-white/70 max-w-sm mx-auto">
                للأسف، لم نتمكن من العثور على الطلب الذي تبحث عنه. يرجى التحقق من رقم الطلب أو العودة للمنيو.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-center">
              <Button
                asChild
                className="flex items-center justify-center gap-2 bg-glace-yellow hover:bg-yellow-400 px-8 py-3.5 border-0 rounded-[20px] font-bold text-[#1e6a7f] text-[16px] transition-colors"
              >
                <Link href="/menu">
                  <UtensilsCrossed size={18} />
                  العودة للمنيو
                </Link>
              </Button>
              <Button
                asChild
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/18 px-8 py-3.5 border border-white/30 rounded-[20px] font-bold text-white text-[16px] transition-colors"
              >
                <Link href="/my-account/orders">
                  <ClipboardList size={18} />
                  طلباتي
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getStatusSteps(order.deliveryMethod).findIndex((s: { key: OrderStatus }) => s.key === order.status);

  function handleReuploadSubmit(
    receiptImage: string | undefined,
    receiptNote: string | undefined
  ) {
    updateReceipt(order!.id, receiptImage, receiptNote);
    setReuploadOpen(false);
  }

  function handleCancelConfirm() {
    if (!selectedReason) return;
    cancelOrder(order!.id, selectedReason);
    setCancelOpen(false);
  }

  function handleSendEmailSummary() {
    if (!emailInput.trim()) return;
    setEmailSent(true);
  }

  function handleReorder() {
    if (!order) return;
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

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-28 lg:pb-20 max-w-300">
        <h1 className="mb-2 text-[40px] text-white sm:text-[50px] text-center">
          تتبع الطلب
        </h1>
        <p className="mb-6 text-[18px] text-white/80 text-center">
          رقم الطلب:{" "}
          <span className="font-bold text-glace-yellow">{order.id}</span>
        </p>

        {/* Status stepper / gate-state banners */}
        {order.status === "ملغي" || order.status === "مسترد" ? (
          <div
            className={`mb-6 rounded-[30px] px-6 py-5 text-[16px] font-bold text-center ${ORDER_STATUS_COLORS[order.status]}`}
          >
            <p>
              {order.status === "ملغي"
                ? "تم إلغاء هذا الطلب"
                : "تم استرداد المبلغ لهذا الطلب"}
            </p>
            {order.status === "ملغي" && order.cancelReason && (
              <p className="mt-1.5 font-normal text-[14px]">
                سبب الإلغاء: {order.cancelReason}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white/[.17] backdrop-blur-[15px] mb-6 p-6 rounded-[30px]">
            <div className="relative flex justify-between items-center">
              <div className="top-[22px] left-[10%] absolute bg-white/20 w-[80%] h-[2px]" />
              {getStatusSteps(order.deliveryMethod).map((step, idx) => {
                const Icon = step.icon;
                const done = idx <= getStatusSteps(order.deliveryMethod).findIndex((s) => s.key === order.status);
                return (
                  <div
                    key={step.key}
                    className="z-10 relative flex flex-col items-center gap-2 text-center"
                  >
                    <div
                      className={`flex justify-center items-center rounded-full w-11 h-11 transition-colors ${
                        done
                          ? "bg-glace-yellow text-[#388dab]"
                          : "bg-white/20 text-white/50"
                      }`}
                    >
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    <span
                      className={`text-[13px] sm:text-[15px] ${done ? "text-white font-bold" : "text-white/50"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status-specific messages */}
        {order.status === "جاري التحضير" && (
          <div className="mb-6 bg-blue-500/20 border border-blue-500/40 rounded-[20px] px-4 py-3 text-[14px] text-blue-100">
            <p className="flex items-center gap-2">
              <Clock size={16} />
              يستغرق تحضير الطلب من {order.preparationTime || 5}-{order.preparationTime || 30} دقيقة
            </p>
          </div>
        )}

        {order.status === "في الطريق" && order.driver && (
          <div className="mb-6 bg-purple-500/20 border border-purple-500/40 rounded-[20px] p-4 text-white">
            <p className="font-bold text-[15px] mb-3">السائق في الطريق</p>
            <div className="flex flex-col gap-2 text-[14px]">
              <div className="flex items-center gap-2">
                <User size={16} className="text-purple-300" />
                <span>{order.driver.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-purple-300" />
                <a href={`tel:${order.driver.phone}`} className="text-purple-200 hover:text-purple-100">
                  {order.driver.phone}
                </a>
              </div>
              {order.driver.company && (
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-purple-300" />
                  <span>{order.driver.company}</span>
                </div>
              )}
              {order.driverAssignedAt && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-white/20 border-t text-[13px]">
                  <Clock size={14} className="text-purple-300" />
                  <span>
                    تم تسليم الطلب: {new Date(order.driverAssignedAt).toLocaleTimeString("ar-PS", { timeStyle: "short" })}
                  </span>
                </div>
              )}
              {order.estimatedDeliveryTime && (
                <div className="flex items-center gap-2 text-[13px]">
                  <Clock size={14} className="text-purple-300" />
                  <span>
                    الوصول المتوقع: {order.estimatedDeliveryTime}-{order.estimatedDeliveryTime || 25} دقيقة
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Optional email summary */}
        <div className="bg-white/[.17] backdrop-blur-[15px] mb-6 p-5 rounded-[24px] text-white">
          <p className="flex items-center gap-2 mb-3 text-[15px] text-white/80">
            <Mail size={16} className="text-glace-yellow" />
            يوصلك ملخص الطلب على إيميلك؟{" "}
            <span className="text-[12px] opacity-60">(اختياري)</span>
          </p>
          {emailSent ? (
            <p className="text-[14px] text-green-300">
              تم الإرسال إلى {emailInput}
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="flex-1 bg-white/10 border border-white/25 focus:border-glace-yellow/50 rounded-[14px] px-3.5 py-2.5 text-white text-[15px] placeholder:text-white/40 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleSendEmailSummary}
                disabled={!emailInput.trim()}
                className="flex items-center gap-1.5 bg-glace-yellow hover:brightness-105 disabled:opacity-40 px-4 py-2.5 rounded-[14px] font-bold text-[#1e6a7f] text-[14px] transition disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Send size={14} />
                إرسال
              </button>
            </div>
          )}
        </div>

        <div className="flex lg:flex-row flex-col gap-6 lg:gap-6">
          {/* Items */}
          <div className="lg:flex-3 flex flex-col bg-white/[.17] backdrop-blur-[15px] p-6 rounded-[30px] text-white">
            <h2 className="flex items-center gap-2 mb-4 text-[22px]">
              <Package size={22} /> المنتجات
            </h2>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 pb-3 border-white/20 border-b"
                >
                  <div className="relative flex justify-center items-center bg-linear-to-br from-white/20 to-white/5 border border-white/15 rounded-2xl size-14 overflow-hidden shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="p-1 size-full object-contain"
                      />
                    ) : (
                      <Package
                        size={22}
                        strokeWidth={1.6}
                        className="text-glace-yellow"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[17px]">{item.name}</p>
                    {item.size && (
                      <p className="opacity-70 text-[14px]">
                        الحجم: {item.size}
                      </p>
                    )}
                    {item.type && (
                      <p className="opacity-70 text-[14px]">
                        النوع: {item.type}
                      </p>
                    )}
                    <p className="opacity-70 text-[14px]">
                      الكمية: {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold text-[17px] shrink-0">
                    {getLineItemTotal(item).toFixed(2)} ₪
                  </p>
                </div>
              ))}
            </div>

            {/* Buttons under items on lg */}
            <div className="hidden lg:flex gap-3 mt-4">
              <Button
                asChild
                className="flex-1 flex items-center justify-center gap-2 bg-glace-yellow hover:bg-yellow-400 px-6 py-3 border-0 rounded-[20px] h-auto font-bold text-[#1e6a7f] text-[16px] transition-colors"
              >
                <Link href="/menu">
                  <UtensilsCrossed size={18} />
                  العودة للمنيو
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/18 px-6 py-3 border-white/30 rounded-[20px] h-auto text-[15px] text-white transition-colors"
              >
                <Link href="/my-account/orders">
                  <ClipboardList size={17} />
                  طلباتي
                </Link>
              </Button>
              <a
                href="https://wa.me/970XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 border-0 rounded-[20px] font-bold text-[15px] text-white transition-colors"
              >
                <MessageCircle size={17} />
                تواصل معنا
              </a>
            </div>
          </div>

          {/* Order details */}
          <div className="lg:flex-2 flex flex-col bg-white/[.17] backdrop-blur-[15px] p-6 rounded-[30px] w-full text-white">
            <h2 className="flex items-center gap-2 mb-4 text-[22px]">
              <Receipt size={22} /> تفاصيل الطلب
            </h2>

            {/* Date and time */}
            <div className="mb-4 text-[13px] text-white/70 space-y-1">
              <p>
                التاريخ: {new Date(order.createdAt).toLocaleDateString("ar-PS", { dateStyle: "long" })}
              </p>
              <p>
                الوقت: {new Date(order.createdAt).toLocaleTimeString("ar-PS", { timeStyle: "short" })}
              </p>
            </div>

            <div className="flex flex-col gap-2 bg-white/10 p-4 rounded-[20px] text-[15px]">
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
              <div className="flex justify-between items-center pt-2 border-white/25 border-t">
                <span className="font-bold text-[17px]">الإجمالي</span>
                <span className="font-bold text-[22px] text-glace-yellow">
                  {order.total.toFixed(2)} ₪
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4 text-[14px]">
              <div className="flex items-start gap-2.5">
                <CreditCard size={16} className="opacity-60 shrink-0 mt-0.5" />
                <span className="opacity-80">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                    order.paymentMethod}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck size={16} className="opacity-60 shrink-0 mt-0.5" />
                <span className="opacity-80">
                  {order.deliveryMethod === "delivery"
                    ? "توصيل"
                    : order.deliveryMethod === "pickup"
                      ? "من المحل"
                      : "تناول الآن"}
                  {order.deliveryMethod !== "dine-in" && order.pickupTime
                    ? ` · ${order.pickupTime}`
                    : ""}
                </span>
              </div>
              {order.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="opacity-60 shrink-0 mt-0.5" />
                  <span className="opacity-80">
                    {order.address.city}، {order.address.area}،{" "}
                    {order.address.street}
                  </span>
                </div>
              )}
              {order.address?.note && (
                <div className="flex items-start gap-2.5">
                  <StickyNote size={16} className="opacity-60 shrink-0 mt-0.5" />
                  <span className="opacity-80">{order.address.note}</span>
                </div>
              )}
            </div>

            {RECEIPT_METHODS.includes(order.paymentMethod) &&
              !isOrderFinal(order.status) && (
                <button
                  type="button"
                  onClick={() => setReuploadOpen(true)}
                  className="mt-4 pt-3 border-white/20 border-t text-[13px] text-glace-yellow hover:underline text-start cursor-pointer"
                >
                  تعديل صورة إشعار الدفع
                </button>
              )}

            {/* Reorder button if cancelled */}
            {order.status === "ملغي" && (
              <Button
                onClick={handleReorder}
                className="w-full mt-4 bg-glace-yellow hover:bg-yellow-400 py-2.5 rounded-[16px] font-bold text-[15px] text-[#1e6a7f] transition-colors"
              >
                إعادة الطلب
              </Button>
            )}

            {/* Cancel button under details on lg */}
            {(order.status === "قيد المراجعة" || order.status === "جاري التحضير") && (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="hidden lg:flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 mt-4 py-3 rounded-[20px] font-bold text-[15px] text-white transition-colors cursor-pointer w-full"
              >
                <XCircle size={16} />
                إلغاء الطلب
              </button>
            )}
          </div>
        </div>

        {/* Mobile buttons - below the 2-col layout */}
        <div className="lg:hidden flex flex-col gap-3 mt-6">
          <div className="flex gap-3">
            <Button
              asChild
              className="flex-1 flex items-center justify-center gap-2 bg-glace-yellow hover:bg-yellow-400 px-6 py-3.5 border-0 rounded-[20px] h-auto font-bold text-[#1e6a7f] text-[16px] transition-colors"
            >
              <Link href="/menu">
                <UtensilsCrossed size={18} />
                العودة للمنيو
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/18 px-6 py-3.5 border-white/30 rounded-[20px] h-auto text-[15px] text-white transition-colors"
            >
              <Link href="/my-account/orders">
                <ClipboardList size={17} />
                طلباتي
              </Link>
            </Button>
          </div>

          <a
            href="https://wa.me/970XXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center gap-2 bg-green-500/20 hover:bg-green-500/30 py-3.5 px-6 border border-green-500/40 rounded-[20px] font-bold text-[15px] text-green-300 transition-colors cursor-pointer w-full"
          >
            <MessageCircle size={17} />
            تواصل معنا
          </a>

          {(order.status === "قيد المراجعة" || order.status === "جاري التحضير") && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 py-3.5 rounded-[20px] font-bold text-[15px] text-white transition-colors cursor-pointer w-full"
            >
              <XCircle size={16} />
              إلغاء الطلب
            </button>
          )}
        </div>
      </div>

      {/* Re-upload receipt dialog */}
      <Dialog open={reuploadOpen} onOpenChange={setReuploadOpen}>
        <DialogContent className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 border-0 rounded-[30px] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">تعديل صورة إشعار الدفع</DialogTitle>
            <DialogDescription className="text-white/80">
              يمكنك تحديث صورة إشعار الدفع أو الملاحظة المرفقة بطلبك.
            </DialogDescription>
          </DialogHeader>
          <ReceiptUploadForm
            initialImage={order.receiptImage}
            initialNote={order.receiptNote}
            onSubmit={handleReuploadSubmit}
            submitLabel="حفظ"
          />
        </DialogContent>
      </Dialog>

      {/* Cancel order dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 border-0 rounded-[30px] text-white" showCloseButton={false}>
          <button
            type="button"
            onClick={() => setCancelOpen(false)}
            className="absolute top-4 left-4 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 text-white transition-colors cursor-pointer"
          >
            <XCircle size={20} />
          </button>
          <DialogHeader>
            <DialogTitle className="text-white">إلغاء الطلب؟</DialogTitle>
            <DialogDescription className="text-white/80">
              اختر سبب الإلغاء. المبلغ المدفوع سيتم إضافته لمحفظة النظام.
            </DialogDescription>
          </DialogHeader>

          {/* Refund info box */}
          <div className="bg-green-500/15 border border-green-500/40 rounded-[14px] px-4 py-3 text-[13px] text-green-100 mb-2">
            <p className="flex items-center gap-2">
              ✓ المبلغ المدفوع: <span className="font-bold text-green-300">{order.total.toFixed(2)} ₪</span>
            </p>
            <p className="text-[12px] text-green-100/80 mt-1">سيتم استرجاع المبلغ تلقائياً لمحفظتك</p>
          </div>

          <div className="gap-2.5 grid grid-cols-2 my-2">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelectedReason(reason)}
                className={`rounded-[14px] px-3 py-2.5 text-[14px] font-bold transition-colors cursor-pointer ${
                  selectedReason === reason
                    ? "bg-glace-yellow text-[#1e6a7f]"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-2">
            <DialogClose className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-[16px] font-bold text-[15px] text-white transition cursor-pointer">
              تراجع
            </DialogClose>
            <button
              type="button"
              onClick={handleCancelConfirm}
              disabled={!selectedReason}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 py-2.5 rounded-[16px] font-bold text-[15px] text-white transition disabled:cursor-not-allowed cursor-pointer"
            >
              تأكيد الإلغاء
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
