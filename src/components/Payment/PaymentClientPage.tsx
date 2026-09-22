"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
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
import { getApiErrorMessage } from "@/lib/apiWithFallback";
import { formatScheduledDateTime } from "@/lib/scheduling";
import {
  RECEIPT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "@/store/orderStore";
import type { PaymentMethod } from "@/store/orderStore";
import { cashIcon, visaCard } from "@/assets/images";
import { useCheckoutDraftStore } from "@/store/checkoutDraftStore";
import { usePaymentAccounts } from "@/hooks/payments/usePaymentAccounts";
import type { TransferPaymentAccount } from "@/lib/merchantPaymentAccounts";
import { useApplyCoupon } from "@/hooks/cart/useApplyCoupon";
import { usePlaceOrder, useSendJawwalOrderCode } from "@/hooks/orders";
import { useWallet, useDeductWallet } from "@/hooks/wallet";
import ReceiptUploadForm from "@/components/Payment/ReceiptUploadForm";

/** Bank/wallet methods shown as logo cards, matching the reference design —
 *  the remaining methods (cash, system wallet) stay as a plain list below
 *  since they have no external brand logo. Display order across both lists:
 *  محفظتي، جوال باي (يدوي/آلي)، بال باي، بنك فلسطين، كاش، فيزا. */
const CARD_METHODS_BEFORE_CASH: {
  id: PaymentMethod;
  label: string;
  logo?: string;
  asset?: typeof cashIcon;
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
];

const CARD_METHODS_AFTER_CASH: typeof CARD_METHODS_BEFORE_CASH = [
  { id: "visa", label: "فيزا", asset: visaCard, bg: "bg-white" },
];

const WALLET_METHOD: {
  id: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof Banknote;
} = {
  id: "wallet",
  label: "محفظتي في النظام",
  desc: "ادفع من رصيد محفظتك",
  icon: Wallet,
};

const CASH_METHOD: {
  id: PaymentMethod;
  label: string;
  asset: typeof cashIcon;
  bg?: string;
} = {
  id: "cash",
  label: "كاش",
  asset: cashIcon,
  bg: "bg-white/10",
};

/** Visa and cash require being physically at the store — not available
 *  when the order is going out for delivery. */
const IN_STORE_ONLY_METHODS: PaymentMethod[] = ["visa", "cash"];

export default function PaymentClientPage() {
  const hasDraft = useCheckoutDraftStore((s) => s.hasDraft);
  const deliveryMethod = useCheckoutDraftStore((s) => s.deliveryMethod);
  const address = useCheckoutDraftStore((s) => s.address);
  const addressId = useCheckoutDraftStore((s) => s.addressId);
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
  const [jawwalError, setJawwalError] = useState<string | null>(null);
  const sendJawwalOrderCodeMutation = useSendJawwalOrderCode();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState("");
  /** True once the wallet deduction for this order has succeeded — guards
   *  against re-deducting if the follow-up `POST /orders` then fails, since
   *  the balance is already gone and retrying `handleConfirm` would deduct
   *  again with no order to show for it. */
  const [walletDeducted, setWalletDeducted] = useState(false);

  useEffect(() => {
    if (!inStoreOnlyAvailable && IN_STORE_ONLY_METHODS.includes(method)) {
      setMethod("jawwal");
    }
  }, [inStoreOnlyAvailable, method]);


  // Scroll the method-specific detail (cash input, receipt upload, etc.)
  // into view whenever the customer picks a payment method — it renders
  // below the fold and is easy to miss otherwise. Skips the initial mount
  // so the page doesn't jump on first load.
  const methodDetailsRef = useRef<HTMLDivElement>(null);
  const isFirstMethodRender = useRef(true);
  useEffect(() => {
    if (isFirstMethodRender.current) {
      isFirstMethodRender.current = false;
      return;
    }
    methodDetailsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [method]);

  const items = useCartStore((s) => s.items);
  const orderNote = useCartStore((s) => s.orderNote);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = useCartStore((s) => s.total);
  const discount = useCartStore((s) => s.discount);
  const coupon = useCartStore((s) => s.coupon);
  const applyCouponMutation = useApplyCoupon();
  const clearCart = useCartStore((s) => s.clearCart);
  const { data: walletData } = useWallet();
  const walletBalance = walletData?.balance ?? 0;
  const deductWalletMutation = useDeductWallet();
  const placeOrderMutation = usePlaceOrder();
  const { data: paymentAccounts } = usePaymentAccounts();
  const [orderError, setOrderError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState(coupon);
  const [couponInvalid, setCouponInvalid] = useState(false);
  const couponApplied = discount > 0;

  const orderTotal = total() + deliveryFee;

  function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponInvalid(false);
    applyCouponMutation.mutate(
      { code, subtotal: subtotal() },
      {
        onSuccess: (result) => {
          if (!result.valid) {
            setCouponInput("");
            setCouponInvalid(true);
          }
        },
      },
    );
  }

  function handleRemoveCoupon() {
    useCartStore.getState().setCoupon("", 0);
    setCouponInput("");
    setCouponInvalid(false);
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
    setJawwalError(null);
    sendJawwalOrderCodeMutation.mutate(
      { phone: jawwalPhone.trim(), amount: orderTotal },
      {
        onSuccess: () => setJawwalCodeSent(true),
        onError: () =>
          setJawwalError("تعذر إرسال الرمز، الرجاء المحاولة مرة أخرى"),
      },
    );
  }

  const jawwalAmountInvalid =
    method === "jawwal" && (!jawwalCodeSent || !jawwalCode.trim());

  function placeConfirmedOrder(
    receiptImage?: File,
    receiptNote?: string,
    senderAccountName?: string
  ) {
    setOrderError(null);
    placeOrderMutation.mutate(
      {
        items,
        couponCode: coupon || undefined,
        paymentMethod: method,
        deliveryMethod,
        addressId,
        pickupTime,
        captainNote: address?.note,
        orderNote: orderNote || undefined,
        receiptImage,
        receiptNote,
        senderAccountName,
        jawwalPhone: method === "jawwal" ? jawwalPhone.trim() : undefined,
        jawwalCode: method === "jawwal" ? jawwalCode.trim() : undefined,
      },
      {
        onSuccess: (order) => {
          setWalletDeducted(false);
          clearCart();
          clearDraft();
          setPlacedOrderId(order.id);
          setSuccessOpen(true);
        },
        onError: (error) => {
          setOrderError(
            walletDeducted
              ? "تم خصم المبلغ من محفظتك لكن تعذر إنشاء الطلب — تواصل مع الدعم لإتمام الطلب أو استرجاع المبلغ، لا تعيد المحاولة"
              : method === "jawwal"
                ? "الرمز غير صحيح أو منتهي الصلاحية"
                : getApiErrorMessage(
                    error,
                    "تعذر إتمام الطلب، الرجاء المحاولة مرة أخرى",
                  ),
          );
        },
      },
    );
  }

  function handleReceiptSubmit(
    receiptImage: File | undefined,
    receiptNote: string | undefined,
    senderAccountName: string
  ) {
    placeConfirmedOrder(receiptImage, receiptNote, senderAccountName);
  }

  function handleConfirm() {
    if (walletDeducted) return;
    if (method === "wallet" && walletBalance < orderTotal) return;
    if (jawwalAmountInvalid) return;

    setOrderError(null);

    if (method === "wallet") {
      deductWalletMutation.mutate(
        { amount: orderTotal, label: "دفع طلب" },
        {
          onSuccess: () => {
            setWalletDeducted(true);
            placeConfirmedOrder();
          },
          onError: () => setOrderError("الرصيد غير كافٍ"),
        },
      );
      return;
    }

    placeConfirmedOrder();
  }

  const inputClass =
    "bg-white/10 border-white/25 focus-visible:border-glace-yellow/50 h-11 px-3.5 text-white text-[15px] placeholder:text-white/40 rounded-[14px] focus-visible:ring-glace-yellow/20";

  function inStoreOnlyLabel(id: PaymentMethod) {
    const account = paymentAccounts?.find((a) => a.method === id);
    if (account?.holderName) return account.holderName;
    return id === "visa" ? "فيزا ماكينة فقط داخل المحل" : "كاش داخل المحل فقط";
  }

  function renderListMethod(m: typeof WALLET_METHOD) {
    const Icon = m.icon;
    const disabled = IN_STORE_ONLY_METHODS.includes(m.id) && !inStoreOnlyAvailable;
    return (
      <button
        key={m.id}
        type="button"
        onClick={() => !disabled && setMethod(m.id)}
        disabled={disabled}
        aria-pressed={method === m.id}
        className={`flex items-center gap-3 rounded-[14px] sm:rounded-[18px] border p-3 text-start transition ${
          disabled
            ? "cursor-not-allowed border-white/15 opacity-40"
            : method === m.id
              ? "cursor-pointer border-white/70 bg-white/16"
              : "cursor-pointer border-white/30 bg-white/5 hover:border-white/60"
        }`}
      >
        <span className="flex justify-center items-center bg-white/12 rounded-[10px] sm:rounded-[12px] size-10 sm:size-11 shrink-0">
          <Icon size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <span className="block font-bold text-[14px] truncate">{m.label}</span>
          {m.desc && (
            <span className="block mt-0.5 text-[11px] text-white/70">{m.desc}</span>
          )}
          {IN_STORE_ONLY_METHODS.includes(m.id) && (
            <span className="block mt-0.5 text-[11px] text-white/70">
              {inStoreOnlyLabel(m.id)}
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
  }

  function getDisplayLabel(methodId: PaymentMethod): string {
    // Try to get displayName from payment accounts (from backend)
    const account = paymentAccounts.find((a) => a.method === methodId);
    if (account?.displayName) return account.displayName;
    // Fallback to hardcoded label
    return PAYMENT_METHOD_LABELS[methodId] ?? methodId;
  }

  function renderCardMethod(m: (typeof CARD_METHODS_BEFORE_CASH)[number]) {
    const disabled = IN_STORE_ONLY_METHODS.includes(m.id) && !inStoreOnlyAvailable;
    const isAssetMethod = m.asset;
    const subtitle = IN_STORE_ONLY_METHODS.includes(m.id) ? inStoreOnlyLabel(m.id) : null;
    const displayLabel = getDisplayLabel(m.id);

    return (
      <button
        key={m.id}
        type="button"
        onClick={() => !disabled && setMethod(m.id)}
        disabled={disabled}
        aria-pressed={method === m.id}
        className={`flex items-center gap-3 rounded-[14px] sm:rounded-[18px] border p-3 text-start transition ${
          disabled
            ? "cursor-not-allowed border-white/15 opacity-40"
            : method === m.id
              ? "cursor-pointer border-white/70 bg-white/16"
              : "cursor-pointer border-white/30 bg-white/5 hover:border-white/60"
        }`}
      >
        <span
          className={`flex size-10 sm:size-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] sm:rounded-[12px] ${m.bg ? `${m.bg} p-1.5` : ""}`}
        >
          <Image
            src={m.asset || m.logo!}
            alt={displayLabel}
            width={44}
            height={44}
            className="w-full h-full object-contain"
          />
        </span>
        <div className="flex-1 min-w-0">
          <span className="block font-bold text-[14px]">
            {isAssetMethod && subtitle ? subtitle : displayLabel}
          </span>
        </div>
      </button>
    );
  }

  // Avoid rendering the payment form on a stale/empty draft (e.g. after a
  // hard refresh of this page) while the redirect above is in flight.
  if (!hasDraft && !successOpen) {
    return (
      <div className="relative flex justify-center items-center bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen">
        <div className="border-4 border-white/25 border-t-glace-yellow rounded-full size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden text-white">
      <EventsBackground />

      <div className="z-10 relative mx-auto px-3 sm:px-6 lg:px-8 pt-18 sm:pt-20 lg:pt-28 pb-32 sm:pb-16 lg:pb-12 max-w-7xl">
        <div className="bg-white/10 shadow-[0_18px_50px_rgba(10,65,82,0.18)] backdrop-blur-md px-3.5 sm:px-6 py-3.5 sm:py-6 border border-white/30 rounded-[24px] sm:rounded-[32px]">
          <div className="flex justify-between items-center gap-4 mb-3 sm:mb-4 text-white/95">
            <span className="font-medium text-[16px] sm:text-[22px] text-glace-yellow">ملخص الطلب</span>
            <div className="flex-1 bg-white/25 h-px" />
          </div>

          {deliveryMethod === "delivery" && address && (
            <div className="bg-[#dff7ff]/10 mb-3 p-3 sm:p-4 border border-white/25 rounded-[18px] sm:rounded-[22px]">
              <p className="text-[13px] sm:text-[14px] text-white/90 mb-2 font-medium">
                عنوان التوصيل:
              </p>
              <p className="text-[12.5px] sm:text-[13px] text-white/75 leading-relaxed">
                {address.street}{address.landmark ? ` · ${address.landmark}` : ""}
              </p>
              <p className="text-[12.5px] sm:text-[13px] text-white/75 mt-1">
                {address.city} · {address.area || "المنطقة"}
              </p>
              <p className="text-[12.5px] sm:text-[13px] text-white/60 mt-1">
                {address.name} · {address.phone}
              </p>
              {address.note && (
                <p className="text-[12.5px] sm:text-[13px] text-glace-yellow mt-2">
                  ملاحظة للكابتن: {address.note}
                </p>
              )}
            </div>
          )}

          {pickupTime && (deliveryMethod === "delivery" || deliveryMethod === "pickup") && (
            <div className="bg-[#dff7ff]/10 mb-3 p-3 sm:p-4 border border-white/25 rounded-[18px] sm:rounded-[22px]">
              <p className="text-[13px] sm:text-[14px] text-white/90 font-medium">
                {deliveryMethod === "delivery" ? "موعد التوصيل:" : "موعد الاستلام:"}
              </p>
              <p className="mt-1 text-[12.5px] sm:text-[13px] text-white/75">
                {formatScheduledDateTime(pickupTime)}
              </p>
            </div>
          )}

          <div className="bg-[#dff7ff]/10 mb-3 p-3 sm:p-4 border border-white/25 rounded-[18px] sm:rounded-[22px]">
            <span className="block mb-2.5 text-[13px] text-white sm:text-[15px]">
              كود الخصم
            </span>

            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponInvalid(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                placeholder="ادخل الكود"
                disabled={couponApplied}
                className="flex-1 min-w-0 bg-white/8 disabled:opacity-60 px-3 sm:px-3.5 border border-white/25 focus:border-glace-yellow/50 rounded-[12px] sm:rounded-[14px] outline-none h-10 sm:h-11 text-[14px] sm:text-[15px] text-white placeholder:text-white/45 text-right transition"
              />

              {couponApplied ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="bg-red-500 hover:bg-red-600 shadow-sm px-3.5 sm:px-4 py-2.5 rounded-[12px] font-bold text-white text-[13px] sm:text-[14px] transition shrink-0 cursor-pointer"
                >
                  إزالة
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim()}
                  className="bg-glace-yellow disabled:opacity-50 shadow-sm hover:brightness-105 px-3.5 sm:px-4 py-2.5 rounded-[12px] font-bold text-[#1e6a7f] text-[13px] sm:text-[14px] transition disabled:cursor-not-allowed shrink-0"
                >
                  تطبيق
                </button>
              )}
            </div>

            {couponApplied && (
              <p className="flex justify-end items-center gap-1.5 mt-3 text-[12.5px] sm:text-[13px] text-glace-yellow font-medium">
                <CheckCircle size={14} className="shrink-0" />
                تم تطبيق خصم {discount.toFixed(2)} ₪
              </p>
            )}
            {couponInvalid && !couponApplied && (
              <p className="flex justify-end items-center gap-1.5 mt-3 text-[12.5px] sm:text-[13px] text-red-300 font-medium">
                <XCircle size={14} className="shrink-0" />
                كود غير صالح
              </p>
            )}
          </div>

          <div className="space-y-2.5 sm:space-y-3 text-[14px] sm:text-[16px] text-white">
            <div className="flex justify-between items-center pb-2.5 sm:pb-3 border-white/20 border-b">
              <span className="text-white">المجموع الجزئي</span>
              <span>{subtotal().toFixed(2)} ₪</span>
            </div>

            {deliveryFee > 0 && (
              <div className="flex justify-between items-center pb-2.5 sm:pb-3 border-white/20 border-b">
                <span className="text-white">
                  {deliveryMethod === "delivery" ? "رسوم التوصيل" : "رسوم الاستلام"}
                </span>
                <span>{deliveryFee.toFixed(2)} ₪</span>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between items-center text-glace-yellow font-medium">
                <span>خصم</span>
                <span>- {discount.toFixed(2)} ₪</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-white/25 border-t">
            <span className="font-medium text-[16px] text-white/90 sm:text-[22px]">
              الإجمالي
            </span>
            <button
              type="button"
              onClick={() => handleCopy("total", orderTotal.toFixed(2))}
              aria-label="نسخ الإجمالي"
              title="نسخ الإجمالي"
              className="group flex items-center gap-1.5 sm:gap-2 hover:bg-white/6 px-2 py-1 rounded-[12px] font-bold text-[#f7d769] text-[22px] sm:text-[30px] transition"
            >
              {copiedField === "total" ? (
                <Check size={16} className="sm:size-4.5 text-green-300 shrink-0" />
              ) : (
                <Copy
                  size={16}
                  className="sm:size-4.5 text-white/55 group-hover:text-white/80 transition"
                />
              )}
              <span>{orderTotal.toFixed(2)} ₪</span>
            </button>
          </div>

          <div className="bg-white/10 mt-5 sm:mt-6 px-3.5 sm:px-5 py-3.5 sm:py-4 border border-white/25 rounded-[20px] sm:rounded-[26px] text-white">
            <div className="flex justify-between items-center gap-3 mb-3.5 sm:mb-4">
              <span className="font-bold text-[17px] sm:text-[20px]">اختر طريقة الدفع</span>
              <div className="flex-1 bg-white/20 h-px" />
            </div>

            <div className="gap-2 sm:gap-3 grid grid-cols-1 sm:grid-cols-2 mb-5 sm:mb-6">
              {renderListMethod(WALLET_METHOD)}
              {CARD_METHODS_BEFORE_CASH.map(renderCardMethod)}
              {inStoreOnlyAvailable && renderCardMethod(CASH_METHOD)}
              {inStoreOnlyAvailable && CARD_METHODS_AFTER_CASH.map(renderCardMethod)}
            </div>

            <div className="bg-white/10 mb-5 sm:mb-6 p-3.5 sm:p-5 border border-white/25 rounded-[20px] sm:rounded-[26px] text-start">
              <p className="mb-3.5 sm:mb-4 text-[12.5px] sm:text-[13px] text-white/60">
                بإتمام الطلب أنت توافق على{" "}
                <Link
                  href="/my-account/terms"
                  className="font-bold text-white hover:text-glace-yellow underline transition-colors"
                >
                  الشروط والأحكام
                </Link>
              </p>

              <div className="flex justify-between items-end gap-3">
                <span className="font-bold text-[14.5px] sm:text-[17px] text-white">
                  الإجمالي{" "}
                  <span className="font-normal text-[11.5px] sm:text-[13px] text-white/55">
                    (شامل الرسوم والضريبة)
                  </span>
                </span>
                <div className="text-end">
                  <button
                    type="button"
                    onClick={() => handleCopy("total", orderTotal.toFixed(2))}
                    aria-label="نسخ الإجمالي"
                    title="نسخ الإجمالي"
                    className="group inline-flex items-center gap-1.5 hover:bg-white/6 px-2 py-1 rounded-[12px] font-bold text-[21px] sm:text-[28px] text-glace-yellow leading-none transition"
                  >
                    {copiedField === "total" ? (
                      <Check size={14} className="sm:size-4 text-green-300 shrink-0" />
                    ) : (
                      <Copy
                        size={14}
                        className="sm:size-4 text-white/55 group-hover:text-white/80 transition"
                      />
                    )}
                    <span>{orderTotal.toFixed(2)} ₪</span>
                  </button>
                  {discount > 0 && (
                    <div className="mt-1 text-[12.5px] sm:text-[14px] text-white/45 line-through">
                      {(subtotal() + deliveryFee).toFixed(2)} ₪
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Method-specific inputs */}
          <div ref={methodDetailsRef} />
          {method === "jawwal" && (
            <div className="flex flex-col gap-2.5 sm:gap-3 bg-white/10 mb-5 sm:mb-6 p-3.5 sm:p-4 border border-white/25 rounded-[16px] sm:rounded-[20px]">
              <div>
                <label className="block mb-2 text-[13px] sm:text-[14px] text-white/80">
                  رقم جوال باي
                </label>
                <Input
                  value={jawwalPhone}
                  disabled={jawwalCodeSent}
                  onChange={(e) => {
                    setJawwalPhone(e.target.value);
                    setJawwalCodeSent(false);
                    setJawwalCode("");
                    setJawwalError(null);
                  }}
                  placeholder="05XXXXXXXX"
                  className={inputClass}
                />
              </div>
              <p className="text-[12.5px] sm:text-[13px] text-white/70">
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
                  disabled={!jawwalPhone.trim() || sendJawwalOrderCodeMutation.isPending}
                  className="bg-glace-yellow hover:bg-yellow-300 disabled:opacity-50 py-2.5 border-0 rounded-[14px] font-bold text-[#1e6a7f] text-[13px] sm:text-[14px] transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {sendJawwalOrderCodeMutation.isPending
                    ? "جارٍ الإرسال..."
                    : "إرسال رمز التأكيد"}
                </button>
              ) : (
                <>
                  <p className="text-[12.5px] sm:text-[13px] text-white/70">
                    تم إرسال رمز التأكيد إلى{" "}
                    <span className="font-bold text-glace-yellow" dir="ltr">
                      {jawwalPhone}
                    </span>
                  </p>
                  <div>
                    <label className="block mb-2 text-[13px] sm:text-[14px] text-white/80">
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
                  <button
                    type="button"
                    onClick={() => {
                      setJawwalCodeSent(false);
                      setJawwalCode("");
                      setJawwalError(null);
                    }}
                    className="self-start text-[13px] text-glace-yellow hover:text-yellow-300 underline cursor-pointer"
                  >
                    لم يصلك الرمز؟ إرسال مرة أخرى أو تغيير رقم الجوال
                  </button>
                </>
              )}

              {jawwalError && (
                <p className="text-[13px] text-red-300 text-center">
                  {jawwalError}
                </p>
              )}
            </div>
          )}

          {RECEIPT_METHODS.includes(method) &&
            (() => {
              const account = paymentAccounts?.find(
                (a): a is TransferPaymentAccount =>
                  a.method === method && !a.inStoreOnly,
              );
              if (!account) return null;

              return (
                <div className="bg-white/10 mb-5 sm:mb-6 p-3.5 sm:p-4 border border-white/25 rounded-[16px] sm:rounded-[20px]">
                  <div className="flex flex-col items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
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
                      className="text-[12.5px] sm:text-[13px] text-glace-yellow hover:underline"
                    >
                      حفظ صورة QR
                    </a>
                    <p className="text-[12.5px] sm:text-[13px] text-white/70 text-center">
                      افتح تطبيق بنكك أو محفظتك وامسح الرمز — يعمل مع جميع
                      البنوك والمحافظ
                    </p>
                  </div>

                  <div className="flex items-center gap-3 my-3.5 sm:my-4">
                    <div className="flex-1 border-white/20 border-t" />
                    <span className="text-[11.5px] sm:text-[12px] text-white/60">
                      أو — التحويل إلى الحساب مباشرة
                    </span>
                    <div className="flex-1 border-white/20 border-t" />
                  </div>

                  <div className="flex flex-col gap-2.5 mb-4 sm:mb-5">
                    {account.bankName && (
                      <div className="flex justify-between items-center text-[13px] sm:text-[14px]">
                        <span className="text-white/70">البنك</span>
                        <span className="font-bold">{account.bankName}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[13px] sm:text-[14px]">
                      <span className="text-white/70">اسم الحساب</span>
                      <span className="font-bold">{account.holderName}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] sm:text-[14px]">
                      <span className="text-white/70">
                        {account.accountLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" dir="ltr">
                          {account.accountValue}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy("account", account.accountValue)
                          }
                          aria-label="نسخ"
                          className="flex justify-center items-center hover:bg-white/10 rounded-full size-7 text-white/70 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedField === "account" ? (
                            <Check size={14} className="text-green-300" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                    {account.accountNumber && (
                      <div className="flex justify-between items-center text-[13px] sm:text-[14px]">
                        <span className="text-white/70">رقم الحساب</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" dir="ltr">
                            {account.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy("accountNumber", account.accountNumber!)
                            }
                            aria-label="نسخ"
                            className="flex justify-center items-center hover:bg-white/10 rounded-full size-7 text-white/70 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedField === "accountNumber" ? (
                              <Check size={14} className="text-green-300" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {account.iban && (
                      <div className="flex justify-between items-center text-[13px] sm:text-[14px]">
                        <span className="text-white/70">
                          رقم الآيبان (IBAN)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" dir="ltr">
                            {account.iban}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy("iban", account.iban!)
                            }
                            aria-label="نسخ"
                            className="flex justify-center items-center hover:bg-white/10 rounded-full size-7 text-white/70 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedField === "iban" ? (
                              <Check size={14} className="text-green-300" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 my-4 sm:my-5">
                    <div className="flex-1 border-white/20 border-t" />
                    <span className="text-[11.5px] sm:text-[12px] text-white/60">
                      ارفع إشعار التحويل
                    </span>
                    <div className="flex-1 border-white/20 border-t" />
                  </div>

                  <ReceiptUploadForm
                    onSubmit={handleReceiptSubmit}
                    submitLabel="تأكيد الدفع"
                    submitting={placeOrderMutation.isPending}
                  />
                </div>
              );
            })()}

          {method === "visa" && (
            <p className="bg-white/10 mb-5 sm:mb-6 px-3.5 sm:px-4 py-2.5 sm:py-3 border border-white/25 rounded-[16px] sm:rounded-[20px] text-[13px] sm:text-[14px] text-white/80">
              {paymentAccounts?.find((a) => a.method === "visa")?.holderName ??
                "الدفع بالفيزا يتم على ماكينة الدفع داخل المحل"}
            </p>
          )}

          {method === "cash" && (
            <p className="bg-white/10 mb-5 sm:mb-6 px-3.5 sm:px-4 py-2.5 sm:py-3 border border-white/25 rounded-[16px] sm:rounded-[20px] text-[13px] sm:text-[14px] text-white/80">
              {paymentAccounts?.find((a) => a.method === "cash")?.holderName ??
                "الدفع كاش داخل المحل فقط"}
            </p>
          )}

          {method === "wallet" && walletBalance < orderTotal && (
            <div className="flex flex-col gap-2.5 sm:gap-3 bg-white/10 mb-5 sm:mb-6 p-3.5 sm:p-4 border border-white/25 rounded-[16px] sm:rounded-[20px]">
              <p className="font-bold text-[14px] sm:text-[15px] text-red-300">
                رصيد المحفظة غير كافٍ
              </p>
              <div className="flex justify-between text-[13px] sm:text-[14px]">
                <span className="text-white/70">رصيدك الحالي</span>
                <span className="font-bold text-white">
                  {walletBalance.toFixed(2)} ₪
                </span>
              </div>
              <div className="flex justify-between pt-2 border-white/15 border-t text-[13px] sm:text-[14px]">
                <span className="text-white/70">المبلغ المطلوب</span>
                <span className="font-bold text-glace-yellow">
                  {orderTotal.toFixed(2)} ₪
                </span>
              </div>
              <Button
                asChild
                className="bg-glace-yellow hover:bg-glace-yellow hover:brightness-105 py-2.5 rounded-[14px] w-full h-auto font-bold text-[#1e6a7f] text-[13px] sm:text-[14px]"
              >
                <Link href="/my-account/wallet">شحن المحفظة</Link>
              </Button>
            </div>
          )}

          {orderError && (
            <p className="mb-3 text-[12.5px] sm:text-[13px] text-red-300 text-center">
              {orderError}
            </p>
          )}

          {!RECEIPT_METHODS.includes(method) &&
            (method !== "jawwal" || jawwalCodeSent) && (
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={
                walletDeducted ||
                (method === "wallet" && walletBalance < orderTotal) ||
                jawwalAmountInvalid ||
                placeOrderMutation.isPending ||
                deductWalletMutation.isPending
              }
              className="bg-glace-yellow hover:bg-yellow-300 disabled:opacity-50 py-3 sm:py-3.5 border-0 rounded-[24px] sm:rounded-[30px] w-full h-auto font-bold text-[#1e6a7f] text-[16px] sm:text-[18px] cursor-pointer disabled:cursor-not-allowed"
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
              طلبك قيد المراجعة
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
