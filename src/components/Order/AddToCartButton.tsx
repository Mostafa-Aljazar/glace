"use client";

interface AddToCartButtonProps {
  onClick: () => void;
  canAdd: boolean;
  addedToCart: boolean;
  validationMsg: string;
}

export default function AddToCartButton({
  onClick,
  canAdd,
  addedToCart,
  validationMsg,
}: AddToCartButtonProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={`px-8 py-3 rounded-full font-bold text-[16px] transition-all cursor-pointer
          ${
            addedToCart
              ? "bg-green-400 text-white"
              : canAdd
                ? "bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] shadow-[0_4px_20px_rgba(244,228,81,0.4)] hover:-translate-y-0.5"
                : "bg-white/30 text-white/60"
          }`}
      >
        {addedToCart ? "✓ تمت الإضافة" : "أضف للسلة"}
      </button>

      {validationMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-200 flex items-center gap-2.5 bg-red-500/90 backdrop-blur-sm text-white text-[14px] font-medium px-5 py-3 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-[11px] font-bold shrink-0">!</span>
          {validationMsg}
        </div>
      )}
    </>
  );
}
