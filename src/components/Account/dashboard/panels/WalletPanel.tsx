"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import type { TopUpMethod, TopUpRequestStatus } from "@/store/walletStore";
import {
  useWallet,
  useWalletTransactions,
  useTopUpRequests,
  useSubmitTopUpRequest,
  useSendJawwalTopUpCode,
  useConfirmJawwalTopUp,
  type ReceiptTopUpMethod,
} from "@/hooks/wallet";
import { usePaymentAccounts } from "@/hooks/payments/usePaymentAccounts";
import type { TransferPaymentAccount } from "@/lib/merchantPaymentAccounts";
import { visaCard, cashIcon } from "@/assets/images";
import { useAuthStore } from "@/store/authStore";
import ReceiptUploadForm from "@/components/Payment/ReceiptUploadForm";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";

const TOP_UP_METHODS: { id: TopUpMethod; label: string; logo?: string; asset?: typeof visaCard; bg?: string }[] = [
  { id: "jawwal-manual", label: "جوال باي (يدوي)", logo: "/images/JAWWAL_PAY.webp" },
  { id: "jawwal", label: "جوال باي (آلي)", logo: "/images/JAWWAL_PAY.webp" },
  { id: "paypal", label: "بال باي", logo: "/images/PalPay.jpg" },
  { id: "bop", label: "بنك فلسطين", logo: "/images/BOP.webp" },
  { id: "visa", label: "فيزا", asset: visaCard, bg: "bg-white" },
];

/** Visa has no online transfer/receipt flow — it can only be charged on the
 *  in-store card terminal, same restriction as PaymentClientPage. */
const IN_STORE_ONLY_TOP_UP_METHODS: TopUpMethod[] = ["visa"];

const TOP_UP_REQUEST_STATUS_COLORS: Record<TopUpRequestStatus, string> = {
  "قيد المراجعة": "bg-yellow-500/30 text-yellow-200",
  "مكتمل": "bg-green-500/30 text-green-200",
  "مرفوض": "bg-red-500/30 text-red-200",
};

const TOP_UP_METHOD_LABELS: Record<TopUpMethod, string> = {
  bop: "بنك فلسطين",
  paypal: "بال باي",
  jawwal: "جوال باي (آلي)",
  "jawwal-manual": "جوال باي (يدوي)",
  visa: "فيزا",
};

const TRANSACTION_METHOD_LABELS: Record<TopUpMethod | "cash" | "wallet", string> = {
  ...TOP_UP_METHOD_LABELS,
  cash: "كاش",
  wallet: "محفظة النظام",
};

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

type Step = "method" | "details";

export default function WalletPanel() {
  const amountInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);
  const { data: wallet } = useWallet();
  const balance = wallet?.balance ?? 0;
  const [txPage, setTxPage] = useState(1);
  const { data: txData, isFetching: txFetching } = useWalletTransactions({
    page: txPage,
  });
  const transactions = txData?.items ?? [];
  const { data: topUpRequests = [] } = useTopUpRequests();
  const { data: paymentAccounts = [] } = usePaymentAccounts();
  const submitTopUpRequestMutation = useSubmitTopUpRequest();
  const sendJawwalCodeMutation = useSendJawwalTopUpCode();
  const confirmJawwalMutation = useConfirmJawwalTopUp();

  function getDisplayLabel(methodId: TopUpMethod): string {
    // Try to get displayName from payment accounts (from backend)
    const account = paymentAccounts.find((a) => a.method === methodId);
    if (account?.displayName) return account.displayName;
    // Fallback to hardcoded label
    return TOP_UP_METHOD_LABELS[methodId] ?? methodId;
  }

  const [step, setStep] = useState<Step>("method");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [jawwalError, setJawwalError] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(
    null
  );
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [method, setMethod] = useState<TopUpMethod | null>(null);
  const [copiedField, setCopiedField] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(
    null
  );
  const [completedTopUp, setCompletedTopUp] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const amountValue = parseFloat(amount) || 0;
  const MAX_TOP_UP = 500;
  const amountValid = amountValue >= 1 && amountValue <= MAX_TOP_UP;

  function handlePickMethod(m: TopUpMethod) {
    setMethod(m);
    setStep("details");
  }

  function handleCopy(value: string) {
    navigator.clipboard.writeText(value);
    setCopiedField(true);
    window.setTimeout(() => setCopiedField(false), 2000);
  }

  function handleSendCode() {
    if (!phone.trim() || !amountValid) return;
    setJawwalError(null);
    sendJawwalCodeMutation.mutate(
      { phone: phone.trim(), amount: amountValue },
      {
        onSuccess: () => setCodeSent(true),
        onError: () =>
          setJawwalError("تعذر إرسال الرمز، الرجاء المحاولة مرة أخرى"),
      },
    );
  }

  function handleJawwalAutoSubmit() {
    if (!amountValid || !phone.trim() || !codeSent || !code.trim()) return;
    setJawwalError(null);
    confirmJawwalMutation.mutate(
      { phone: phone.trim(), amount: amountValue, code: code.trim() },
      {
        onSuccess: (request) => {
          setSubmittedRequestId(request.id);
          setCompletedTopUp(true);
          resetFlow(false);
        },
        onError: () => setJawwalError("الرمز غير صحيح أو منتهي الصلاحية"),
      },
    );
  }

  function handleReceiptSubmit(
    receiptImage: File | undefined,
    receiptNote: string | undefined,
    senderAccountName: string
  ) {
    if (!amountValid) {
      setTimeout(() => {
        amountInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        amountInputRef.current?.focus();
      }, 0);
      return;
    }
    if (!method || method === "jawwal" || method === "visa") return;
    setReceiptError(null);
    submitTopUpRequestMutation.mutate(
      {
        method: method as ReceiptTopUpMethod,
        amount: amountValue,
        receiptImage,
        receiptNote,
        senderAccountName,
      },
      {
        onSuccess: (request) => {
          setSubmittedRequestId(request.id);
          setCompletedTopUp(false);
          resetFlow(false);
        },
        onError: () =>
          setReceiptError("تعذر إرسال طلب الشحن، الرجاء المحاولة مرة أخرى"),
      },
    );
  }

  function resetFlow(clearSubmitted = true) {
    setStep("method");
    setAmount("");
    setPhone("");
    setCodeSent(false);
    setCode("");
    setJawwalError(null);
    setReceiptError(null);
    setMethod(null);
    if (clearSubmitted) setSubmittedRequestId(null);
  }

  const account =
    method && method !== "jawwal" && !IN_STORE_ONLY_TOP_UP_METHODS.includes(method)
      ? paymentAccounts?.find(
          (a): a is TransferPaymentAccount =>
            a.method === method && !a.inStoreOnly,
        )
      : undefined;

  return (
    <div className="flex lg:flex-row flex-col gap-6">
      {/* Balance + Top-up */}
      <div className="flex flex-col gap-5 w-full lg:w-[320px] shrink-0">
        {/* Balance card */}
        <DashboardCard>
          <div className="flex flex-col items-center text-center">
            <div className="flex justify-center items-center bg-glace-yellow rounded-full size-16 mb-4">
              <Wallet className="size-8 text-[#388dab]" strokeWidth={2} />
            </div>
            <p className="text-white/80 text-[17px] mb-1">الرصيد الحالي</p>
            <p className="font-bold text-[52px] leading-none">{balance.toFixed(2)}</p>
            <p className="text-[21px] mt-1">شيكل ₪</p>
          </div>
        </DashboardCard>

        {/* Top-up */}
        <DashboardCard title="شحن الرصيد" icon={Wallet}>
          {submittedRequestId ? (
            <div className="flex flex-col items-center gap-3 text-center">
              {completedTopUp ? (
                <div className="bg-green-500/30 px-4 py-3 rounded-[16px] text-green-200 text-[14px]">
                  تم شحن رصيدك بنجاح.
                </div>
              ) : (
                <div className="bg-yellow-500/30 px-4 py-3 rounded-[16px] text-yellow-200 text-[14px]">
                  تم استلام طلب الشحن وهو قيد المراجعة، سيُضاف المبلغ لرصيدك
                  بعد التحقق من الإشعار.
                </div>
              )}
              <button
                type="button"
                onClick={() => resetFlow()}
                className="bg-glace-yellow hover:bg-glace-yellow hover:brightness-105 px-5 py-2 rounded-[16px] font-bold text-[#1e6a7f] text-[14px] transition cursor-pointer"
              >
                شحن رصيد آخر
              </button>
            </div>
          ) : step === "method" ? (
            <>
              <p className="mb-3 text-[14px] text-white/70">
                اختر طريقة التحويل
              </p>
              <div className="flex flex-col gap-3">
                {TOP_UP_METHODS.filter(
                  (m) =>
                    !paymentAccounts.length ||
                    paymentAccounts.some((a) => a.method === m.id),
                ).map((m) => {
                  const displayLabel = getDisplayLabel(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handlePickMethod(m.id)}
                      className="flex items-center gap-3 hover:bg-white/20 p-3 border border-white/30 hover:border-white rounded-[18px] text-start transition-colors cursor-pointer"
                    >
                      <span
                        className={`flex justify-center items-center shrink-0 rounded-[12px] size-11 overflow-hidden ${m.bg ? `${m.bg} p-1.5` : ""}`}
                      >
                        <Image
                          src={m.asset || m.logo!}
                          alt={displayLabel}
                          width={44}
                          height={44}
                          className="w-full h-full object-contain"
                        />
                      </span>
                      <span className="font-bold text-[15px]">{displayLabel}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : method === "jawwal" ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-[14px] text-white/70">جوال باي (آلي)</p>
                <button
                  type="button"
                  onClick={() => setStep("method")}
                  className="text-[13px] text-glace-yellow hover:brightness-110 underline cursor-pointer"
                >
                  تغيير الطريقة
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block mb-2 text-[14px] text-white/80">
                    رقم جوال باي
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setCodeSent(false);
                      setCode("");
                    }}
                    placeholder="05XXXXXXXX"
                    className="bg-white/10 border border-white/25 focus:border-glace-yellow/50 rounded-[14px] px-3.5 py-2.5 w-full text-white text-[15px] placeholder:text-white/40 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-[14px] text-white/80">
                    المبلغ المدفوع
                  </label>
                  <input
                    ref={amountInputRef}
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    disabled={codeSent}
                    onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                    placeholder="أدخل المبلغ"
                    className={`bg-white/10 disabled:opacity-60 border rounded-[14px] px-3.5 py-2.5 w-full text-white text-[15px] placeholder:text-white/40 outline-none transition-colors ${
                      amount !== "" && !amountValid
                        ? "border-red-500 focus:border-red-500/50"
                        : "border-white/25 focus:border-glace-yellow/50"
                    }`}
                  />
                  {amount !== "" && !amountValid && (
                    <p className="mt-2 text-[13px] text-red-300">
                      {amountValue > MAX_TOP_UP
                        ? `الحد الأقصى المسموح ${MAX_TOP_UP} ₪`
                        : "المبلغ يجب ألا يقل عن 1 ₪"}
                    </p>
                  )}
                </div>

                {!codeSent ? (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={!phone.trim() || !amountValid || sendJawwalCodeMutation.isPending}
                    className="bg-glace-yellow hover:bg-glace-yellow hover:brightness-105 disabled:opacity-50 py-3 rounded-[16px] font-bold text-[#1e6a7f] text-[15px] transition disabled:cursor-not-allowed cursor-pointer"
                  >
                    {sendJawwalCodeMutation.isPending
                      ? "جارٍ الإرسال..."
                      : "إرسال رمز التأكيد"}
                  </button>
                ) : (
                  <>
                    <p className="text-[13px] text-glace-yellow">
                      أرسل جوال باي رمزاً لتأكيد دفع {amount} ₪ إلى {phone} —
                      أدخله بالأسفل
                    </p>
                    <div>
                      <label className="block mb-2 text-[14px] text-white/80">
                        رمز التأكيد
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="أدخل الرمز المرسل"
                        className="bg-white/10 border border-white/25 focus:border-glace-yellow/50 rounded-[14px] px-3.5 py-2.5 w-full text-white text-[15px] placeholder:text-white/40 outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCodeSent(false);
                        setCode("");
                        setJawwalError(null);
                      }}
                      className="text-[13px] text-white/60 hover:text-white/80 underline cursor-pointer self-start"
                    >
                      لم يصلك الرمز؟ إرسال مرة أخرى
                    </button>
                  </>
                )}

                {jawwalError && (
                  <p className="text-[13px] text-red-300 text-center">
                    {jawwalError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleJawwalAutoSubmit}
                  disabled={
                    !amountValid ||
                    !phone.trim() ||
                    !codeSent ||
                    !code.trim() ||
                    confirmJawwalMutation.isPending
                  }
                  className="bg-[#117291] hover:bg-[#0e6080] disabled:opacity-50 py-3 rounded-[16px] font-bold text-[15px] text-white transition disabled:cursor-not-allowed cursor-pointer"
                >
                  {confirmJawwalMutation.isPending ? "جارٍ التأكيد..." : "تأكيد الشحن"}
                </button>
              </div>
            </>
          ) : method && IN_STORE_ONLY_TOP_UP_METHODS.includes(method) ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-[14px] text-white/70">
                  {method && getDisplayLabel(method)}
                </p>
                <button
                  type="button"
                  onClick={() => setStep("method")}
                  className="text-[13px] text-glace-yellow hover:brightness-110 underline cursor-pointer"
                >
                  تغيير الطريقة
                </button>
              </div>
              <p className="bg-white/10 px-4 py-3 border border-white/25 rounded-[20px] text-[14px] text-white/80">
                {paymentAccounts?.find((a) => a.method === "visa")?.holderName ??
                  "فيزا ماكينة فقط داخل المحل"}
              </p>
            </>
          ) : (
            account && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[14px] text-white/70">
                    {getDisplayLabel(method!)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep("method")}
                    className="text-[13px] text-glace-yellow hover:brightness-110 underline cursor-pointer"
                  >
                    تغيير الطريقة
                  </button>
                </div>

                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="bg-white p-2 rounded-[14px]">
                    <Image
                      src={account.qrImage}
                      alt={`رمز QR - ${account.holderName}`}
                      width={140}
                      height={140}
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
                  <div className="flex-1 border-t border-white/20" />
                  <span className="text-[12px] text-white/60">
                    أو — التحويل إلى الحساب مباشرة
                  </span>
                  <div className="flex-1 border-t border-white/20" />
                </div>

                <div className="flex flex-col gap-2.5 mb-5">
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
                    <span className="text-white/70">{account.accountLabel}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" dir="ltr">
                        {account.accountValue}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(account.accountValue)}
                        aria-label="نسخ"
                        className="flex justify-center items-center hover:bg-white/10 rounded-full size-7 text-white/70 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedField ? (
                          <Check size={14} className="text-green-300" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                  {account.accountNumber && (
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-white/70">رقم الحساب</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" dir="ltr">
                          {account.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(account.accountNumber!)}
                          aria-label="نسخ"
                          className="flex justify-center items-center hover:bg-white/10 rounded-full size-7 text-white/70 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedField ? (
                            <Check size={14} className="text-green-300" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {account.iban && (
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-white/70">
                        رقم الآيبان (IBAN)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" dir="ltr">
                          {account.iban}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(account.iban!)}
                          aria-label="نسخ"
                          className="flex justify-center items-center hover:bg-white/10 rounded-full size-7 text-white/70 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedField ? (
                            <Check size={14} className="text-green-300" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-[14px] text-white/80">
                    المبلغ المدفوع <span className="text-red-300">*</span>
                  </label>
                  <input
                    ref={amountInputRef}
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                    placeholder="أدخل المبلغ"
                    className={`bg-white/10 border rounded-[14px] px-3.5 py-2.5 w-full text-white text-[15px] placeholder:text-white/40 outline-none transition-colors ${
                      amount !== "" && !amountValid
                        ? "border-red-500 focus:border-red-500/50"
                        : "border-white/25 focus:border-glace-yellow/50"
                    }`}
                  />
                  {!amountValid && (
                    <p className="mt-2 text-[13px] text-red-300">
                      {amount === ""
                        ? "أدخل المبلغ الذي حوّلته لتفعيل زر تأكيد الشحن"
                        : amountValue > MAX_TOP_UP
                          ? `الحد الأقصى المسموح ${MAX_TOP_UP} ₪`
                          : "المبلغ يجب ألا يقل عن 1 ₪"}
                    </p>
                  )}
                </div>

                <p className="mb-3 text-[14px] text-white/80">
                  ارفع صورة وصل التحويل
                </p>
                {amount !== "" && !amountValid && (
                  <div className="mb-3 bg-red-500/20 border border-red-500/40 rounded-[16px] px-4 py-3 text-[13px] text-red-200">
                    {amountValue > MAX_TOP_UP
                      ? `الحد الأقصى المسموح ${MAX_TOP_UP} ₪`
                      : "المبلغ يجب ألا يقل عن 1 ₪"}
                  </div>
                )}
                <ReceiptUploadForm
                  onSubmit={handleReceiptSubmit}
                  submitLabel="تأكيد الشحن"
                  submitDisabled={false}
                  submitting={submitTopUpRequestMutation.isPending}
                  registeredAccountName={user?.name}
                />
                {receiptError && (
                  <p className="mt-3 text-[13px] text-red-300 text-center">
                    {receiptError}
                  </p>
                )}
              </>
            )
          )}
        </DashboardCard>
      </div>

      {/* Transaction history + pending top-up requests */}
      <div className="flex flex-col flex-1 gap-6">
        {topUpRequests.length > 0 && (
          <DashboardCard title="طلبات الشحن" icon={Wallet}>
            <div className="flex flex-col gap-3">
              {topUpRequests.map((req) => {
                const isOpen = expandedRequestId === req.id;
                return (
                  <div
                    key={req.id}
                    className="border border-white/20 rounded-[16px] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRequestId(isOpen ? null : req.id)
                      }
                      className="flex justify-between items-center hover:bg-white/10 px-4 py-3 w-full text-start transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-[15px]">
                          {req.amount.toFixed(2)} ₪
                        </p>
                        <p className="text-white/60 text-[12px]">
                          {new Date(req.createdAt).toLocaleString("ar-PS", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[12px] px-3 py-1 rounded-full ${TOP_UP_REQUEST_STATUS_COLORS[req.status]}`}
                        >
                          {req.status}
                        </span>
                        {isOpen ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="flex flex-col gap-3 px-4 pt-3 pb-4 border-white/10 border-t">
                        {req.status === "مرفوض" && (
                          <div className="bg-red-500/15 px-3 py-2.5 rounded-[12px] text-[13px] text-red-200">
                            {/* Backend doesn't send a rejection reason yet
                                (confirmed against the live API 2026-09-19) —
                                see docs/22-9-2026/22-9-2026-topup-rejection-reason.md.
                                Falls back to a generic message until it does. */}
                            {req.rejectionReason?.trim() ||
                              "تم رفض طلب الشحن هذا. تواصل معنا لمعرفة السبب."}
                          </div>
                        )}
                        <div className="flex justify-between text-[14px]">
                          <span className="text-white/70">طريقة الدفع</span>
                          <span className="font-bold">
                            {getDisplayLabel(req.method)}
                          </span>
                        </div>
                        {req.phone && (
                          <div className="flex justify-between text-[14px]">
                            <span className="text-white/70">رقم الجوال</span>
                            <span className="font-bold" dir="ltr">
                              {req.phone}
                            </span>
                          </div>
                        )}
                        {req.senderAccountName && (
                          <div className="flex justify-between text-[14px]">
                            <span className="text-white/70">
                              حُوّل من حساب
                            </span>
                            <span className="font-bold">
                              {req.senderAccountName}
                            </span>
                          </div>
                        )}
                        {req.receiptNote && (
                          <div className="text-[14px]">
                            <p className="mb-1 text-white/70">
                              ملاحظة العميل
                            </p>
                            <p className="bg-white/10 p-2.5 rounded-[10px]">
                              {req.receiptNote}
                            </p>
                          </div>
                        )}
                        {req.receiptImage && (
                          <div>
                            <p className="mb-1.5 text-[14px] text-white/70">
                              صورة الإشعار
                            </p>
                            <img
                              src={req.receiptImage}
                              alt="إشعار الدفع"
                              className="border border-white/20 rounded-[14px] w-full max-h-72 object-contain bg-black/20"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        )}

        <DashboardCard title="سجل المعاملات" icon={TrendingUp} className="flex-1">
          {transactions.length === 0 ? (
            <EmptyState icon={Wallet} message="لا يوجد معاملات بعد" />
          ) : (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pe-1">
              {transactions.map((tx) => {
                const isOpen = expandedTxId === tx.id;
                const hasDetails = Boolean(tx.method || tx.receiptImage);
                return (
                  <div
                    key={tx.id}
                    className="border border-white/20 rounded-[16px] overflow-hidden shrink-0"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        hasDetails &&
                        setExpandedTxId(isOpen ? null : tx.id)
                      }
                      className={`flex justify-between items-center px-4 py-3 w-full text-start transition-colors ${hasDetails ? "hover:bg-white/10 cursor-pointer" : "cursor-default"}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`flex justify-center items-center rounded-full size-7 shrink-0 ${tx.type === "credit" ? "bg-green-500/30" : "bg-red-500/30"}`}>
                          {tx.type === "credit"
                            ? <TrendingUp size={14} className="text-green-300" />
                            : <TrendingDown size={14} className="text-red-300" />}
                        </span>
                        <span className="max-w-[160px] font-bold text-[13px] text-white/80 truncate">
                          {tx.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-end">
                          <p className={`font-bold text-[15px] truncate ${tx.type === "credit" ? "text-green-300" : "text-red-300"}`}>
                            {tx.type === "credit" ? "+" : "-"}{tx.amount.toFixed(2)} ₪
                          </p>
                          <p className="text-white/60 text-[12px]">
                            {new Date(tx.date).toLocaleString("ar-PS", { dateStyle: "short", timeStyle: "short" })}
                          </p>
                        </div>
                        {hasDetails && (
                          isOpen ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )
                        )}
                      </div>
                    </button>

                    {isOpen && hasDetails && (
                      <div className="flex flex-col gap-3 px-4 pt-3 pb-4 border-white/10 border-t">
                        {tx.method && (
                          <div className="flex justify-between text-[14px]">
                            <span className="text-white/70">طريقة الدفع</span>
                            <span className="font-bold">
                              {TRANSACTION_METHOD_LABELS[tx.method]}
                            </span>
                          </div>
                        )}
                        {tx.receiptImage && (
                          <div>
                            <p className="mb-1.5 text-[14px] text-white/70">
                              صورة الإشعار
                            </p>
                            <img
                              src={tx.receiptImage}
                              alt="إشعار الدفع"
                              className="border border-white/20 rounded-[14px] w-full max-h-72 object-contain bg-black/20"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {txData && txData.totalPages > 1 && (
            <div className="flex justify-between items-center gap-3 mt-4 pt-4 border-white/15 border-t">
              <button
                type="button"
                onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                disabled={txPage <= 1 || txFetching}
                className="flex items-center gap-1 disabled:opacity-40 hover:bg-white/10 px-3 py-2 rounded-[12px] text-[13px] text-white transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
                السابق
              </button>
              <span className="text-[13px] text-white/70">
                صفحة {txData.page} من {txData.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setTxPage((p) => Math.min(txData.totalPages, p + 1))
                }
                disabled={txPage >= txData.totalPages || txFetching}
                className="flex items-center gap-1 disabled:opacity-40 hover:bg-white/10 px-3 py-2 rounded-[12px] text-[13px] text-white transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                التالي
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
