"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  Tag,
  CheckCircle,
  XCircle,
  Banknote,
  Wallet,
  Copy,
  Check,
} from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWalletStore } from "@/store/walletStore";
import {
  useOrderStore,
  RECEIPT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "@/store/orderStore";
import type { PaymentMethod } from "@/store/orderStore";
import { useCheckoutDraftStore } from "@/store/checkoutDraftStore";
import { findMerchantPaymentAccount } from "@/lib/merchantPaymentAccounts";
import ReceiptUploadForm from "@/components/Payment/ReceiptUploadForm";

/** The four bank/wallet methods shown as logo cards, matching the reference
 *  design — the remaining methods (cash, system wallet) stay as a plain list
 *  below since they have no external brand logo. */
const CARD_METHODS: {
  id: PaymentMethod;
  label: string;
  logo: string;
  bg?: string;
}[] = [
  {
    id: "jawwal-manual",
    label: "جوال باي (يدوي)",
    logo: "/images/JAWWAL_PAY.webp",
  },
  { id: "jawwal", label: "جوال باي (آلي)", logo: "/images/JAWWAL_PAY.webp" },
  { id: "paypal", label: "بال باي", logo: "/images/PalPay.jpg" },
  { id: "bop", label: "بنك فلسطين", logo: "/images/BOP.webp" },
  { id: "visa", label: "فيزا", logo: "/images/VISA.webp", bg: "bg-white" },
];

const LIST_METHODS: {
  id: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof Banknote;
}[] = [
  { id: "cash", label: "كاش", desc: "", icon: Banknote },
  {
    id: "wallet",
    label: "محفظتي في النظام",
    desc: "ادفع من رصيد محفظتك",
    icon: Wallet,
  },
];

/** Visa and cash require being physically at the store — not available
 *  when the order is going out for delivery. */
const IN_STORE_ONLY_METHODS: PaymentMethod[] = ["visa", "cash"];

/** Keeps digits and a single decimal point, so a text input can hold a
 *  monetary amount without the native number spinner/locale quirks. */
function sanitizeAmount(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return (
    cleaned.slice(0, firstDot + 1) +
    cleaned.slice(firstDot + 1).replace(/\./g, "")
  );
}

export default function PaymentClientPage() {
  const hasDraft = useCheckoutDraftStore((s) => s.hasDraft);
  const deliveryMethod = useCheckoutDraftStore((s) => s.deliveryMethod);
  const address = useCheckoutDraftStore((s) => s.address);
  const deliveryFee = useCheckoutDraftStore((s) => s.deliveryFee);
  const pickupTime = useCheckoutDraftStore((s) => s.pickupTime);
  const clearDraft = useCheckoutDraftStore((s) => s.clearDraft);

  const router = useRouter();
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!hasDraft && !successOpen) router.replace("/checkout");
  }, [hasDraft, successOpen, router]);

  const inStoreOnlyAvailable = deliveryMethod !== "delivery";
  const user = useAuthStore((s) => s.user);

  const [method, setMethod] = useState<PaymentMethod>("jawwal");
  const [jawwalPhone, setJawwalPhone] = useState(user?.phone ?? "");
  const [jawwalCodeSent, setJawwalCodeSent] = useState(false);
  const [jawwalCode, setJawwalCode] = useState("");
  const [receiptStep, setReceiptStep] = useState<"detail" | "upload">(
    "detail"
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [cashPaid, setCashPaid] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState("");

  useEffect(() => {
    if (!inStoreOnlyAvailable && IN_STORE_ONLY_METHODS.includes(method)) {
      setMethod("jawwal");
    }
  }, [inStoreOnlyAvailable, method]);

  useEffect(() => {
    setReceiptStep("detail");
  }, [method]);

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

  const orderTotal = total() + deliveryFee;
  const cashChange = cashPaid
    ? Math.max(0, parseFloat(cashPaid) - orderTotal)
    : 0;

  function handleApplyCoupon() {
    applyCoupon(couponInput.trim());
  }

  function handleCopy(field: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(
      () => setCopiedField((current) => (current === field ? null : current)),
      2000
    );
  }

  function handleSendJawwalCode() {
    if (!jawwalPhone.trim()) return;
    setJawwalCodeSent(true);
  }

  const cashAmountInvalid =
    method === "cash" && (cashPaid === "" || parseFloat(cashPaid) < orderTotal);
  const jawwalAmountInvalid =
    method === "jawwal" && (!jawwalCodeSent || !jawwalCode.trim());

  function placeConfirmedOrder(
    receiptImage?: string,
    receiptNote?: string
  ) {
    const orderId = placeOrder({
      items,
      subtotal: subtotal(),
      discount,
      total: orderTotal,
      paymentMethod: method,
      deliveryMethod,
      address,
      pickupTime,
      receiptImage,
      receiptNote,
    });
    clearCart();
    clearDraft();
    setPlacedOrderId(orderId);
    setSuccessOpen(true);
  }

  function handleReceiptSubmit(
    receiptImage: string | undefined,
    receiptNote: string | undefined
  ) {
    placeConfirmedOrder(receiptImage, receiptNote);
  }

  function handleConfirm() {
    if (method === "wallet" && walletBalance < orderTotal) return;
    if (cashAmountInvalid || jawwalAmountInvalid) return;

    if (method === "wallet") {
      walletDeduct(orderTotal, "دفع طلب");
    } else if (method === "cash" && cashChange > 0) {
      walletTopUp(cashChange, "باقي كاش", undefined, "cash");
    }

    placeConfirmedOrder();
  }

  const inputClass =
    "bg-white/10 border-white/25 focus-visible:border-glace-yellow/50 h-11 px-3.5 text-white text-[15px] placeholder:text-white/40 rounded-[14px] focus-visible:ring-glace-yellow/20";

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden text-white">
      <EventsBackground />

      <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-28 pb-12 max-w-7xl">
        <div className="bg-white/10 shadow-[0_18px_50px_rgba(10,65,82,0.18)] backdrop-blur-md px-4 sm:px-6 py-4 sm:py-6 border border-white/30 rounded-[32px]">
          <div className="flex justify-between items-center gap-4 mb-4 text-white/95">
            <span className="font-medium text-[18px] sm:text-[22px]">الإجمالي</span>
            <div className="flex-1 bg-white/25 h-px" />
          </div>

          <div className="bg-[#dff7ff]/10 mb-4 p-3 sm:p-4 border border-white/25 rounded-[22px]">
            <div className="flex justify-between items-center gap-3">
              <span className="text-[14px] text-white/80 sm:text-[15px] shrink-0">
                كود الخصم
              </span>

              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                placeholder="ادخل الكود"
                disabled={couponApplied}
                className="flex-1 bg-white/8 disabled:opacity-60 px-3.5 border border-white/25 focus:border-glace-yellow/50 rounded-[14px] outline-none h-11 text-[15px] text-white placeholder:text-white/45 text-right transition"
              />

              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponApplied || !couponInput.trim()}
                className="bg-[#c8f5a8] disabled:opacity-50 shadow-sm hover:brightness-105 px-4 py-2.5 rounded-[12px] font-bold text-[#1d6c7a] text-[14px] transition disabled:cursor-not-allowed shrink-0"
              >
                تطبيق
              </button>
            </div>

            {couponApplied && (
              <p className="flex justify-end items-center gap-1.5 mt-3 text-[13px] text-green-300">
                <CheckCircle size={14} className="shrink-0" />
                تم تطبيق خصم {discount.toFixed(2)} ₪
              </p>
            )}
            {couponInvalid && !couponApplied && (
              <p className="flex justify-end items-center gap-1.5 mt-3 text-[13px] text-red-300">
                <XCircle size={14} className="shrink-0" />
                كود غير صالح
              </p>
            )}
          </div>

          <div className="space-y-3 text-[16px] text-white/90">
            <div className="flex justify-between items-center pb-3 border-white/20 border-b">
              <span className="text-white/80">المجموع الجزئي</span>
              <span>{subtotal().toFixed(2)} ₪</span>
            </div>

            {deliveryFee > 0 && (
              <div className="flex justify-between items-center pb-3 border-white/20 border-b">
                <span className="text-white/80">رسوم التوصيل</span>
                <span>{deliveryFee.toFixed(2)} ₪</span>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between items-center pb-3 border-white/20 border-b text-green-300">
                <span>خصم</span>
                <span>- {discount.toFixed(2)} ₪</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-white/25 border-t">
            <span className="font-medium text-[18px] text-white/90 sm:text-[22px]">
              الإجمالي
            </span>
            <button
              type="button"
              onClick={() => handleCopy("total", orderTotal.toFixed(2))}
              aria-label="نسخ الإجمالي"
              title="نسخ الإجمالي"
              className="group flex items-center gap-2 hover:bg-white/6 px-2 py-1 rounded-[12px] font-bold text-[#f7d769] text-[30px] transition"
            >
              {copiedField === "total" ? (
                <Check size={18} className="text-green-300 shrink-0" />
              ) : (
                <Copy
                  size={18}
                  className="text-white/55 group-hover:text-white/80 transition"
                />
              )}
              <span>{orderTotal.toFixed(2)} ₪</span>
            </button>
          </div>

          <div className="bg-white/10 mt-6 px-4 sm:px-5 py-4 border border-white/25 rounded-[26px] text-white">
            <div className="flex justify-between items-center gap-3 mb-4">
              <span className="font-bold text-[20px]">اختر طريقة الدفع</span>
              <div className="flex-1 bg-white/20 h-px" />
            </div>

            <div className="gap-3 grid grid-cols-2 mb-6">
              {CARD_METHODS.map((m) => {
                const disabled =
                  IN_STORE_ONLY_METHODS.includes(m.id) && !inStoreOnlyAvailable;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => !disabled && setMethod(m.id)}
                    disabled={disabled}
                    aria-pressed={method === m.id}
                    className={`flex items-center gap-3 rounded-[18px] border p-3 text-start transition ${
                      disabled
                        ? "cursor-not-allowed border-white/15 opacity-40"
                        : method === m.id
                          ? "cursor-pointer border-white/70 bg-white/16"
                          : "cursor-pointer border-white/30 bg-white/5 hover:border-white/60"
                    }`}
                  >
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] ${m.bg ? `${m.bg} p-1.5` : ""}`}
                    >
                      <Image
                        src={m.logo}
                        alt={m.label}
                        width={44}
                        height={44}
                        className="w-full h-full object-contain"
                      />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-[14px] truncate">
                        {m.label}
                      </span>
                      {IN_STORE_ONLY_METHODS.includes(m.id) && (
                        <span className="block mt-0.5 text-[11px] text-white/70">
                          الدفع داخل المحل
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {LIST_METHODS.map((m) => {
                const Icon = m.icon;
                const disabled =
                  IN_STORE_ONLY_METHODS.includes(m.id) && !inStoreOnlyAvailable;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => !disabled && setMethod(m.id)}
                    disabled={disabled}
                    aria-pressed={method === m.id}
                    className={`flex items-center gap-3 rounded-[18px] border p-3 text-start transition ${
                      disabled
                        ? "cursor-not-allowed border-white/15 opacity-40"
                        : method === m.id
                          ? "cursor-pointer border-white/70 bg-white/16"
                          : "cursor-pointer border-white/30 bg-white/5 hover:border-white/60"
                    }`}
                  >
                    <span className="flex justify-center items-center bg-white/12 rounded-[12px] size-11 shrink-0">
                      <Icon size={20} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-[14px] truncate">
                        {m.label}
                      </span>
                      {m.desc && (
                        <span className="block mt-0.5 text-[11px] text-white/70">
                          {m.desc}
                        </span>
                      )}
                      {IN_STORE_ONLY_METHODS.includes(m.id) && (
                        <span className="block mt-0.5 text-[11px] text-white/70">
                          الدفع داخل المحل
                        </span>
                      )}
                      {m.id === "wallet" && (
                        <span className="block mt-0.5 text-[11px] text-glace-yellow">
                          رصيدك: {walletBalance.toFixed(2)} ₪
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white/10 mb-6 p-4 sm:p-5 border border-white/25 rounded-[26px] text-start">
              <p className="mb-4 text-[13px] text-white/60">
                بإتمام الطلب أنت توافق على{" "}
                <Link
                  href="/my-account/terms"
                  className="font-bold text-white hover:text-glace-yellow underline transition-colors"
                >
                  الشروط والأحكام
                </Link>
              </p>

              <div className="flex justify-between items-end gap-3">
                <span className="font-bold text-[17px] text-white">
                  الإجمالي{" "}
                  <span className="font-normal text-[13px] text-white/55">
                    (شامل الرسوم والضريبة)
                  </span>
                </span>
                <div className="text-end">
                  <div className="font-bold text-[28px] text-glace-yellow leading-none">
                    {orderTotal.toFixed(2)} ₪
                  </div>
                  {discount > 0 && (
                    <div className="mt-1 text-[14px] text-white/45 line-through">
                      {(subtotal() + deliveryFee).toFixed(2)} ₪
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Method-specific inputs */}
          {method === "jawwal" && (
            <div className="flex flex-col gap-3 bg-white/10 mb-6 p-4 border border-white/25 rounded-[20px]">
              <div>
                <label className="block mb-2 text-[14px] text-white/80">
                  رقم جوال باي
                </label>
                <Input
                  value={jawwalPhone}
                  onChange={(e) => {
                    setJawwalPhone(e.target.value);
                    setJawwalCodeSent(false);
                    setJawwalCode("");
                  }}
                  placeholder="05XXXXXXXX"
                  className={inputClass}
                />
              </div>
              <p className="text-[13px] text-white/70">
                سيتم خصم{" "}
                <span className="font-bold text-glace-yellow">
                  {orderTotal.toFixed(2)} ₪
                </span>{" "}
                من رصيدك — المبلغ مذكور في رسالة رمز التأكيد
              </p>

              {!jawwalCodeSent ? (
                <button
                  type="button"
                  onClick={handleSendJawwalCode}
                  disabled={!jawwalPhone.trim()}
                  className="bg-white/12 hover:bg-white/18 disabled:opacity-50 py-2.5 border border-white/25 rounded-[14px] font-bold text-white text-[14px] transition cursor-pointer disabled:cursor-not-allowed"
                >
                  إرسال رمز التأكيد
                </button>
              ) : (
                <>
                  <p className="text-[13px] text-glace-yellow">
                    تم إرسال رمز التأكيد إلى {jawwalPhone}
                  </p>
                  <div>
                    <label className="block mb-2 text-[14px] text-white/80">
                      رمز التأكيد
                    </label>
                    <Input
                      value={jawwalCode}
                      onChange={(e) => setJawwalCode(e.target.value)}
                      type="text"
                      inputMode="numeric"
                      placeholder="أدخل الرمز المرسل"
                      className={inputClass}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {RECEIPT_METHODS.includes(method) &&
            (() => {
              const account = findMerchantPaymentAccount(method);
              if (!account) return null;

              if (receiptStep === "upload") {
                return (
                  <div className="bg-white/10 mb-6 p-4 border border-white/25 rounded-[20px]">
                    <p className="mb-3 text-[14px] text-white/80">
                      ارفع صورة وصل التحويل
                    </p>
                    <ReceiptUploadForm
                      onSubmit={handleReceiptSubmit}
                      submitLabel="تأكيد الدفع"
                    />
                    <button
                      type="button"
                      onClick={() => setReceiptStep("detail")}
                      className="mt-3 text-[13px] text-white/60 hover:text-white/80 underline cursor-pointer"
                    >
                      رجوع لبيانات التحويل
                    </button>
                  </div>
                );
              }

              return (
                <div className="bg-white/10 mb-6 p-4 border border-white/25 rounded-[20px]">
                  <div className="flex flex-col items-center gap-3 mb-4">
                    <div className="bg-white p-2 rounded-[14px]">
                      <Image
                        src={account.qrImage}
                        alt={`رمز QR - ${PAYMENT_METHOD_LABELS[method]}`}
                        width={160}
                        height={160}
                      />
                    </div>
                    <a
                      href={account.qrImage}
                      download
                      className="text-[13px] text-glace-yellow hover:underline"
                    >
                      حفظ صورة QR
                    </a>
                    <p className="text-[13px] text-white/70 text-center">
                      افتح تطبيق بنكك أو محفظتك وامسح الرمز — يعمل مع جميع
                      البنوك والمحافظ
                    </p>
                  </div>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 border-white/20 border-t" />
                    <span className="text-[12px] text-white/60">
                      أو — التحويل إلى الحساب مباشرة
                    </span>
                    <div className="flex-1 border-white/20 border-t" />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {account.bankName && (
                      <div className="flex justify-between items-center text-[14px]">
                        <span className="text-white/70">البنك</span>
                        <span className="font-bold">{account.bankName}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-white/70">اسم الحساب</span>
                      <span className="font-bold">{account.holderName}</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-white/70">
                        {account.primaryLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" dir="ltr">
                          {account.primaryValue}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy("primary", account.primaryValue)
                          }
                          aria-label="نسخ"
                          className="flex justify-center items-center hover:bg-white/10 rounded-full size-7 text-white/70 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedField === "primary" ? (
                            <Check size={14} className="text-green-300" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                    {account.secondaryLabel && account.secondaryValue && (
                      <div className="flex justify-between items-center text-[14px]">
                        <span className="text-white/70">
                          {account.secondaryLabel}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" dir="ltr">
                            {account.secondaryValue}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy("secondary", account.secondaryValue!)
                            }
                            aria-label="نسخ"
                            className="flex justify-center items-center hover:bg-white/10 rounded-full size-7 text-white/70 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedField === "secondary" ? (
                              <Check size={14} className="text-green-300" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setReceiptStep("upload")}
                    className="bg-glace-yellow hover:brightness-105 mt-5 py-3 rounded-[20px] w-full font-bold text-[#1e6a7f] text-[16px] transition cursor-pointer"
                  >
                    ارفع الوصل للمتابعة
                  </button>
                </div>
              );
            })()}

          {method === "visa" && (
            <p className="bg-white/10 mb-6 px-4 py-3 border border-white/25 rounded-[20px] text-[14px] text-white/80">
              الدفع بالفيزا يتم على ماكينة الدفع داخل المحل
            </p>
          )}

          {method === "cash" && (
            <div className="bg-white/10 mb-6 p-4 border border-white/25 rounded-[20px]">
              <label className="block mb-2 text-[14px] text-white/80">
                المبلغ المدفوع
              </label>
              <Input
                value={cashPaid}
                onChange={(e) => setCashPaid(sanitizeAmount(e.target.value))}
                type="text"
                inputMode="decimal"
                placeholder="أدخل المبلغ"
                className={inputClass}
              />
              {cashPaid !== "" && parseFloat(cashPaid) < orderTotal && (
                <p className="mt-1.5 text-[13px] text-red-300">
                  المبلغ يجب أن يكون مساوياً للمطلوب ({orderTotal.toFixed(2)} ₪)
                  أو أكثر
                </p>
              )}
              {cashChange > 0 && (
                <p className="mt-2 text-[14px] text-glace-yellow">
                  المتبقي: {cashChange.toFixed(2)} ₪ — سيتم مراجعة طلبك وإضافة
                  الباقي لمحفظة النظام
                </p>
              )}
            </div>
          )}

          {method === "wallet" && walletBalance < orderTotal && (
            <div className="flex flex-col gap-3 bg-white/10 mb-6 p-4 border border-white/25 rounded-[20px]">
              <p className="font-bold text-[15px] text-red-300">
                رصيد المحفظة غير كافٍ
              </p>
              <div className="flex justify-between text-[14px]">
                <span className="text-white/70">رصيدك الحالي</span>
                <span className="font-bold text-white">
                  {walletBalance.toFixed(2)} ₪
                </span>
              </div>
              <div className="flex justify-between pt-2 border-white/15 border-t text-[14px]">
                <span className="text-white/70">المبلغ المطلوب</span>
                <span className="font-bold text-glace-yellow">
                  {orderTotal.toFixed(2)} ₪
                </span>
              </div>
              <Button
                asChild
                className="bg-glace-yellow hover:bg-glace-yellow hover:brightness-105 py-2.5 rounded-[14px] w-full h-auto font-bold text-[#1e6a7f] text-[14px]"
              >
                <Link href="/my-account/wallet">شحن المحفظة</Link>
              </Button>
            </div>
          )}

          {!RECEIPT_METHODS.includes(method) && (
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={
                (method === "wallet" && walletBalance < orderTotal) ||
                cashAmountInvalid ||
                jawwalAmountInvalid
              }
              className="bg-glace-yellow hover:brightness-105 disabled:opacity-50 py-3.5 border-0 rounded-[30px] w-full h-auto font-bold text-[#1e6a7f] text-[18px] cursor-pointer disabled:cursor-not-allowed"
            >
              تأكيد الدفع
            </Button>
          )}
        </div>
      </div>

      {/* Success dialog — closing it any way (backdrop, Escape) still sends
       *  the customer to order tracking rather than stranding them here. */}
      <Dialog
        open={successOpen}
        onOpenChange={(open) => {
          setSuccessOpen(open);
          if (!open && placedOrderId) {
            router.push(`/order-status/${placedOrderId}`);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] ring-0 text-white text-center"
        >
          <DialogHeader className="items-center gap-3">
            <div className="flex justify-center items-center bg-glace-yellow rounded-full size-16">
              <CheckCircle2
                className="size-9 text-[#388dab]"
                strokeWidth={2.5}
              />
            </div>
            <DialogTitle className="text-white text-2xl">
              تم تأكيد طلبك بنجاح!
            </DialogTitle>
            <DialogDescription className="text-white/90 text-base">
              رقم طلبك هو:{" "}
              <span className="font-bold text-glace-yellow">
                {placedOrderId}
              </span>
            </DialogDescription>
          </DialogHeader>
          <Button
            asChild
            className="bg-[#4397ae] hover:bg-[#4397ae]/90 mt-4 px-6 py-2.5 rounded-[30px] w-full h-auto text-white text-lg"
          >
            <Link href={`/order-status/${placedOrderId}`}>تتبع الطلب</Link>
          </Button>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
