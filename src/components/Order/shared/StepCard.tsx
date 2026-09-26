import { forwardRef, type ReactNode } from "react";
import { Pencil } from "lucide-react";

export const StepCard = forwardRef<
  HTMLDivElement,
  {
    step: number;
    title: string;
    subtitle?: string;
    done?: boolean;
    /** Prior required steps aren't completed yet — dims the card and blocks
     *  interaction with its options until the user finishes them in order. */
    locked?: boolean;
    /** Add-to-cart was pressed while this step was left incomplete — turns
     *  the card's border red and shows `errorMsg` under the title so the
     *  user knows exactly what's missing after being scrolled here. */
    error?: boolean;
    errorMsg?: string;
    /** Completed step folded down to one line showing `summary` (the pick,
     *  e.g. "كاسة"); tapping it calls `onExpand` to reopen it for editing. */
    collapsed?: boolean;
    summary?: string;
    onExpand?: () => void;
    children: ReactNode;
  }
>(function StepCard(
  {
    step,
    title,
    subtitle,
    done,
    locked,
    error,
    errorMsg,
    collapsed,
    summary,
    onExpand,
    children,
  },
  ref,
) {
  if (collapsed) {
    return (
      <div ref={ref} className="mb-3 scroll-mt-28">
        <button
          type="button"
          onClick={onExpand}
          className="flex items-center gap-3 bg-white/12 hover:bg-white/17 backdrop-blur-[15px] px-4 py-3 border border-white/15 rounded-[22px] w-full text-start transition-colors cursor-pointer"
        >
          <span className="flex justify-center items-center bg-green-500/25 rounded-full w-7 h-7 font-bold text-[13px] text-green-300 shrink-0">
            {step}
          </span>
          <span className="flex-1 min-w-0 text-[14px] text-white/70 truncate">
            {title}:{" "}
            <span className="font-bold text-white">{summary}</span>
          </span>
          <span className="flex items-center gap-1 text-[12px] text-glace-yellow shrink-0">
            <Pencil size={13} />
            تعديل
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`bg-white/17 backdrop-blur-[15px] mb-4 rounded-[28px] overflow-hidden transition-all border-2 scroll-mt-28 ${
        error ? "border-red-500" : "border-transparent"
      } ${locked ? "opacity-50" : ""}`}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2.5">
          <div
            className={`flex justify-center items-center shrink-0 rounded-full w-8 h-8 font-bold text-[14px] ${
              done ? "bg-green-500/25 text-green-300" : "bg-white/15 text-white"
            }`}
          >
            {step}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[15px] text-white">{title}</h2>
            {subtitle && <p className="text-[12px] text-white/55">{subtitle}</p>}
            {error && errorMsg && (
              <p className="mt-0.5 font-bold text-[12px] text-red-500">{errorMsg}</p>
            )}
          </div>
        </div>
        <fieldset
          disabled={locked}
          className={`m-0 p-0 border-0 min-w-0${locked ? " pointer-events-none" : ""}`}
        >
          {children}
        </fieldset>
      </div>
    </div>
  );
});

export default StepCard;
