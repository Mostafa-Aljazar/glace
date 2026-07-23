import {
  iceCreamCup,
  biscuitIceCream,
  familyIceCream,
  refrigerator,
  iceCream,
  milkshake,
  iceCreamKunafa,
  luqaimat,
  moltenCake,
  pancake,
  waffle,
  crepe,
  glassyPizza,
  coldDrinks,
  naturalJuices,
  hotDrinks,
  corn,
  browniesCake,
  mochi,
  sanSebastian,
  chocolateIce,
  vanillaaIce,
  strawberryIce,
  caramelIce,
  nescafeIce,
  coconutIce,
  mangoIce,
  bananaIce,
  grapeIce,
  bazookaIce,
  marioIce,
  lemonIce,
  arabianIce,
  nutellaIce,
  oreoIce,
  kitKatIce,
  floraIce,
  kinderBuenoIce,
  lotusIce,
  pistachioIce,
  blueberryIce,
  energyIce,
} from "@/assets/images";
import type {
  IBuilderProduct,
  IFlatListProduct,
  IFlavorOption,
  IMenuCategory,
  IProduct,
} from "@/types/menu.types";

// ─── Categories (16, ported 1:1 from menuApiData.ts's FAKE_CATEGORIES +
// MenuClientPage.tsx's CATEGORY_ICONS/CATEGORY_GRADIENTS/CATEGORY_ACCENT) ────

export const FAKE_MENU_CATEGORIES: IMenuCategory[] = [
  { id: "ice-cream", label: "آيس كريم", icon: "ice-cream", accentColor: "#51c9f4", gradientFrom: "#51c9f4", gradientTo: "#388dab", sortOrder: 1 },
  { id: "brad", label: "براد", icon: "glass-water", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 2 },
  { id: "brad-boza", label: "براد مع بوظة", icon: "glass-water", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 3 },
  { id: "cold-drinks", label: "مشروبات باردة", icon: "cup-soda", accentColor: "#51b4f4", gradientFrom: "#51b4f4", gradientTo: "#2a6eb0", sortOrder: 4 },
  { id: "hot-drinks", label: "مشروبات ساخنة", icon: "cup-soda", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 5 },
  { id: "juices", label: "عصائر طبيعية", icon: "apple", accentColor: "#3fbd59", gradientFrom: "#3fbd59", gradientTo: "#2a8540", sortOrder: 6 },
  { id: "corn", label: "ذرة", icon: "apple", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 7 },
  { id: "milkshake", label: "ميلك شيك", icon: "milk", accentColor: "#f4519f", gradientFrom: "#f4519f", gradientTo: "#b02f74", sortOrder: 8 },
  { id: "kunafa", label: "كنافة آيس كريم", icon: "cake", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 9 },
  { id: "loqaimat", label: "لقيمات", icon: "cake", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 10 },
  { id: "pancake", label: "بان كيك", icon: "cake", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 11 },
  { id: "waffle", label: "وافل", icon: "cake", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 12 },
  { id: "crepe", label: "كريب", icon: "cake", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 13 },
  { id: "pizza", label: "بيتزا جلاسيه", icon: "cake", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 14 },
  { id: "molten", label: "مولتن كيك", icon: "cake", accentColor: "#f4a851", gradientFrom: "#f4a851", gradientTo: "#c97d2a", sortOrder: 15 },
  { id: "desserts", label: "حلويات", icon: "cake", accentColor: "#da51f4", gradientFrom: "#da51f4", gradientTo: "#9a2fb0", sortOrder: 16 },
];

// ─── Global flavor catalog (ported from OrderData.ts's CLASSIC_FLAVORS +
// SPECIAL_FLAVORS). Feeds the Cup/Family/Brad-boza flavor-ball picker. ─────

export const FAKE_FLAVORS: IFlavorOption[] = [
  { id: "chocolate", nameAr: "شوكولاتة", nameEn: "Chocolate", image: chocolateIce, family: "classic", available: true },
  { id: "vanilla", nameAr: "فانيلا", nameEn: "Vanilla", image: vanillaaIce, family: "classic", available: true },
  { id: "strawberry", nameAr: "فراولة", nameEn: "Strawberry", image: strawberryIce, family: "classic", available: true },
  { id: "caramel", nameAr: "كراميل", nameEn: "Caramel", image: caramelIce, family: "classic", available: true },
  { id: "dark-chocolate", nameAr: "شوكلاته مره", nameEn: "Dark Chocolate", image: chocolateIce, family: "classic", available: true },
  { id: "nescafe", nameAr: "نسكافيه", nameEn: "Nescafe", image: nescafeIce, family: "classic", available: true },
  { id: "coconut", nameAr: "جوز هند", nameEn: "Coconut", image: coconutIce, family: "classic", available: true },
  { id: "mango", nameAr: "مانجا", nameEn: "Mango", image: mangoIce, family: "classic", available: false },
  { id: "banana", nameAr: "موز", nameEn: "Banana", image: bananaIce, family: "classic", available: true },
  { id: "grape", nameAr: "عنب", nameEn: "Grape", image: grapeIce, family: "classic", available: true },
  { id: "bazooka", nameAr: "بازوكا", nameEn: "Bazooka", image: bazookaIce, family: "classic", available: true },
  { id: "mario", nameAr: "ماريو", nameEn: "Mario", image: marioIce, family: "classic", available: true },
  { id: "lemon", nameAr: "ليمون", nameEn: "Lemon", image: lemonIce, family: "classic", available: true },
  { id: "vanilla-stevia", nameAr: "فانيلا ستيفيا", nameEn: "Vanilla Stevia", image: vanillaaIce, family: "stevia", available: true },
  { id: "nescafe-stevia", nameAr: "نسكافيه ستيفيا", nameEn: "Nescafe Stevia", image: nescafeIce, family: "stevia", available: true },
  { id: "arabian", nameAr: "عربية", nameEn: "Arabian", image: arabianIce, family: "special", available: true },
  { id: "nutella", nameAr: "نوتيلا", nameEn: "Nutella", image: nutellaIce, family: "special", available: true },
  { id: "oreo", nameAr: "أوريو", nameEn: "Oreo", image: oreoIce, family: "special", available: true },
  { id: "kitkat", nameAr: "كت كات", nameEn: "KitKat", image: kitKatIce, family: "special", available: true },
  { id: "flora", nameAr: "فلوره", nameEn: "Flora", image: floraIce, family: "special", available: false },
  { id: "kinder", nameAr: "كندر", nameEn: "Kinder Bueno", image: kinderBuenoIce, family: "special", available: true },
  { id: "lotus", nameAr: "لوتس", nameEn: "Lotus", image: lotusIce, family: "special", available: true },
  { id: "pistachio", nameAr: "بيستاشيو", nameEn: "Pistachio", image: pistachioIce, family: "special", available: true, isPremiumMixFlavor: true },
];

// ─── Ice-cream builder products ────────────────────────────────────────────

const cup: IBuilderProduct = {
  id: "cup",
  categoryId: "ice-cream",
  kind: "builder",
  name: "بوظة كاسة",
  image: iceCreamCup,
  sortOrder: 1,
  available: true,
  hasNotes: true,
  containerOptions: [
    { id: "cup", label: "كاسة", available: true, name: "بوظة كاسة", image: iceCreamCup, pricingLabel: "الكاسة" },
    { id: "biscuit", label: "بسكوت", available: true, name: "بوظة بسكوت", image: biscuitIceCream, pricingLabel: "البسكوت" },
    { id: "takeaway", label: "تيك اواي", available: true, name: "بوظة تيك اواي", image: iceCreamCup, pricingLabel: "التيك اواي" },
  ],
  sizes: [
    { id: "cup-small", label: "صغير", maxBalls: 1, containerId: "cup", prices: [{ flavorFamily: "classic", price: 2 }, { flavorFamily: "special", price: 4 }] },
    { id: "cup-medium", label: "وسط", maxBalls: 2, containerId: "cup", prices: [{ flavorFamily: "classic", price: 3 }, { flavorFamily: "special", price: 5 }] },
    { id: "cup-large", label: "كبير", maxBalls: 3, containerId: "cup", prices: [{ flavorFamily: "classic", price: 5 }, { flavorFamily: "special", price: 7 }] },
    { id: "biscuit-small", label: "صغير", maxBalls: 1, containerId: "biscuit", prices: [{ flavorFamily: "classic", price: 2 }] },
    { id: "biscuit-medium", label: "وسط", maxBalls: 2, containerId: "biscuit", prices: [{ flavorFamily: "classic", price: 3 }, { flavorFamily: "special", price: 5 }] },
    { id: "biscuit-large", label: "كبير", maxBalls: 3, containerId: "biscuit", prices: [{ flavorFamily: "classic", price: 5 }, { flavorFamily: "special", price: 7 }] },
    { id: "takeaway-size", label: "تيك اواي", maxBalls: 3, containerId: "takeaway", prices: [{ flavorFamily: "classic", price: 5 }, { flavorFamily: "special", price: 7 }] },
  ],
  selectionMode: "repeatable",
  flavorFamilies: ["classic", "special", "mix"],
  hasExtraBiscuitAddon: true,
};

const family: IBuilderProduct = {
  id: "family",
  categoryId: "ice-cream",
  kind: "builder",
  name: "بوظة عائلي",
  image: familyIceCream,
  sortOrder: 2,
  available: true,
  hasNotes: true,
  containerOptions: [
    { id: "classic-container", label: "كلاسيكس", available: true, pricingLabel: "الكلاسيكس" },
    { id: "flin", label: "فلين", available: false, pricingLabel: "الفلين" },
  ],
  sizes: [
    { id: "half-liter", label: "1/2 لتر", maxBalls: 8, containerId: "classic-container", prices: [{ flavorFamily: "classic", price: 14 }, { flavorFamily: "special", price: 18 }, { flavorFamily: "mix", price: 16 }] },
    { id: "one-liter", label: "1 لتر", maxBalls: 12, containerId: "classic-container", prices: [{ flavorFamily: "classic", price: 28 }, { flavorFamily: "special", price: 35 }, { flavorFamily: "mix", price: 32 }] },
    { id: "half-liter-flin", label: "1/2 لتر", maxBalls: 8, containerId: "flin", prices: [{ flavorFamily: "classic", price: 16 }, { flavorFamily: "special", price: 20 }, { flavorFamily: "mix", price: 18 }] },
    { id: "one-liter-flin", label: "1 لتر", maxBalls: 12, containerId: "flin", prices: [{ flavorFamily: "classic", price: 31 }, { flavorFamily: "special", price: 38 }, { flavorFamily: "mix", price: 35 }] },
  ],
  selectionMode: "repeatable",
  flavorFamilies: ["classic", "special", "mix"],
  hasExtraBiscuitAddon: true,
};

// ─── Brad / Brad-boza ───────────────────────────────────────────────────────

const brad: IBuilderProduct = {
  id: "brad",
  categoryId: "brad",
  kind: "builder",
  name: "براد",
  image: refrigerator,
  sortOrder: 1,
  available: true,
  pricingLabel: "البراد",
  containerOptions: [
    { id: "lemon", label: "ليمون", available: true },
    { id: "mango", label: "مانجا", available: true },
    { id: "mix", label: "مكس", available: true },
  ],
  sizes: [
    { id: "small", label: "صغير", maxBalls: 0, prices: [{ flavorFamily: "classic", price: 1 }] },
    { id: "medium", label: "وسط", maxBalls: 0, prices: [{ flavorFamily: "classic", price: 2 }] },
    { id: "large", label: "كبير", maxBalls: 0, prices: [{ flavorFamily: "classic", price: 3 }] },
  ],
};

const bradBoza: IBuilderProduct = {
  id: "brad-boza",
  categoryId: "brad-boza",
  kind: "builder",
  name: "براد مع بوظة",
  image: iceCream,
  sortOrder: 1,
  available: true,
  pricingLabel: "البراد",
  includesIceCreamStep: true,
  iceCreamAddonPrices: [
    { flavorFamily: "classic", price: 3 },
    { flavorFamily: "special", price: 5 },
    { flavorFamily: "mix", price: 4 },
  ],
  containerOptions: [
    { id: "lemon", label: "ليمون", available: true },
    { id: "mango", label: "مانجا", available: true },
    { id: "mix", label: "مكس", available: true },
  ],
  sizes: [
    { id: "small", label: "صغير", maxBalls: 2, prices: [{ flavorFamily: "classic", price: 1 }] },
    { id: "medium", label: "وسط", maxBalls: 3, prices: [{ flavorFamily: "classic", price: 2 }] },
    { id: "large", label: "كبير", maxBalls: 4, prices: [{ flavorFamily: "classic", price: 3 }] },
  ],
  selectionMode: "toggle",
  flavorFamilies: ["classic", "special", "mix"],
};

// ─── Flat-list products ─────────────────────────────────────────────────────

const coldDrinksProduct: IFlatListProduct = {
  id: "cold-drinks",
  categoryId: "cold-drinks",
  kind: "flat-list",
  name: "مشروبات باردة",
  image: coldDrinks,
  sortOrder: 1,
  available: true,
  hasFavorites: true,
  hasImageZoom: true,
  hasNotes: true,
  items: [
    { label: "آيس كوفي كراميل", price: 8, image: caramelIce, available: true },
    { label: "آيس موكا", price: 8, image: nescafeIce, available: true },
    { label: "سبانش لاتيه كراميل", price: 10, image: caramelIce, available: true },
    { label: "بوبا شيك كوفي/فراولة", price: 12, image: chocolateIce, available: true },
    { label: "مياه صغيرة", price: 1, image: coconutIce, available: true },
  ],
};

const hotDrinksProduct: IFlatListProduct = {
  id: "hot-drinks",
  categoryId: "hot-drinks",
  kind: "flat-list",
  name: "مشروبات ساخنة",
  image: hotDrinks,
  sortOrder: 1,
  available: true,
  hasFavorites: true,
  hasImageZoom: true,
  hasNotes: true,
  items: [
    { label: "قهوة عربية", price: 5, image: caramelIce, available: true },
    { label: "نسكافيه حار", price: 6, image: nescafeIce, available: true },
    { label: "شاي", price: 4, image: lemonIce, available: true },
    { label: "هوت شوكولاتة", price: 8, image: chocolateIce, available: true },
  ],
};

const juicesProduct: IFlatListProduct = {
  id: "juices",
  categoryId: "juices",
  kind: "flat-list",
  name: "عصائر طبيعية",
  image: naturalJuices,
  sortOrder: 1,
  available: true,
  hasFavorites: true,
  hasImageZoom: true,
  hasNotes: true,
  items: [
    { label: "فراولة", price: 5, image: strawberryIce, available: true },
    { label: "بلوليمونادا", price: 6, image: lemonIce, available: true },
    { label: "مانجا", price: 7, image: mangoIce, available: true },
  ],
};

const cornProduct: IFlatListProduct = {
  id: "corn",
  categoryId: "corn",
  kind: "flat-list",
  name: "ذرة",
  image: corn,
  sortOrder: 1,
  available: true,
  hasFavorites: true,
  hasImageZoom: true,
  hasNotes: true,
  items: [
    { label: "ذرة سادة", price: 5, image: corn, available: true },
    { label: "ذرة بالجبنة", price: 7, image: corn, available: true },
    { label: "ذرة بالشوكولاتة", price: 8, image: chocolateIce, available: true },
  ],
};

const milkshakeProduct: IFlatListProduct = {
  id: "milkshake",
  categoryId: "milkshake",
  kind: "flat-list",
  name: "ميلك شيك",
  image: milkshake,
  sortOrder: 1,
  available: true,
  hasFavorites: true,
  hasImageZoom: true,
  items: [
    { label: "كلاسيك شوكولاته", price: 8, image: chocolateIce, available: true },
    { label: "كلاسيك فانيلا", price: 8, image: vanillaaIce, available: true },
    { label: "كلاسيك فراولة", price: 8, image: strawberryIce, available: false },
    { label: "كلاسيك كاراميل", price: 8, image: caramelIce, available: true },
    { label: "كلاسيك نسكافيه", price: 8, image: nescafeIce, available: true },
    { label: "كلاسيك باروكا", price: 8, image: caramelIce, available: false },
    { label: "سبيشال نوتيلا", price: 10, image: nutellaIce, available: true },
    { label: "سبيشال لوتس", price: 10, image: lotusIce, available: true },
    { label: "سبيشال كندر", price: 10, image: kinderBuenoIce, available: true },
    { label: "سبيشال أوريو", price: 10, image: oreoIce, available: false },
    { label: "سبيشال كت كات", price: 10, image: kitKatIce, available: true },
    { label: "سبيشال فيتنس", price: 10, image: nescafeIce, available: true },
    { label: "سبيشال شوفان", price: 10, image: nutellaIce, available: true },
    // page-local "special flavors" (سيرلاك/اينشتاين/بيستاشيو) — a different,
    // unrelated data set from the global SPECIAL_FLAVORS despite the name
    // collision in the legacy code; these are just 3 more milkshake variants.
    { label: "سيرلاك (أطعم خاصة)", price: 8, image: marioIce, available: true },
    { label: "اينشتاين (أطعم خاصة)", price: 9, image: marioIce, available: true },
    { label: "بيستاشيو (أطعم خاصة)", price: 13, image: pistachioIce, available: true },
  ],
};

const kunafaProduct: IFlatListProduct = {
  id: "kunafa",
  categoryId: "kunafa",
  kind: "flat-list",
  name: "كنافة آيس كريم",
  image: iceCreamKunafa,
  sortOrder: 1,
  available: true,
  hasFavorites: true,
  hasNotes: true,
  items: [
    { label: "كنافة عربية", price: 8, image: arabianIce, available: true },
    { label: "كنافة لوتس", price: 8, image: lotusIce, available: true },
    { label: "كنافة نوتيلا", price: 8, image: nutellaIce, available: true },
    { label: "كنافة بلوبيري", price: 8, image: blueberryIce, available: false },
    { label: "كنافة دوندورما بيستاشيو", price: 12, image: pistachioIce, available: true, isPremiumMixFlavor: true },
    { label: "كنافة طاقة (كل خميس)", price: 12, image: energyIce, available: false },
  ],
  mixes: [
    {
      id: "mix",
      label: "مكس (اختر طعمين)",
      pick: 2,
      basePrice: 10,
      flavorPrice: 5,
      premiumFlavorPrice: 8,
      flavorOptionIds: ["كنافة عربية", "كنافة لوتس", "كنافة نوتيلا", "كنافة بلوبيري", "كنافة دوندورما بيستاشيو", "كنافة طاقة (كل خميس)"],
    },
  ],
};

const loqaimatProduct: IFlatListProduct = {
  id: "loqaimat",
  categoryId: "loqaimat",
  kind: "flat-list",
  name: "لقيمات",
  image: luqaimat,
  sortOrder: 1,
  available: true,
  hasFavorites: true,
  hasNotes: true,
  items: [
    { label: "لقيمة عربية", price: 8, image: arabianIce, available: true },
    { label: "لقيمة لوتس", price: 8, image: lotusIce, available: true },
    { label: "لقيمة نوتيلا", price: 8, image: nutellaIce, available: true },
    { label: "لقيمة بلوبيري", price: 8, image: blueberryIce, available: false },
    { label: "لقيمة دوندورما بيستاشيو", price: 12, image: pistachioIce, available: true, isPremiumMixFlavor: true },
    { label: "لقيمة طاقة (كل خميس)", price: 12, image: energyIce, available: false },
  ],
  mixes: [
    {
      id: "mix",
      label: "مكس (اختر طعمين)",
      pick: 2,
      basePrice: 10,
      flavorPrice: 5,
      premiumFlavorPrice: 8,
      flavorOptionIds: ["لقيمة عربية", "لقيمة لوتس", "لقيمة نوتيلا", "لقيمة بلوبيري", "لقيمة دوندورما بيستاشيو", "لقيمة طاقة (كل خميس)"],
    },
    {
      id: "super-mix",
      label: "سوبر مكس (اختر ثلاثة أطعمة)",
      pick: 3,
      basePrice: 15,
      flavorPrice: 5,
      premiumFlavorPrice: 8,
      flavorOptionIds: ["لقيمة عربية", "لقيمة لوتس", "لقيمة نوتيلا", "لقيمة بلوبيري", "لقيمة دوندورما بيستاشيو", "لقيمة طاقة (كل خميس)"],
    },
  ],
};

function dessertMixes(
  base2: number, flavor2: number, premium2: number,
  base3: number, flavor3: number, premium3: number,
  options: string[],
) {
  return [
    { id: "mix", label: "مكس", pick: 2, basePrice: base2, flavorPrice: flavor2, premiumFlavorPrice: premium2, flavorOptionIds: options },
    { id: "super-mix", label: "سوبر مكس", pick: 3, basePrice: base3, flavorPrice: flavor3, premiumFlavorPrice: premium3, flavorOptionIds: options },
  ];
}

const NUTELLA_LOTUS_PISTACHIO = ["نوتيلا", "لوتس", "بيستاشيو"];

const pancakeProduct: IFlatListProduct = {
  id: "pancake",
  categoryId: "pancake",
  kind: "flat-list",
  name: "بان كيك",
  image: pancake,
  sortOrder: 1,
  available: true,
  inStoreOnly: true,
  hasFavorites: true,
  hasNotes: true,
  items: [
    { label: "نوتيلا", price: 11, image: nutellaIce, available: true },
    { label: "لوتس", price: 13, image: lotusIce, available: true },
    { label: "بيستاشيو", price: 17, image: pistachioIce, available: true, isPremiumMixFlavor: true },
  ],
  mixes: dessertMixes(14, 7, 11, 18, 6, 10, NUTELLA_LOTUS_PISTACHIO),
};

const waffleProduct: IFlatListProduct = {
  id: "waffle",
  categoryId: "waffle",
  kind: "flat-list",
  name: "وافل",
  image: waffle,
  sortOrder: 1,
  available: true,
  inStoreOnly: true,
  hasFavorites: true,
  hasNotes: true,
  items: [
    { label: "نوتيلا", price: 10, image: nutellaIce, available: true },
    { label: "لوتس", price: 12, image: lotusIce, available: true },
    { label: "بيستاشيو", price: 14, image: pistachioIce, available: true, isPremiumMixFlavor: true },
  ],
  mixes: dessertMixes(14, 7, 11, 15, 5, 9, NUTELLA_LOTUS_PISTACHIO),
};

const crepeProduct: IFlatListProduct = {
  id: "crepe",
  categoryId: "crepe",
  kind: "flat-list",
  name: "كريب",
  image: crepe,
  sortOrder: 1,
  available: true,
  inStoreOnly: true,
  hasFavorites: true,
  hasNotes: true,
  items: [
    { label: "نوتيلا", price: 9, image: nutellaIce, available: true },
    { label: "لوتس", price: 11, image: lotusIce, available: true },
    { label: "بيستاشيو", price: 13, image: pistachioIce, available: true, isPremiumMixFlavor: true },
  ],
  mixes: dessertMixes(12, 6, 10, 15, 5, 9, NUTELLA_LOTUS_PISTACHIO),
};

const pizzaProduct: IFlatListProduct = {
  id: "pizza",
  categoryId: "pizza",
  kind: "flat-list",
  name: "بيتزا جلاسيه",
  image: glassyPizza,
  sortOrder: 1,
  available: true,
  inStoreOnly: true,
  hasFavorites: true,
  hasNotes: true,
  items: [
    { label: "نوتيلا", price: 12, image: nutellaIce, available: true },
    { label: "لوتس", price: 14, image: lotusIce, available: true },
    { label: "بيستاشيو", price: 16, image: pistachioIce, available: true, isPremiumMixFlavor: true },
  ],
  mixes: dessertMixes(16, 8, 12, 18, 6, 10, NUTELLA_LOTUS_PISTACHIO),
};

const moltenProduct: IFlatListProduct = {
  id: "molten",
  categoryId: "molten",
  kind: "flat-list",
  name: "مولتن كيك",
  image: moltenCake,
  sortOrder: 1,
  available: true,
  inStoreOnly: true,
  hasFavorites: true,
  hasNotes: true,
  items: [
    { label: "نوتيلا", price: 8, image: nutellaIce, description: "كيك شوكولاتة دافئ بقلب سائل مع بوظة فانيلا", available: true },
    { label: "لوتس", price: 12, image: lotusIce, description: "كيك شوكولاتة دافئ بقلب سائل مع بوظة لوتس", available: true },
    { label: "بستاشيو", price: 12, image: pistachioIce, description: "كيك شوكولاتة دافئ بقلب سائل مع بوظة بستاشيو", available: true },
  ],
};

const brownieProduct: IFlatListProduct = {
  id: "brownie",
  categoryId: "desserts",
  kind: "flat-list",
  name: "براونيز",
  image: browniesCake,
  sortOrder: 1,
  available: true,
  hasFavorites: true,
  hasImageZoom: true,
  items: [
    { label: "براونيز عادي", price: 8, image: chocolateIce, available: true },
    { label: "براونيز نوتيلا", price: 10, image: nutellaIce, available: true },
    { label: "براونيز لوتس", price: 10, image: lotusIce, available: true },
  ],
};

const cookiesProduct: IFlatListProduct = {
  id: "cookies",
  categoryId: "desserts",
  kind: "flat-list",
  name: "كوكيز",
  image: mochi,
  sortOrder: 2,
  available: true,
  hasFavorites: true,
  hasImageZoom: true,
  items: [
    { label: "كوكيز نوتيلا", price: 8, image: nutellaIce, available: true },
    { label: "كوكيز لوتس", price: 10, image: lotusIce, available: true },
    { label: "كوكيز بيستاشيو", price: 12, image: pistachioIce, available: true },
    { label: "كوكيز مكس", price: 10, image: chocolateIce, available: true },
  ],
};

const cheesecakeProduct: IFlatListProduct = {
  id: "cheesecake",
  categoryId: "desserts",
  kind: "flat-list",
  name: "تشيز كيك",
  image: sanSebastian,
  sortOrder: 3,
  available: true,
  hasFavorites: true,
  hasImageZoom: true,
  items: [
    { label: "تشيز كيك فراولة", price: 12, image: strawberryIce, available: true },
    { label: "تشيز كيك لوتس", price: 14, image: lotusIce, available: true },
    { label: "تشيز كيك بيستاشيو", price: 16, image: pistachioIce, available: true },
    { label: "تشيز كيك مكس", price: 14, image: chocolateIce, available: true },
  ],
};

export const FAKE_PRODUCTS: IProduct[] = [
  cup,
  family,
  brad,
  bradBoza,
  coldDrinksProduct,
  hotDrinksProduct,
  juicesProduct,
  cornProduct,
  milkshakeProduct,
  kunafaProduct,
  loqaimatProduct,
  pancakeProduct,
  waffleProduct,
  crepeProduct,
  pizzaProduct,
  moltenProduct,
  brownieProduct,
  cookiesProduct,
  cheesecakeProduct,
];
