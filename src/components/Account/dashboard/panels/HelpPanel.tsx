"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import DashboardCard from "../shared/DashboardCard";
import { useHelpFaqs } from "@/hooks/help";

function FaqAnswer({ answer }: { answer: string }) {
  const paragraphs = answer.split("\n\n");
  return (
    <>
      {paragraphs.map((para, idx) =>
        para.startsWith("- ") ? (
          <ul key={idx} className="space-y-1.5 mt-2 list-disc list-inside">
            {para
              .split("\n")
              .map((line) => line.replace(/^- /, ""))
              .map((line) => (
                <li key={line}>{line}</li>
              ))}
          </ul>
        ) : (
          <p key={idx} className={idx > 0 ? "mt-2" : undefined}>
            {para}
          </p>
        ),
      )}
    </>
  );
}

export default function HelpPanel() {
  const { data: faqs = [] } = useHelpFaqs();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <DashboardCard title="المساعدة" icon={HelpCircle}>
      <p className="mb-6 text-white/70 text-[14px]">
        أسئلة شائعة حول استخدام تطبيق جلاسيه الأمير
      </p>
      <div className="flex flex-col gap-3">
        {faqs.map((faq) => {
          const isOpen = expandedId === faq.id;
          return (
            <div
              key={faq.id}
              className="border border-white/20 rounded-[16px] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : faq.id)}
                className="flex justify-between items-center gap-3 hover:bg-white/10 px-4 py-3.5 w-full text-white text-start transition-colors cursor-pointer"
              >
                <span className="font-bold text-[15px]">{faq.question}</span>
                {isOpen ? (
                  <ChevronUp size={18} className="shrink-0" />
                ) : (
                  <ChevronDown size={18} className="shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pt-3 pb-4 border-white/10 border-t text-white/85 text-[14px] leading-relaxed">
                  <FaqAnswer answer={faq.answer} />
                  {faq.link && (
                    <p className="mt-2">
                      <Link
                        href={faq.link.href}
                        className="text-glace-yellow hover:underline"
                      >
                        {faq.link.label}
                      </Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
