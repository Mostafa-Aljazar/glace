"use client";

import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  /** Existing receipt image URL to preview, e.g. when re-uploading on an
   *  order that already has one attached. */
  initialImage?: string;
  initialNote?: string;
  onSubmit: (receiptImage: File | undefined, note: string | undefined) => void;
  submitLabel: string;
}

/** Shared receipt-upload UI — used both on the initial payment confirm step
 *  and on the order-status "بانتظار الدفع" banner's re-upload action. Lets
 *  the customer either attach a photo of the transfer receipt, or (if they
 *  can't) leave a note describing which account/bank they paid from so
 *  staff can match it manually. */
export default function ReceiptUploadForm({
  initialImage,
  initialNote,
  onSubmit,
  submitLabel,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(initialImage);
  const [troubleUploading, setTroubleUploading] = useState(false);
  const [note, setNote] = useState(initialNote ?? "");

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

  const canSubmit = troubleUploading ? note.trim().length > 0 : !!file;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(troubleUploading ? undefined : file ?? undefined, troubleUploading ? note.trim() : undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      {!troubleUploading &&
        (preview ? (
          <div className="relative rounded-[20px] border border-white/25 overflow-hidden">
            <img
              src={preview}
              alt="إشعار الدفع"
              className="w-full max-h-64 object-contain bg-black/20"
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
          <label className="flex flex-col items-center gap-2 py-6 border border-white/25 border-dashed rounded-[14px] cursor-pointer hover:bg-white/5 transition-colors">
            <Upload size={22} className="text-glace-yellow" />
            <span className="text-[14px] text-white/80">
              اضغط لالتقاط صورة أو اختيارها من المعرض
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
        ))}

      <label className="flex items-start gap-2.5 cursor-pointer">
        <Checkbox
          checked={troubleUploading}
          onCheckedChange={(checked) => setTroubleUploading(checked === true)}
          className="mt-0.5 border-white/40 data-[state=checked]:bg-glace-yellow data-[state=checked]:border-glace-yellow data-[state=checked]:text-[#1e6a7f]"
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
            className="bg-white/10 border-white/25 focus-visible:border-glace-yellow/50 text-white placeholder:text-white/40 focus-visible:ring-glace-yellow/20"
          />
          <p className="mt-2 text-[12px] text-white/60">
            سيصل طلبك بحالة &quot;قيد المراجعة&quot; وسيتواصل معك فريق الدعم
            للتأكد من التحويل قبل تحويل الطلب للمطعم.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="bg-[#117291] hover:bg-[#0e6080] disabled:opacity-50 py-3 rounded-[20px] w-full font-bold text-[16px] text-white transition disabled:cursor-not-allowed cursor-pointer"
      >
        {submitLabel}
      </button>
    </div>
  );
}
