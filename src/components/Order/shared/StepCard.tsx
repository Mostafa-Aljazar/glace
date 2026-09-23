import { forwardRef, type ReactNode } from "react";

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
    children: ReactNode;
  }
>(function StepCard(
  { step, title, subtitle, done, locked, error, errorMsg, children },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`bg-white/17 backdrop-blur-[15px] mb-4 rounded-[28px] overflow-hidden transition-all border-2 ${
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
              <p className="mt-0.5 text-[12px] text-red-300">{errorMsg}</p>
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
