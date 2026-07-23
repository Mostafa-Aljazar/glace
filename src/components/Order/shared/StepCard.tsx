import type { ReactNode } from "react";

export function StepCard({
  step,
  title,
  subtitle,
  done,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="bg-white/17 backdrop-blur-[15px] mb-4 rounded-[28px] overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex justify-center items-center shrink-0 rounded-full w-8 h-8 font-bold text-[14px] ${
              done ? "bg-green-500/25 text-green-300" : "bg-white/15 text-white"
            }`}
          >
            {step}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[18px] text-white">{title}</h2>
            {subtitle && <p className="text-[12px] text-white/55">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default StepCard;
