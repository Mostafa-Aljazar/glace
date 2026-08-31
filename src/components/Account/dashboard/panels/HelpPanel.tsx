"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import DashboardCard from "../shared/DashboardCard";

const FAQS: { question: string; answer: React.ReactNode }[] = [
  {
    question: "كيف أقدّم طلب؟",
    answer: (
      <p>
        تصفّح المنيو، أضف المنتجات التي تريدها إلى السلة، ثم اختر طريقة
        الاستلام (توصيل، استلام من المحل، أو تناول الآن) وأكمل الدفع.
      </p>
    ),
  },
  {
    question: "شو طرق الدفع المتاحة؟",
    answer: (
      <>
        <p>يمكنك الدفع بإحدى الطرق التالية:</p>
        <ul className="space-y-1.5 mt-2 list-disc list-inside">
          <li>الكاش أو الفيزا — عند الاستلام من المحل فقط</li>
          <li>من رصيد محفظتك في النظام</li>
          <li>
            التحويل عبر جوال باي، بال باي، أو بنك فلسطين — برفع صورة إشعار
            الدفع بعد التحويل
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "شو معنى \"قيد المراجعة\"؟",
    answer: (
      <p>
        عند تأكيد الطلب أو طلب شحن المحفظة، يبقى بحالة "قيد المراجعة" حتى
        يتحقق فريقنا من إشعار الدفع (إن وُجد)، بعدها ينتقل الطلب للمرحلة
        التالية تلقائياً.
      </p>
    ),
  },
  {
    question: "كيف ألغي طلب؟",
    answer: (
      <p>
        من صفحة تتبع الطلب، اضغط "إلغاء الطلب" واختر السبب. يمكنك الإلغاء
        مجاناً طالما لم يتم استلام الطلب بعد.
      </p>
    ),
  },
  {
    question: "كيف أشحن رصيد محفظتي؟",
    answer: (
      <p>
        من صفحة "محفظتي"، اختر طريقة التحويل (جوال باي، بال باي، أو بنك
        فلسطين)، أدخل المبلغ، وارفع صورة إشعار الدفع. يُضاف المبلغ لرصيدك
        بعد التحقق من الإشعار.
      </p>
    ),
  },
  {
    question: "كيف أعرف رسوم التوصيل لمنطقتي؟",
    answer: (
      <p>
        رسوم التوصيل تظهر تلقائياً عند اختيار عنوانك في صفحة إتمام الطلب،
        وتختلف حسب المنطقة.
      </p>
    ),
  },
  {
    question: "لسة ما وصلني طلبي أو في مشكلة، شو أعمل؟",
    answer: (
      <p>
        تواصل معنا مباشرةً عبر صفحة{" "}
        <Link href="/contact" className="text-glace-yellow hover:underline">
          تواصل معنا
        </Link>{" "}
        وسيتم مساعدتك في أقرب وقت.
      </p>
    ),
  },
];

export default function HelpPanel() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <DashboardCard title="المساعدة" icon={HelpCircle}>
      <p className="mb-6 text-white/70 text-[14px]">
        أسئلة شائعة حول استخدام تطبيق جلاسيه الأمير
      </p>
      <div className="flex flex-col gap-3">
        {FAQS.map((faq, idx) => {
          const isOpen = expandedIndex === idx;
          return (
            <div
              key={faq.question}
              className="border border-white/20 rounded-[16px] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedIndex(isOpen ? null : idx)}
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
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
