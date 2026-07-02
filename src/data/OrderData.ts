import type { StaticIMG } from "@/assets/images";
import {
  chocolateIce, vanillaaIce, strawberryIce, caramelIce,
  nescafeIce, coconutIce, mangoIce, bananaIce, grapeIce,
  bazookaIce, marioIce, lemonIce, arabianIce, nutellaIce,
  oreoIce, kitKatIce, floraIce, kinderBuenoIce, lotusIce, pistachioIce,
} from "@/assets/images";

export interface Flavor {
  id: number;
  name: string;
  image: StaticIMG;
  type: "classic" | "special";
  available?: boolean; // undefined / true = available, false = unavailable
}

export interface Addon {
  id: number;
  name: string;
  price: number;
}

export interface IceItem {
  id: number;
  size: "صغير" | "وسط" | "كبير" | "تيك اواي";
  type: "كلاسيك" | "سبيشال";
  maxBalls: number;
  balls: { flavorId: number; idRemove: number }[];
  addonIds: number[];
  quantity: number;
}

export interface LuqaimatItem {
  id: number;
  type: string;
  quantity: number;
}

export const LUQAIMAT_TYPES = [
  { value: "لقيمات نوتيلا", price: 10 },
  { value: "لقيمات لوتس", price: 12 },
  { value: "لقيمات بستاشيو", price: 15 },
  { value: "لقيمات مكس", price: 12 },
  { value: "لقيمات سوبر مكس", price: 15 },
] as const;

export const LUQAIMAT_PRICES: Record<string, number> = {
  "لقيمات نوتيلا": 10,
  "لقيمات لوتس": 12,
  "لقيمات بستاشيو": 15,
  "لقيمات مكس": 12,
  "لقيمات سوبر مكس": 15,
};

export const ICE_PRICES: Record<string, number> = {
  // كاسة
  "كاسة صغير.كلاسيك": 2,  "كاسة صغير.سبيشال": 4,
  "كاسة وسط.كلاسيك":  3,  "كاسة وسط.سبيشال":  5,
  "كاسة كبير.كلاسيك": 5,  "كاسة كبير.سبيشال": 7,
  "تيك اواي.كلاسيك":  5,  "تيك اواي.سبيشال":  7,
  // بسكوت
  "بسكوت صغير.كلاسيك": 2,
  "بسكوت وسط.كلاسيك":  3,  "بسكوت وسط.سبيشال":  5,
  "بسكوت كبير.كلاسيك": 5,  "بسكوت كبير.سبيشال": 7,
  // legacy keys (keep for backward compat)
  "صغير.كلاسيك": 3,
  "وسط.كلاسيك": 5,
  "كبير.كلاسيك": 7,
  "صغير.سبيشال": 5,
  "وسط.سبيشال": 7,
  "كبير.سبيشال": 9,
};

export const SIZE_MAX_BALLS: Record<string, number> = {
  "كاسة صغير": 1,
  "كاسة وسط":  2,
  "كاسة كبير": 3,
  "تيك اواي":  3,
  "بسكوت صغير": 1,
  "بسكوت وسط":  2,
  "بسكوت كبير": 3,
  // legacy
  صغير: 2,
  وسط: 3,
  كبير: 4,
};

export const CLASSIC_FLAVORS: Flavor[] = [
  { id: 1, name: "شوكولاتة", image: chocolateIce, type: "classic" },
  { id: 2, name: "فانيلا", image: vanillaaIce, type: "classic" },
  { id: 3, name: "فراولة", image: strawberryIce, type: "classic" },
  { id: 4, name: "كراميل", image: caramelIce, type: "classic" },
  { id: 5, name: "شوكلاته مره", image: chocolateIce, type: "classic" },
  { id: 6, name: "نسكافيه", image: nescafeIce, type: "classic" },
  { id: 7, name: "جوز هند", image: coconutIce, type: "classic" },
  { id: 8, name: "مانجا", image: mangoIce, type: "classic", available: false },
  { id: 9, name: "موز", image: bananaIce, type: "classic" },
  { id: 10, name: "عنب", image: grapeIce, type: "classic" },
  { id: 11, name: "بازوكا", image: bazookaIce, type: "classic" },
  { id: 12, name: "ماريو", image: marioIce, type: "classic" },
  { id: 13, name: "ليمون", image: lemonIce, type: "classic" },
  { id: 14, name: "فانيلا ستيفيا", image: vanillaaIce, type: "classic" },
  { id: 15, name: "نسكافيه ستيفيا", image: nescafeIce, type: "classic" },
];

export const SPECIAL_FLAVORS: Flavor[] = [
  { id: 16, name: "عربية", image: arabianIce, type: "special" },
  { id: 17, name: "نوتيلا", image: nutellaIce, type: "special" },
  { id: 18, name: "أوريو", image: oreoIce, type: "special" },
  { id: 19, name: "كت كات", image: kitKatIce, type: "special" },
  { id: 20, name: "فلوره", image: floraIce, type: "special", available: false },
  { id: 21, name: "كندر", image: kinderBuenoIce, type: "special" },
  { id: 22, name: "لوتس", image: lotusIce, type: "special" },
  { id: 23, name: "بيستاشيو", image: pistachioIce, type: "special" },
];

export const ADDONS: Addon[] = [
  { id: 1, name: "بكيت بسكوت 4 حبة", price: 3 },
  { id: 2, name: "بكيت بسكوت 6 حبة", price: 5 },
  { id: 3, name: "بكيت بسكوت 8 حبة", price: 7 },
  { id: 4, name: "إضافة صوص", price: 7 },
  { id: 5, name: "إضافة مكسرات", price: 7 },
];

export function getIceItemPrice(item: IceItem): number {
  const base = ICE_PRICES[`${item.size}.${item.type}`] ?? 0;
  const addonTotal = item.addonIds.reduce((sum, addonId) => {
    const addon = ADDONS.find((a) => a.id === addonId);
    return sum + (addon?.price ?? 0);
  }, 0);
  return (base + addonTotal) * item.quantity;
}

export function getLuqaimatItemPrice(item: LuqaimatItem): number {
  return (LUQAIMAT_PRICES[item.type] ?? 0) * item.quantity;
}
