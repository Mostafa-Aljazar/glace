import {
  chocolateIce, nutellaIce, pistachioIce, milkshake, luqaimat,
  moltenCake, pancake, waffle, iceCreamCup, familyIceCream,
  lotusIce, oreoIce, strawberryIce, caramelIce, kinderBuenoIce,
  iceCreamKunafa, dondurmaBasklava, mochi,
} from "@/assets/images";
import type { StaticIMG } from "@/assets/images";

export type OfferCategory = "الكل" | "بوظة" | "ميلك شيك" | "حلويات" | "عروض خاصة";

export interface Offer {
  id: number;
  title: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  image: StaticIMG;
  category: OfferCategory;
  badge?: string;
  couponCode?: string;
  validTo?: string;
  featured?: boolean;
  orderHref?: string;
}

export const OFFERS: Offer[] = [
  {
    id: 1,
    title: "ميلك شيك كلاسيك",
    description: "ميلك شيك بأطعمة كلاسيكية مميزة — شوكولاتة، فانيلا، فراولة وأكثر",
    originalPrice: 12,
    salePrice: 8,
    image: milkshake,
    category: "ميلك شيك",
    badge: "الأكثر طلبًا",
    orderHref: "/menu/order/milkshake",
    featured: true,
  },
  {
    id: 2,
    title: "بوظة كاسة وسط",
    description: "كاستين من أطعمة كلاسيك أو سبيشل بسعر مخفض",
    originalPrice: 5,
    salePrice: 3,
    image: iceCreamCup,
    category: "بوظة",
    orderHref: "/menu/order/cup",
  },
  {
    id: 3,
    title: "بوظة نوتيلا سبيشل",
    description: "كاسة كبير بطعم النوتيلا الفاخر مع إضافة صوص مجانية",
    originalPrice: 10,
    salePrice: 7,
    image: nutellaIce,
    category: "بوظة",
    badge: "عرض محدود",
    orderHref: "/menu/order/cup",
    featured: true,
  },
  {
    id: 4,
    title: "لقيمات لوتس",
    description: "لقيمات ساخنة مغطاة بصوص اللوتس الكريمي — حلاوة لا تُقاوَم",
    originalPrice: 15,
    salePrice: 12,
    image: luqaimat,
    category: "حلويات",
    orderHref: "/menu",
  },
  {
    id: 5,
    title: "كيك المولتن",
    description: "كيك شوكولاتة دافئ بقلب سائل — التجربة المثالية للمحبين",
    originalPrice: 18,
    salePrice: 14,
    image: moltenCake,
    category: "حلويات",
    featured: true,
  },
  {
    id: 6,
    title: "بانكيك مع بوظة",
    description: "بانكيك طازج مع كرة بوظة كلاسيك من اختيارك",
    originalPrice: 16,
    salePrice: 12,
    image: pancake,
    category: "حلويات",
    badge: "جديد",
  },
  {
    id: 7,
    title: "فاميلي بوظة مكس",
    description: "عبوة عائلية كبيرة من أطعمة كلاسيك وسبيشل — تكفي للجميع",
    originalPrice: 35,
    salePrice: 28,
    image: familyIceCream,
    category: "بوظة",
    couponCode: "GLACE20",
    badge: "توفير 20%",
    orderHref: "/menu",
    featured: true,
  },
  {
    id: 8,
    title: "ميلك شيك بيستاشيو",
    description: "طعم البيستاشيو الفاخر في ميلك شيك كريمي ناعم",
    originalPrice: 16,
    salePrice: 13,
    image: pistachioIce,
    category: "ميلك شيك",
    badge: "مميز",
    orderHref: "/menu/order/milkshake",
  },
  {
    id: 9,
    title: "وافل مع أطعمة خاصة",
    description: "وافل مقرمش مع طعمك المفضل من الأطعمة السبيشل",
    originalPrice: 18,
    salePrice: 14,
    image: waffle,
    category: "حلويات",
  },
  {
    id: 10,
    title: "بوظة لوتس كاسة كبير",
    description: "ثلاث كرات من طعم اللوتس المذهل — الحجم الكبير بسعر مميز",
    originalPrice: 12,
    salePrice: 9,
    image: lotusIce,
    category: "بوظة",
    orderHref: "/menu/order/cup",
  },
  {
    id: 11,
    title: "موتشي جلاسيه",
    description: "موتشي ياباني بأطعمة فاخرة — 6 قطع بسعر واحد",
    originalPrice: 22,
    salePrice: 16,
    image: mochi,
    category: "حلويات",
    badge: "جديد",
    featured: true,
  },
  {
    id: 12,
    title: "عرض الثنائي ميلك شيك",
    description: "اطلب ميلك شيكين واحصل على خصم 10% على الفاتورة كاملة",
    originalPrice: 20,
    salePrice: 18,
    image: oreoIce,
    category: "عروض خاصة",
    couponCode: "GLACE10",
    badge: "عرض الثنائي",
    orderHref: "/menu/order/milkshake",
  },
  {
    id: 13,
    title: "كنافة بوظة",
    description: "كنافة عربية أصيلة مع بوظة فانيلا وقطر عسل — تجربة فريدة",
    originalPrice: 20,
    salePrice: 16,
    image: iceCreamKunafa,
    category: "حلويات",
    featured: true,
  },
  {
    id: 14,
    title: "دوندورما بقلاوة",
    description: "بوظة دوندورما التركية الشهيرة مع البقلاوة — مزيج لا مثيل له",
    originalPrice: 18,
    salePrice: 14,
    image: dondurmaBasklava,
    category: "عروض خاصة",
    badge: "حصري",
  },
  {
    id: 15,
    title: "بوظة كراميل سبيشل",
    description: "كاسة وسط بطعم الكراميل الفاخر — حلاوة مضمونة",
    originalPrice: 7,
    salePrice: 5,
    image: caramelIce,
    category: "بوظة",
    orderHref: "/menu/order/cup",
  },
  {
    id: 16,
    title: "ميلك شيك كندر بوينو",
    description: "ميلك شيك بطعم كندر الشهير — الخيار المثالي لمحبي الشوكولاتة",
    originalPrice: 14,
    salePrice: 10,
    image: kinderBuenoIce,
    category: "ميلك شيك",
    orderHref: "/menu/order/milkshake",
  },
];

export const OFFER_CATEGORIES: OfferCategory[] = [
  "الكل", "بوظة", "ميلك شيك", "حلويات", "عروض خاصة",
];
