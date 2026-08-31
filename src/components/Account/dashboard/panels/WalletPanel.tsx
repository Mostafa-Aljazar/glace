"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useWalletStore,
  type TopUpMethod,
  type TopUpRequestStatus,
} from "@/store/walletStore";
import { findMerchantPaymentAccount } from "@/lib/merchantPaymentAccounts";
import ReceiptUploadForm from "@/components/Payment/ReceiptUploadForm";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";

const TOP_UP_METHODS: { id: TopUpMethod; label: string; logo: string; bg?: string }[] = [
  { id: "jawwal-manual", label: "جوال باي (يدوي)", logo: "/images/JAWWAL_PAY.webp" },
  { id: "jawwal", label: "جوال باي (آلي)", logo: "/images/JAWWAL_PAY.webp" },
  { id: "paypal", label: "بال باي", logo: "/images/PalPay.jpg" },
  { id: "bop", label: "بنك فلسطين", logo: "/images/BOP.webp" },
];

const TOP_UP_REQUEST_STATUS_COLORS: Record<TopUpRequestStatus, string> = {
  "قيد المراجعة": "bg-yellow-500/30 text-yellow-200",
  "مكتمل": "bg-green-500/30 text-green-200",
};

const TOP_UP_METHOD_LABELS: Record<TopUpMethod, string> = {
  bop: "بنك فلسطين",
  paypal: "بال باي",
  jawwal: "جوال باي (آلي)",
  "jawwal-manual": "جوال باي (يدوي)",
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
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const topUpRequests = useWalletStore((s) => s.topUpRequests);
  const submitTopUpRequest = useWalletStore((s) => s.submitTopUpRequest);
  const approveTopUpRequest = useWalletStore((s) => s.approveTopUpRequest);
  const seedMockDataForTesting = useWalletStore((s) => s.seedMockDataForTesting);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      seedMockDataForTesting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [step, setStep] = useState<Step>("method");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(
    null
  );
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [method, setMethod] = useState<TopUpMethod | null>(null);
  const [copiedField, setCopiedField] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(
    null
  );

  const amountValue = parseFloat(amount) || 0;
  const amountValid = amountValue >= 1;

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
    if (!phone.trim()) return;
    setCodeSent(true);
  }

  function handleJawwalAutoSubmit() {
    if (!method || !amountValid || !phone.trim() || !code.trim()) return;
    const id = submitTopUpRequest(amountValue, method, { phone: phone.trim() });
    setSubmittedRequestId(id);
    resetFlow(false);
  }

  function handleReceiptSubmit(
    receiptImage: string | undefined,
    receiptNote: string | undefined
  ) {
    if (!method) return;
    const id = submitTopUpRequest(amountValue, method, {
      receiptImage,
      receiptNote,
    });
    setSubmittedRequestId(id);
    resetFlow(false);
  }

  function resetFlow(clearSubmitted = true) {
    setStep("method");
    setAmount("");
    setPhone("");
    setCodeSent(false);
    setCode("");
    setMethod(null);
    if (clearSubmitted) setSubmittedRequestId(null);
  }

  const account =
    method && method !== "jawwal" ? findMerchantPaymentAccount(method) : undefined;

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
              <div className="bg-yellow-500/30 px-4 py-3 rounded-[16px] text-yellow-200 text-[14px]">
                تم استلام طلب الشحن وهو قيد المراجعة، سيُضاف المبلغ لرصيدك
                بعد التحقق من الإشعار.
              </div>
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
                {TOP_UP_METHODS.map((m) => (
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
                        src={m.logo}
                        alt={m.label}
                        width={44}
                        height={44}
                        className="w-full h-full object-contain"
                      />
                    </span>
                    <span className="font-bold text-[15px]">{m.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : method === "jawwal" ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-[14px] text-white/70">جوال باي (آلي)</p>
                <button
                  type="button"
                  onClick={() => setStep("method")}
                  className="text-[13px] text-white/60 hover:text-white/80 underline cursor-pointer"
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
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                    placeholder="أدخل المبلغ"
                    className="bg-white/10 border border-white/25 focus:border-glace-yellow/50 rounded-[14px] px-3.5 py-2.5 w-full text-white text-[15px] placeholder:text-white/40 outline-none transition-colors"
                  />
                  {amount !== "" && !amountValid && (
                    <p className="mt-1.5 text-[13px] text-red-300">
                      المبلغ يجب ألا يقل عن 1 ₪
                    </p>
                  )}
                </div>

                {!codeSent ? (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={!phone.trim()}
                    className="bg-glace-yellow hover:bg-glace-yellow hover:brightness-105 disabled:opacity-50 py-3 rounded-[16px] font-bold text-[#1e6a7f] text-[15px] transition disabled:cursor-not-allowed cursor-pointer"
                  >
                    إرسال رمز التأكيد
                  </button>
                ) : (
                  <>
                    <p className="text-[13px] text-glace-yellow">
                      تم إرسال رمز التأكيد إلى {phone}
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
                  </>
                )}

                <button
                  type="button"
                  onClick={handleJawwalAutoSubmit}
                  disabled={!amountValid || !phone.trim() || !codeSent || !code.trim()}
                  className="bg-[#117291] hover:bg-[#0e6080] disabled:opacity-50 py-3 rounded-[16px] font-bold text-[15px] text-white transition disabled:cursor-not-allowed cursor-pointer"
                >
                  تأكيد الشحن
                </button>
              </div>
            </>
          ) : (
            account && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[14px] text-white/70">
                    {TOP_UP_METHOD_LABELS[method!]}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep("method")}
                    className="text-[13px] text-white/60 hover:text-white/80 underline cursor-pointer"
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
                    <span className="text-white/70">{account.primaryLabel}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" dir="ltr">
                        {account.primaryValue}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(account.primaryValue)}
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
                  {account.secondaryLabel && account.secondaryValue && (
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-white/70">{account.secondaryLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" dir="ltr">
                          {account.secondaryValue}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(account.secondaryValue!)}
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
                    المبلغ المحوَّل
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                    placeholder="أدخل المبلغ"
                    className="bg-white/10 border border-white/25 focus:border-glace-yellow/50 rounded-[14px] px-3.5 py-2.5 w-full text-white text-[15px] placeholder:text-white/40 outline-none transition-colors"
                  />
                  {amount !== "" && !amountValid && (
                    <p className="mt-1.5 text-[13px] text-red-300">
                      المبلغ يجب ألا يقل عن 1 ₪
                    </p>
                  )}
                </div>

                {amountValid && (
                  <>
                    <p className="mb-3 text-[14px] text-white/80">
                      ارفع صورة وصل التحويل
                    </p>
                    <ReceiptUploadForm
                      onSubmit={handleReceiptSubmit}
                      submitLabel="تأكيد الشحن"
                    />
                  </>
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
                        <div className="flex justify-between text-[14px]">
                          <span className="text-white/70">طريقة الدفع</span>
                          <span className="font-bold">
                            {TOP_UP_METHOD_LABELS[req.method]}
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
                        {req.status === "قيد المراجعة" && (
                          <button
                            type="button"
                            onClick={() => approveTopUpRequest(req.id)}
                            className="bg-green-500/20 hover:bg-green-500/30 py-2.5 rounded-[14px] font-bold text-[13px] text-green-200 transition cursor-pointer"
                          >
                            موافقة (اختبار) — يضيف المبلغ لسجل المعاملات
                          </button>
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
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
              {[...transactions].reverse().map((tx) => {
                const isOpen = expandedTxId === tx.id;
                const hasDetails = tx.method || tx.receiptImage;
                const Row = (
                  <div className="flex justify-between items-center gap-3 w-full">
                    <div className="flex items-center gap-3">
                      <div className={`flex justify-center items-center rounded-full size-9 shrink-0 ${tx.type === "credit" ? "bg-green-500/30" : "bg-red-500/30"}`}>
                        {tx.type === "credit"
                          ? <TrendingUp size={18} className="text-green-300" />
                          : <TrendingDown size={18} className="text-red-300" />}
                      </div>
                      <div className="text-start">
                        <p className="text-[15px] font-bold">{tx.label}</p>
                        <p className="text-white/60 text-[12px]">
                          {new Date(tx.date).toLocaleString("ar-PS", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className={`text-[17px] font-bold ${tx.type === "credit" ? "text-green-300" : "text-red-300"}`}>
                        {tx.type === "credit" ? "+" : "-"}{tx.amount.toFixed(2)} ₪
                      </p>
                      {hasDetails && (
                        isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </div>
                );

                if (!hasDetails) {
                  return (
                    <div key={tx.id} className="pb-3 border-b border-white/20">
                      {Row}
                    </div>
                  );
                }

                return (
                  <div
                    key={tx.id}
                    className="border border-white/20 rounded-[16px] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedTxId(isOpen ? null : tx.id)}
                      className="hover:bg-white/10 px-4 py-3 w-full transition-colors cursor-pointer"
                    >
                      {Row}
                    </button>
                    {isOpen && (
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
        </DashboardCard>
      </div>
    </div>
  );
}
