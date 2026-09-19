"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Upload, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Props {
  /** Existing receipt image URL to preview, e.g. when re-uploading on an
   *  order that already has one attached. */
  initialImage?: string;
  initialNote?: string;
  /** Existing sender account name, for re-upload/edit flows. */
  initialSenderAccountName?: string;
  onSubmit: (
    receiptImage: File | undefined,
    note: string | undefined,
    senderAccountName: string,
  ) => void;
  submitLabel: string;
  /** Extra condition (e.g. a required amount field owned by the parent)
   *  that must also hold before the submit button enables. */
  submitDisabled?: boolean;
  /** True while the parent's submit mutation is in flight — disables the
   *  button and swaps its label so a slow request can't be double-submitted
   *  and doesn't look stuck/frozen while it settles. */
  submitting?: boolean;
}

/** Shared receipt-upload UI — used both on the initial payment confirm step
 *  and on the order-status "بانتظار الدفع" banner's re-upload action. Lets
 *  the customer either attach a photo of the transfer receipt, or (if they
 *  can't) leave a note describing which account/bank they paid from so
 *  staff can match it manually. */
export default function ReceiptUploadForm({
  initialImage,
  initialNote,
  initialSenderAccountName,
  onSubmit,
  submitLabel,
  submitDisabled,
  submitting,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(initialImage);
  const [troubleUploading, setTroubleUploading] = useState(false);
  const [note, setNote] = useState(initialNote ?? "");
  const [senderAccountName, setSenderAccountName] = useState(
    initialSenderAccountName ?? "",
  );
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFileChange(selected: File | null) {
    setFile(selected);
    setPreview((current) => {
      if (current && current.startsWith("blob:")) URL.revokeObjectURL(current);
      return selected ? URL.createObjectURL(selected) : undefined;
    });
  }

  const missingSenderName = senderAccountName.trim().length === 0;
  const missingReceipt = troubleUploading ? note.trim().length === 0 : !file;

  const canSubmit =
    !missingReceipt && !missingSenderName && !submitDisabled && !submitting;

  function handleSubmit() {
    if (!canSubmit) {
      setShowValidation(true);
      return;
    }
    onSubmit(
      troubleUploading ? undefined : (file ?? undefined),
      troubleUploading ? note.trim() : undefined,
      senderAccountName.trim(),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!troubleUploading &&
        (preview ? (
          <div className="relative border border-white/25 rounded-[20px] overflow-hidden">
            <img
              src={preview}
              alt="إشعار الدفع"
              className="bg-black/20 w-full max-h-64 object-contain"
            />
            <button
              type="button"
              onClick={() => handleFileChange(null)}
              aria-label="إزالة الصورة"
              className="top-2 left-2 absolute flex justify-center items-center bg-black/50 hover:bg-black/70 rounded-full size-8 text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <label
              className={`flex flex-col items-center gap-2 py-6 border border-dashed rounded-[14px] cursor-pointer hover:bg-white/5 transition-colors ${
                showValidation && missingReceipt
                  ? "border-red-400"
                  : "border-white/25"
              }`}
            >
              <Upload size={22} className="text-glace-yellow" />
              <span className="text-[14px] text-white/80">
                اضغط لالتقاط صورة أو اختيارها من المعرج
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
            {showValidation && missingReceipt && (
              <p className="mt-1.5 text-[12.5px] text-red-300">
                الرجاء رفع صورة وصل التحويل
              </p>
            )}
          </div>
        ))}

      <div>
        <label className="block mb-2 text-[14px] text-white/80">
          اسم صاحب الحساب اللي حوّلت منه <span className="text-red-300">*</span>
        </label>
        <Input
          value={senderAccountName}
          onChange={(e) => setSenderAccountName(e.target.value)}
          placeholder="مثال: مصطفى الجزار"
          className={`bg-white/10 h-11 px-3.5 text-white text-[15px] placeholder:text-white/40 rounded-[14px] focus-visible:ring-glace-yellow/20 ${
            showValidation && missingSenderName
              ? "border-red-400 focus-visible:border-red-400"
              : "border-white/25 focus-visible:border-glace-yellow/50"
          }`}
        />
        {showValidation && missingSenderName && (
          <p className="mt-1.5 text-[12.5px] text-red-300">
            الرجاء إدخال اسم صاحب الحساب اللي حوّلت منه
          </p>
        )}
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <Checkbox
          checked={troubleUploading}
          onCheckedChange={(checked) => setTroubleUploading(checked === true)}
          className="data-[state=checked]:bg-glace-yellow mt-0.5 border-white/40 data-[state=checked]:border-glace-yellow data-[state=checked]:text-[#1e6a7f]"
        />
        <span className="text-[14px] text-white/80">
          هل تواجه مشكلة في رفع الوصل؟
        </span>
      </label>

      {troubleUploading && (
        <div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="رجاءً اكتب اسم الحساب واسم البنك/المحفظة اللي تم التحويل منه، حتى نتطابق مع الإشعار الواصل لنا"
            className={`bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-glace-yellow/20 ${
              showValidation && missingReceipt
                ? "border-red-400 focus-visible:border-red-400"
                : "border-white/25 focus-visible:border-glace-yellow/50"
            }`}
          />
          {showValidation && missingReceipt ? (
            <p className="mt-1.5 text-[12.5px] text-red-300">
              الرجاء كتابة اسم الحساب والبنك/المحفظة اللي حوّلت منها
            </p>
          ) : (
            <p className="mt-2 text-[12px] text-white/60">
              سيصل طلبك بحالة &quot;قيد المراجعة&quot; وسيتواصل معك فريق الدعم
              للتأكد من التحويل قبل تحويل الطلب للمطعم.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitDisabled || submitting}
        className="bg-[#117291] hover:bg-[#0e6080] disabled:opacity-50 py-3 rounded-[20px] w-full font-bold text-[16px] text-white transition cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? "جاري الإرسال..." : submitLabel}
      </button>

      {showValidation && (missingSenderName || missingReceipt) && (
        <div className="flex items-start gap-2.5 bg-red-500/10 -mt-1 p-3.5 border border-red-400/30 rounded-[16px] animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="flex justify-center items-center bg-red-400/20 rounded-full size-6 shrink-0">
            <AlertCircle size={14} className="text-red-300" />
          </span>
          <p className="flex-1 text-[13px] text-red-200 leading-snug">
            {missingSenderName && missingReceipt
              ? troubleUploading
                ? "الرجاء إدخال اسم صاحب الحساب، وكتابة اسم الحساب والبنك/المحفظة اللي حوّلت منها"
                : "الرجاء إدخال اسم صاحب الحساب، ورفع صورة وصل التحويل"
              : missingSenderName
                ? "الرجاء إدخال اسم صاحب الحساب اللي حوّلت منه"
                : troubleUploading
                  ? "الرجاء كتابة اسم الحساب والبنك/المحفظة اللي حوّلت منها"
                  : "الرجاء رفع صورة وصل التحويل"}
          </p>
        </div>
      )}
    </div>
  );
}
