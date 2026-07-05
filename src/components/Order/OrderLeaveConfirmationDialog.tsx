"use client";

interface OrderLeaveConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function OrderLeaveConfirmationDialog({
  open,
  onClose,
  onConfirm,
}: OrderLeaveConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div className="z-9999 fixed inset-0 flex justify-center items-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#0d4757]/95 backdrop-blur-xl p-6 border border-white/20 rounded-[20px] w-full max-w-[360px] text-white">
        <h2 className="mb-2 font-bold text-[18px]">مغادرة الصفحة؟</h2>
        <p className="mb-6 text-[14px] text-white/70">
          إذا غادرت الآن، ستفقد الاختيارات غير المحفوظة.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/15 px-4 py-2.5 border border-white/25 rounded-full font-bold text-[14px] text-white transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-500/80 hover:bg-red-600 px-4 py-2.5 rounded-full font-bold text-[14px] text-white transition"
          >
            نعم، اغادر
          </button>
        </div>
      </div>
    </div>
  );
}
