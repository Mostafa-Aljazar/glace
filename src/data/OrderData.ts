import type { StaticIMG } from "@/assets/images";
import {
  chocolateIce, vanillaaIce, strawberryIce, caramelIce,
  nescafeIce, coconutIce, mangoIce, bananaIce, grapeIce,
  bazookaIce, marioIce, lemonIce, arabianIce, nutellaIce,
  oreoIce, kitKatIce, floraIce, kinderBuenoIce, lotusIce, pistachioIce,
  blueberryIce, energyIce,
  luqaimat, pancake, waffle, crepe, glassyPizza, iceCreamKunafa, moltenCake,
  coldDrinks, naturalJuices,
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

export const BISCUIT_PACK_ADDONS = ADDONS.filter((a) => a.id <= 3);
export const EXTRA_BISCUIT_UNIT_PRICE = 1;

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

export interface SimpleMenuItem {
  label: string;
  price: number;
  description?: string;
  image?: StaticIMG;
  available?: boolean;
}

export interface MixConfig {
  label: string;
  pick: number;
  /** Base total when all picked flavors use the regular flavor price */
  price: number;
  /** Price of each regular flavor inside the mix */
  flavorPrice: number;
  /** Special price for pistachio / بستاشيو flavors inside the mix */
  pistachioPrice: number;
  options: string[];
  optionImages?: Partial<Record<string, StaticIMG>>;
}

export function isPistachioFlavor(label: string): boolean {
  return label.includes("بيستاشيو") || label.includes("بستاشيو");
}

export function getMixFlavorPrice(mix: MixConfig, flavor: string): number {
  return isPistachioFlavor(flavor) ? mix.pistachioPrice : mix.flavorPrice;
}

export function getMixSelectionPrice(mix: MixConfig, flavors: string[]): number {
  return flavors.reduce((sum, flavor) => sum + getMixFlavorPrice(mix, flavor), 0);
}

export interface DessertCategoryConfig {
  id: string;
  label: string;
  image: StaticIMG;
  items: SimpleMenuItem[];
  mixes?: MixConfig[];
  hasAddons?: boolean;
  hasNotes?: boolean;
}

export const DESSERT_CATEGORIES_V2: DessertCategoryConfig[] = [
  {
    id: "pancake",
    label: "بان كيك",
    image: pancake,
    items: [
      { label: "نوتيلا", price: 11, image: nutellaIce },
      { label: "لوتس", price: 13, image: lotusIce },
      { label: "بيستاشيو", price: 17, image: pistachioIce },
    ],
    mixes: [
      {
        label: "مكس",
        pick: 2,
        price: 14,
        flavorPrice: 7,
        pistachioPrice: 11,
        options: ["نوتيلا", "لوتس", "بيستاشيو"],
        optionImages: {
          "نوتيلا": nutellaIce,
          "لوتس": lotusIce,
          "بيستاشيو": pistachioIce,
        },
      },
      {
        label: "سوبر مكس",
        pick: 3,
        price: 18,
        flavorPrice: 6,
        pistachioPrice: 10,
        options: ["نوتيلا", "لوتس", "بيستاشيو"],
        optionImages: {
          "نوتيلا": nutellaIce,
          "لوتس": lotusIce,
          "بيستاشيو": pistachioIce,
        },
      },
    ],
    hasAddons: true,
    hasNotes: true,
  },
  {
    id: "waffle",
    label: "وافل",
    image: waffle,
    items: [
      { label: "نوتيلا", price: 10, image: nutellaIce },
      { label: "لوتس", price: 12, image: lotusIce },
      { label: "بيستاشيو", price: 14, image: pistachioIce },
    ],
    mixes: [
      {
        label: "مكس",
        pick: 2,
        price: 14,
        flavorPrice: 7,
        pistachioPrice: 11,
        options: ["نوتيلا", "لوتس", "بيستاشيو"],
        optionImages: {
          "نوتيلا": nutellaIce,
          "لوتس": lotusIce,
          "بيستاشيو": pistachioIce,
        },
      },
      {
        label: "سوبر مكس",
        pick: 3,
        price: 15,
        flavorPrice: 5,
        pistachioPrice: 9,
        options: ["نوتيلا", "لوتس", "بيستاشيو"],
        optionImages: {
          "نوتيلا": nutellaIce,
          "لوتس": lotusIce,
          "بيستاشيو": pistachioIce,
        },
      },
    ],
    hasAddons: true,
    hasNotes: true,
  },
  {
    id: "crepe",
    label: "كريب",
    image: crepe,
    items: [
      { label: "نوتيلا", price: 9, image: nutellaIce },
      { label: "لوتس", price: 11, image: lotusIce },
      { label: "بيستاشيو", price: 13, image: pistachioIce },
    ],
    mixes: [
      {
        label: "مكس",
        pick: 2,
        price: 12,
        flavorPrice: 6,
        pistachioPrice: 10,
        options: ["نوتيلا", "لوتس", "بيستاشيو"],
        optionImages: {
          "نوتيلا": nutellaIce,
          "لوتس": lotusIce,
          "بيستاشيو": pistachioIce,
        },
      },
      {
        label: "سوبر مكس",
        pick: 3,
        price: 15,
        flavorPrice: 5,
        pistachioPrice: 9,
        options: ["نوتيلا", "لوتس", "بيستاشيو"],
        optionImages: {
          "نوتيلا": nutellaIce,
          "لوتس": lotusIce,
          "بيستاشيو": pistachioIce,
        },
      },
    ],
    hasAddons: true,
    hasNotes: true,
  },
  {
    id: "pizza",
    label: "بيتزا جلاسيه",
    image: glassyPizza,
    items: [
      { label: "نوتيلا", price: 12, image: nutellaIce },
      { label: "لوتس", price: 14, image: lotusIce },
      { label: "بيستاشيو", price: 16, image: pistachioIce },
    ],
    mixes: [
      {
        label: "مكس",
        pick: 2,
        price: 16,
        flavorPrice: 8,
        pistachioPrice: 12,
        options: ["نوتيلا", "لوتس", "بيستاشيو"],
        optionImages: {
          "نوتيلا": nutellaIce,
          "لوتس": lotusIce,
          "بيستاشيو": pistachioIce,
        },
      },
      {
        label: "سوبر مكس",
        pick: 3,
        price: 18,
        flavorPrice: 6,
        pistachioPrice: 10,
        options: ["نوتيلا", "لوتس", "بيستاشيو"],
        optionImages: {
          "نوتيلا": nutellaIce,
          "لوتس": lotusIce,
          "بيستاشيو": pistachioIce,
        },
      },
    ],
    hasAddons: true,
    hasNotes: true,
  },
  {
    id: "molten",
    label: "مولتن كيك",
    image: moltenCake,
    items: [
      { label: "نوتيلا", price: 8, image: nutellaIce, description: "كيك شوكولاتة دافئ بقلب سائل مع بوظة فانيلا" },
      { label: "لوتس", price: 12, image: lotusIce, description: "كيك شوكولاتة دافئ بقلب سائل مع بوظة لوتس" },
      { label: "بستاشيو", price: 12, image: pistachioIce, description: "كيك شوكولاتة دافئ بقلب سائل مع بوظة بستاشيو" },
    ],
    hasAddons: false,
    hasNotes: true,
  },
  {
    id: "cold-drinks",
    label: "مشروبات باردة",
    image: coldDrinks,
    items: [
      { label: "آيس كوفي كراميل", price: 8, image: caramelIce },
      { label: "آيس موكا", price: 8, image: nescafeIce },
      { label: "سبانش لاتيه كراميل", price: 10, image: caramelIce },
      { label: "بوبا شيك كوفي/فراولة", price: 12, image: chocolateIce },
      { label: "مياه صغيرة", price: 1, image: coconutIce },
    ],
    hasAddons: false,
    hasNotes: true,
  },
  {
    id: "juices",
    label: "عصائر طبيعية",
    image: naturalJuices,
    items: [
      { label: "فراولة", price: 5, image: strawberryIce },
      { label: "بلوليمونادا", price: 6, image: lemonIce },
      { label: "مانجا", price: 7, image: mangoIce },
    ],
    hasAddons: false,
    hasNotes: true,
  },
];
