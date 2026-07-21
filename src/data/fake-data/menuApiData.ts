import {
  iceCreamCup, iceCream, specialIceCream, classicIceCream, stevia,
  biscuitIceCream, familyIceCream, refrigerator,
  naturalJuices, coldDrinks, milkshake,
  iceCreamKunafa, luqaimat, moltenCake, pancake, waffle, crepe,
  browniesCake, glassyPizza, mochi, sanSebastian, dondurmaBasklava,
  arabianIce, nutellaIce, lotusIce, pistachioIce, snickersIce,
  kinderBuenoIce, floraIce, blueberryIce, bountyIce, oreoIce,
  kitKatIce, energyIce, chocolateIce, vanillaaIce, darkIce,
  caramelIce, lemonIce, coconutIce, grapeIce, bazookaIce,
  strawberryIce, coktailIce, bananaIce, mangoIce, nescafeIce, marioIce,
} from "@/assets/images";

export interface ApiMenuCategory {
  id: string;
  label: string;
  slug: "ice-cream" | "brad" | "brad-boza" | "milkshake" | "kunafa" | "loqaimat" | "pancake" | "waffle" | "crepe" | "pizza" | "molten" | "cold-drinks" | "juices" | "desserts" | "hot-drinks" | "corn" | "other-addons" | "new";
}

export interface ApiFlavorCard {
  nameAr: string;
  nameEn: string;
  image: typeof chocolateIce;
}

export interface ApiPriceRow {
  label: string;
  classic?: string | number;
  special?: string | number;
  price?: string | number;
}

export interface ApiMenuItem {
  id: string;
  name: string;
  image: typeof iceCreamCup;
  modalType: "table" | "flavors" | "confirmation";
  category: "ice-cream" | "brad" | "brad-boza" | "milkshake" | "kunafa" | "loqaimat" | "pancake" | "waffle" | "crepe" | "pizza" | "molten" | "cold-drinks" | "juices" | "desserts" | "hot-drinks" | "corn" | "other-addons" | "new";
  tableHeaders?: string[];
  priceRows?: ApiPriceRow[];
  flavors?: ApiFlavorCard[];
  orderHref?: string;
  confirmationModal?: boolean;
}

// ─── Fake API data ──────────────────────────────────────────────────

export const FAKE_CATEGORIES: ApiMenuCategory[] = [
  { id: "ice-cream",   label: "آيس كريم",        slug: "ice-cream"   },
  { id: "brad",        label: "براد",             slug: "brad"        },
  { id: "brad-boza",   label: "براد مع بوظة",    slug: "brad-boza"   },
  { id: "milkshake",   label: "ميلك شيك",         slug: "milkshake"   },
  { id: "kunafa",      label: "كنافة آيس كريم",  slug: "kunafa"      },
  { id: "loqaimat",    label: "لقيمات",           slug: "loqaimat"    },
  { id: "pancake",     label: "بان كيك",          slug: "pancake"     },
  { id: "waffle",      label: "وافل",             slug: "waffle"      },
  { id: "crepe",       label: "كريب",             slug: "crepe"       },
  { id: "pizza",       label: "بيتزا جلاسيه",     slug: "pizza"       },
  { id: "molten",      label: "مولتن كيك",        slug: "molten"      },
  { id: "cold-drinks", label: "مشروبات باردة",    slug: "cold-drinks" },
  { id: "juices",      label: "عصائر طبيعية",     slug: "juices"      },
  { id: "desserts",    label: "حلويات",            slug: "desserts"    },
  { id: "hot-drinks",  label: "مشروبات ساخنة",    slug: "hot-drinks"  },
  { id: "corn",        label: "ذرة",               slug: "corn"        },
  { id: "other-addons", label: "اضافات اخرى",     slug: "other-addons" },
  { id: "new",         label: "جديدنا",            slug: "new"         },
];

export const FAKE_MENU_ITEMS: ApiMenuItem[] = [
  // ── ICE CREAM ─────────────────────────────────────────────────────
  {
    id: "cup",
    name: "بوظة كاسة",
    image: iceCreamCup,
    modalType: "table",
    category: "ice-cream",
    tableHeaders: ["الحجم", "أطعم كلاسيك", "أطعم سبيشال"],
    priceRows: [
      { label: "صغير   (2 كورة)", classic: 3, special: 5 },
      { label: "وسط   (3 كورة)",  classic: 5, special: 7 },
      { label: "كبير   (4 كورة)", classic: 7, special: 9 },
    ],
    orderHref: "/menu/order-cup",
  },
  {
    id: "biscuit",
    name: "بوظة بسكويت",
    image: biscuitIceCream,
    modalType: "table",
    category: "ice-cream",
    tableHeaders: ["", "كلاسيك", "سبيشال"],
    priceRows: [
      { label: "صغير",    classic: 2, special: "-" },
      { label: "وسط",     classic: 3, special: 5  },
      { label: "كبير",    classic: 5, special: 7  },
      { label: "إكس لارج", classic: 7, special: 9 },
    ],
    orderHref: "/menu/order-cup?type=بسكوت",
  },
  // brad items moved to "brad" category below
  {
    id: "family",
    name: "بوظة عائلي",
    image: familyIceCream,
    modalType: "table",
    category: "ice-cream",
    tableHeaders: ["", "كلاسيك", "مكس", "سبيشال"],
    priceRows: [
      { label: "1/2 لتر",    classic: 14, special: 18 },
      { label: "1 لتر",      classic: 28, special: 35 },
      { label: "1/2 لتر",    classic: 16, special: 20 },
      { label: "1 لتر",      classic: 31, special: 38 },
      { label: "لتر 2 كيلو",   classic: 50, special: 60 },
    ],
    orderHref: "/menu/order-family",
  },
  {
    id: "special",
    name: "سبيشل أيس كريم",
    image: specialIceCream,
    modalType: "flavors",
    category: "ice-cream",
    flavors: [
      { nameAr: "عربية",       nameEn: "Arabian",      image: arabianIce     },
      { nameAr: "نوتيلا",      nameEn: "Nutella",       image: nutellaIce     },
      { nameAr: "لوتس",        nameEn: "Lotus",         image: lotusIce       },
      { nameAr: "بستاشيو",     nameEn: "Pistachio",     image: pistachioIce   },
      { nameAr: "سنكرز",       nameEn: "Snickers",      image: snickersIce    },
      { nameAr: "كندر بوينو",  nameEn: "Kinder Bueno",  image: kinderBuenoIce },
      { nameAr: "فورا",        nameEn: "Flora",         image: floraIce       },
      { nameAr: "بلوبيري",     nameEn: "Blueberry",     image: blueberryIce   },
      { nameAr: "باونتي",      nameEn: "Bounty",        image: bountyIce      },
      { nameAr: "أوريو",       nameEn: "Oreo",          image: oreoIce        },
      { nameAr: "كيتكات",      nameEn: "KitKat",        image: kitKatIce      },
      { nameAr: "عسل ومكسرات", nameEn: "Energy",        image: energyIce      },
    ],
  },
  {
    id: "classic",
    name: "كلاسيك أيس كريم",
    image: classicIceCream,
    modalType: "flavors",
    category: "ice-cream",
    flavors: [
      { nameAr: "شوكولاتة",  nameEn: "Chocolate", image: chocolateIce  },
      { nameAr: "فانيلا",    nameEn: "Vanilla",    image: vanillaaIce   },
      { nameAr: "دارك",      nameEn: "Dark",       image: darkIce       },
      { nameAr: "كراميل",    nameEn: "Caramel",    image: caramelIce    },
      { nameAr: "ليمون",     nameEn: "Lemon",      image: lemonIce      },
      { nameAr: "جوز هند",   nameEn: "Coconut",    image: coconutIce    },
      { nameAr: "عنب",       nameEn: "Grape",      image: grapeIce      },
      { nameAr: "بازوكا",    nameEn: "Bazooka",    image: bazookaIce    },
      { nameAr: "فراولة",    nameEn: "Strawberry", image: strawberryIce },
      { nameAr: "كوكتيل",    nameEn: "Cocktail",   image: coktailIce    },
      { nameAr: "ماريو",     nameEn: "Mario",      image: marioIce      },
      { nameAr: "موز",       nameEn: "Banana",     image: bananaIce     },
      { nameAr: "مانجا",     nameEn: "Mango",      image: mangoIce      },
      { nameAr: "نسكافيه",   nameEn: "Nescafe",    image: nescafeIce    },
    ],
  },
  {
    id: "stevia",
    name: "ستيفيا",
    image: stevia,
    modalType: "flavors",
    category: "ice-cream",
    flavors: [
      { nameAr: "فانيلا",    nameEn: "Vanilla",   image: vanillaaIce  },
      { nameAr: "شوكولاتة",  nameEn: "Chocolate", image: chocolateIce },
      { nameAr: "نسكافيه",   nameEn: "Nescafe",   image: nescafeIce   },
    ],
  },
  {
    id: "subscriptions",
    name: "مشتركات",
    image: dondurmaBasklava,
    modalType: "table",
    category: "ice-cream",
    tableHeaders: ["الحجم", "كلاسيك", "سبيشل", "مكس"],
    priceRows: [
      { label: "صغير (شبك)",  classic: 15, special: 20, price: 18 },
      { label: "وسط (شبك)",   classic: 25, special: 32, price: 28 },
      { label: "كبير (شبك)",  classic: 35, special: 45, price: 40 },
      { label: "خاص صغير",   classic: 20, special: 28, price: 24 },
      { label: "خاص كبير",   classic: 40, special: 55, price: 48 },
    ],
    orderHref: "/menu/order-subscriptions",
  },

  // ── BRAD ──────────────────────────────────────────────────────────
  {
    id: "brad",
    name: "براد",
    image: refrigerator,
    modalType: "table",
    category: "brad",
    priceRows: [
      { label: "صغير",   price: 1 },
      { label: "وسط",    price: 2 },
      { label: "كبير",   price: 3 },
    ],
    orderHref: "/menu/order-brad",
  },

  // ── BRAD مع بوظة ──────────────────────────────────────────────────
  {
    id: "brad-boza",
    name: "براد مع بوظة",
    image: iceCream,
    modalType: "table",
    category: "brad-boza",
    tableHeaders: ["الحجم", "كلاسيك", "سبيشال"],
    priceRows: [
      { label: "صغير", classic: 2, special: 4 },
      { label: "وسط",  classic: 4, special: 6 },
      { label: "كبير", classic: 6, special: 8 },
    ],
    orderHref: "/menu/order-brad?withIceCream=true",
  },

  // ── MILKSHAKE ─────────────────────────────────────────────────────
  {
    id: "milkshake",
    name: "ميلك شيك",
    image: milkshake,
    modalType: "table",
    category: "milkshake",
    priceRows: [
      { label: "كلاسيك فانيلا",           price: 8  },
      { label: "كلاسيك شوكولاته",          price: 8  },
      { label: "كلاسيك فراولة",            price: 8  },
      { label: "كلاسيك باروكا",            price: 8  },
      { label: "كلاسيك كاراميل",           price: 8  },
      { label: "كلاسيك شوكولاتة مرة",      price: 8  },
      { label: "سبيشال نوتيلا",            price: 10 },
      { label: "سبيشال لوتس",              price: 10 },
      { label: "سبيشال كندر",              price: 10 },
      { label: "سبيشال شوفان",             price: 10 },
      { label: "سبيشال أوريو",             price: 10 },
      { label: "سبيشال كت كات",            price: 10 },
      { label: "سبيشال فيتنس",             price: 10 },
      { label: "سيرلاك  (أطعم خاصة)",     price: 8  },
      { label: "اينشتاين  (أطعم خاصة)",   price: 9  },
      { label: "بيستاشيو  (أطعم خاصة)",   price: 13 },
    ],
    orderHref: "/menu/order-milkshake",
  },

  // ── COLD DRINKS ───────────────────────────────────────────────────
  {
    id: "cold-drinks",
    name: "مشروبات باردة",
    image: coldDrinks,
    modalType: "table",
    category: "cold-drinks",
    priceRows: [
      { label: "آيس كوفي كراميل", price: 8 },
      { label: "آيس موكا", price: 8 },
      { label: "سبانش لاتيه كراميل", price: 10 },
      { label: "بوبا شيك كوفي/فراولة", price: 12 },
      { label: "مياه صغيرة", price: 1 },
    ],
    orderHref: "/menu/order-desserts?type=cold-drinks",
  },

  // ── JUICES ────────────────────────────────────────────────────────
  {
    id: "juices",
    name: "عصائر طبيعية",
    image: naturalJuices,
    modalType: "table",
    category: "juices",
    priceRows: [
      { label: "فراولة", price: 5 },
      { label: "بلوليمونادا", price: 6 },
      { label: "مانجا", price: 7 },
    ],
    orderHref: "/menu/order-desserts?type=juices",
  },

  // ── DESSERTS ──────────────────────────────────────────────────────
  {
    id: "pancake",
    name: "بان كيك",
    image: pancake,
    modalType: "confirmation",
    category: "pancake",
    orderHref: "/menu/order/pancake",
  },
  {
    id: "waffle",
    name: "وافل",
    image: waffle,
    modalType: "confirmation",
    category: "waffle",
    orderHref: "/menu/order/waffle",
  },
  {
    id: "crepe",
    name: "كريب",
    image: crepe,
    modalType: "confirmation",
    category: "crepe",
    orderHref: "/menu/order/crepe",
  },
  {
    id: "pizza",
    name: "بيتزا جلاسيه",
    image: glassyPizza,
    modalType: "confirmation",
    category: "pizza",
    orderHref: "/menu/order/pizza",
  },
  {
    id: "kunafa",
    name: "كنافة آيس كريم",
    image: iceCreamKunafa,
    modalType: "table",
    category: "kunafa",
    priceRows: [
      { label: "كنافة عربية", price: 8 },
      { label: "كنافة لوتس", price: 8 },
      { label: "كنافة نوتيلا", price: 8 },
      { label: "كنافة بلوبيري", price: 8 },
      { label: "كنافة دوندورما بيستاشيو", price: 12 },
      { label: "كنافة طاقة (كل خميس)", price: 12 },
      { label: "مكس", price: 10 },
    ],
    orderHref: "/menu/order-kunafa",
  },
  {
    id: "molten",
    name: "مولتن كيك",
    image: moltenCake,
    modalType: "confirmation",
    category: "molten",
    orderHref: "/menu/order/molten",
  },
  {
    id: "brownie",
    name: "براونيز",
    image: browniesCake,
    modalType: "table",
    category: "desserts",
    priceRows: [
      { label: "براونيز عادي",   price: 8  },
      { label: "براونيز نوتيلا", price: 10 },
      { label: "براونيز لوتس",   price: 10 },
    ],
    orderHref: "/menu/order-other-desserts?type=brownie",
  },
  {
    id: "cookies",
    name: "كوكيز",
    image: mochi,
    modalType: "table",
    category: "desserts",
    priceRows: [
      { label: "كوكيز نوتيلا",        price: 8  },
      { label: "كوكيز لوتس",          price: 10 },
      { label: "كوكيز بيستاشيو",      price: 12 },
      { label: "كوكيز مكس",           price: 10 },
    ],
    orderHref: "/menu/order-other-desserts?type=cookies",
  },
  {
    id: "cheesecake",
    name: "تشيز كيك",
    image: sanSebastian,
    modalType: "table",
    category: "desserts",
    priceRows: [
      { label: "تشيز كيك فراولة",     price: 12 },
      { label: "تشيز كيك لوتس",       price: 14 },
      { label: "تشيز كيك بيستاشيو",   price: 16 },
      { label: "تشيز كيك مكس",        price: 14 },
    ],
    orderHref: "/menu/order-other-desserts?type=cheesecake",
  },

  // ── HOT DRINKS ────────────────────────────────────────────────────
  {
    id: "hot-drinks",
    name: "مشروبات ساخنة",
    image: milkshake,
    modalType: "table",
    category: "hot-drinks",
    priceRows: [
      { label: "قهوة عربية", price: 3 },
      { label: "قهوة تركية", price: 4 },
      { label: "شاي", price: 2 },
      { label: "كاكاو ساخن", price: 5 },
      { label: "نسكافيه ساخن", price: 4 },
    ],
  },

  // ── CORN ───────────────────────────────────────────────────────────
  {
    id: "corn",
    name: "ذرة",
    image: naturalJuices,
    modalType: "table",
    category: "corn",
    priceRows: [
      { label: "ذرة مشوية", price: 5 },
      { label: "ذرة مع زبدة", price: 6 },
      { label: "ذرة مع جبنة", price: 7 },
    ],
  },

  // ── OTHER ADDONS ───────────────────────────────────────────────────
  {
    id: "other-addons",
    name: "اضافات اخرى",
    image: moltenCake,
    modalType: "table",
    category: "other-addons",
    priceRows: [
      { label: "صوص الشوكولاتة", price: 1 },
      { label: "صوص الفراولة", price: 1 },
      { label: "مكسرات متنوعة", price: 2 },
      { label: "توبينج الأوريو", price: 2 },
    ],
  },

  // ── NEW ITEMS ──────────────────────────────────────────────────────
  {
    id: "new-items",
    name: "جديدنا",
    image: specialIceCream,
    modalType: "confirmation",
    category: "new",
  },
];
