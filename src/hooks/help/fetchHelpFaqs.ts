import { userApi } from "@/lib/axios";
import { isBackendUnavailable } from "@/lib/apiWithFallback";

export interface Faq {
  id: string;
  question: string;
  /** Paragraphs separated by "\n\n"; a paragraph starting with "- " renders as a bullet list. */
  answer: string;
  /** Optional trailing link appended after the answer, e.g. the contact page. */
  link?: { href: string; label: string };
}

export const HELP_FAQS_QUERY_KEY = ["help", "faqs"] as const;

/** Temporary fake FAQs shown while `/help/faqs` isn't live yet on the
 *  backend — remove once the real endpoint is up. Kept in sync with the
 *  actual order/payment/wallet flows (see 15-help-faqs.md). */
const FAKE_FAQS: Faq[] = [
  {
    id: "how-to-order",
    question: "كيف أقدّم طلب؟",
    answer:
      "تصفّح المنيو، أضف المنتجات التي تريدها إلى السلة، ثم اختر طريقة الاستلام (توصيل، استلام من المحل، أو تناول الآن) وأكمل الدفع.",
  },
  {
    id: "payment-methods",
    question: "شو طرق الدفع المتاحة؟",
    answer:
      "يمكنك الدفع بإحدى الطرق التالية:\n\n- الكاش أو الفيزا — عند الاستلام من المحل فقط\n- من رصيد محفظتك في النظام\n- جوال باي الآلي — تدخل رقمك ويوصلك رمز تأكيد برسالة، بدون رفع أي صورة\n- جوال باي اليدوي، بال باي، أو بنك فلسطين — تحوّل يدوياً وترفع صورة إشعار الدفع",
  },
  {
    id: "under-review-status",
    question: 'شو معنى "قيد المراجعة"؟',
    answer:
      'كل طلب أو طلب شحن محفظة يبدأ بحالة "قيد المراجعة" — حتى لو دفعت كاش أو فيزا داخل المحل. لو الطريقة تحتاج إثبات دفع (تحويل بنكي أو جوال باي يدوي)، يبقى الطلب بهاي الحالة لحد ما فريقنا يتحقق من إشعار الدفع، بعدها ينتقل للمرحلة التالية.\n\nنفس الشي لو ألغيت طلب بعد الدفع: المبلغ ما بيرجع تلقائياً، وبيتحول لرصيد بمحفظة النظام بعد مراجعة الإلغاء.',
  },
  {
    id: "cancel-order",
    question: "كيف ألغي طلب؟",
    answer:
      'من صفحة تتبع الطلب، اضغط "إلغاء الطلب" واختر السبب. الإلغاء متاح فقط طالما الطلب لسا بحالة "قيد المراجعة" أو "جاري التحضير" — بعد ما يصير "جاهز للاستلام" أو يطلع للتوصيل ما فيك تلغيه من التطبيق.',
  },
  {
    id: "wallet-topup",
    question: "كيف أشحن رصيد محفظتي؟",
    answer:
      'من صفحة "محفظتي"، اختر طريقة الشحن. جوال باي الآلي يضيف الرصيد فوراً بعد إدخال رمز التأكيد. أما جوال باي اليدوي، بال باي، أو بنك فلسطين، فتحوّل المبلغ وترفع صورة إشعار الدفع — ويُضاف الرصيد بعد التحقق من الإشعار.',
  },
  {
    id: "delivery-fee",
    question: "كيف أعرف رسوم التوصيل لمنطقتي؟",
    answer:
      "رسوم التوصيل تظهر تلقائياً عند اختيار عنوانك في صفحة إتمام الطلب، وتختلف حسب المنطقة.",
  },
  {
    id: "order-not-arrived",
    question: "لسة ما وصلني طلبي أو في مشكلة، شو أعمل؟",
    answer: "تواصل معنا مباشرةً وسيتم مساعدتك في أقرب وقت.",
    link: { href: "/contact", label: "تواصل معنا" },
  },
];

export async function fetchHelpFaqs(): Promise<Faq[]> {
  try {
    return await userApi.get<Faq[]>("/help/faqs").then((r) => r.data);
  } catch (error) {
    if (isBackendUnavailable(error)) return FAKE_FAQS;
    throw error;
  }
}
