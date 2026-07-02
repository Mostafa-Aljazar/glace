"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EventsBackground from "@/components/Events/EventsBackground";
import MenuModal from "@/components/Menu/MenuModal";
import {
  imgIesPP, imgIesC, imgIcee, imgIesP, iceCreamCup,
  iceCreamImg1, iceCreamImg2, iceCreamImg3,
  biscuitIceCream, familyIceCream,
  refrigerator, iceCream, milkshake, coldDrinks, naturalJuices,
} from "@/assets/images";
import { IceCream, CupSoda, Cake, ShoppingCart, ChevronLeft, GlassWater, Milk, Droplets, Apple } from "lucide-react";
import { useMenuCategories } from "@/hooks/menu/useMenuCategories";
import { useMenuItems } from "@/hooks/menu/useMenuItems";
import type { ApiMenuItem } from "@/data/fake-data/menuApiData";

const CATEGORY_ICONS: Record<string, typeof IceCream> = {
  "ice-cream":   IceCream,
  "brad":        GlassWater,
  "brad-boza":   GlassWater,
  "milkshake":   Milk,
  "cold-drinks": CupSoda,
  "juices":      Apple,
  "desserts":    Cake,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "ice-cream":   "from-[#51c9f4]/30 to-[#388dab]/30",
  "brad":        "from-[#f4a851]/30 to-[#c97d2a]/30",
  "brad-boza":   "from-[#f4a851]/30 to-[#c97d2a]/30",
  "milkshake":   "from-[#f4519f]/20 to-[#b02f74]/20",
  "cold-drinks": "from-[#51b4f4]/20 to-[#2a6eb0]/20",
  "juices":      "from-[#3fbd59]/20 to-[#2a8540]/20",
  "desserts":    "from-[#da51f4]/20 to-[#9a2fb0]/20",
};

const CATEGORY_ACCENT: Record<string, string> = {
  "ice-cream":   "#51c9f4",
  "brad":        "#f4a851",
  "brad-boza":   "#f4a851",
  "milkshake":   "#f4519f",
  "cold-drinks": "#51b4f4",
  "juices":      "#3fbd59",
  "desserts":    "#da51f4",
};

const DIRECT_ORDER_CARDS: Record<string, { image: Parameters<typeof Image>[0]["src"]; sublabel: string; href: string }> = {
  "brad":        { image: refrigerator,  sublabel: "صغير · وسط · كبير · نص لتر · لتر",  href: "/menu/order-brad"                    },
  "brad-boza":   { image: iceCream,      sublabel: "كلاسيك · سبيشل · مكس",               href: "/menu/order-brad?withIceCream=true"   },
  "milkshake":   { image: milkshake,     sublabel: "كلاسيك · سبيشل · أطعمة خاصة",        href: "/menu/order-milkshake"               },
  "cold-drinks": { image: coldDrinks,    sublabel: "آيس كوفي · موكا · بوبا شيك",          href: "/menu/order-drinks?type=cold"        },
  "juices":      { image: naturalJuices, sublabel: "فراولة · بلوليمونادا · مانجا",         href: "/menu/order-drinks?type=juices"      },
};

// ── Item card ──────────────────────────────────────────────────────────────────

function MenuItemCard({
  item,
  onOpen,
}: {
  item: ApiMenuItem;
  onOpen: (item: ApiMenuItem) => void;
}) {
  return (
    <div
      onClick={() => onOpen(item)}
      className="group relative flex flex-col items-center text-center text-white cursor-pointer select-none"
    >
      {/* Card body */}
      <div className={`relative w-full bg-white/[.14] hover:bg-white/[.22] backdrop-blur-[12px] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] border ${item.orderHref ? "border-glace-yellow/80 hover:border-glace-yellow" : "border-white/20 hover:border-white/40"}`}>

        {/* Image area */}
        <div className="relative flex justify-center items-center bg-white/[.08] pt-6 pb-2 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-radial-[ellipse_at_50%_60%] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Image
            src={item.image}
            alt={item.name}
            width={160}
            height={140}
            className="relative z-10 w-full max-w-[130px] sm:max-w-[155px] h-[110px] sm:h-[130px] object-contain drop-shadow-lg group-hover:scale-[1.05] transition-transform duration-300"
          />
        </div>

        {/* Text area */}
        <div className="px-3 pt-3 pb-5">
          <h2 className="text-[18px] sm:text-[20px] font-bold leading-snug mb-1 line-clamp-2">{item.name}</h2>

          {item.priceRows && item.priceRows.length > 0 && (
            <p className="text-white/60 text-[13px] mb-3">
              {item.priceRows[0].price !== undefined
                ? `يبدأ من ${item.priceRows[0].price} ₪`
                : item.priceRows[0].classic !== undefined
                ? `يبدأ من ${item.priceRows[0].classic} ₪`
                : null}
            </p>
          )}
          {item.flavors && (
            <p className="text-white/60 text-[13px] mb-3">{item.flavors.length} طعم متاح</p>
          )}

          <div className="flex justify-center">
            {item.orderHref ? (
              <span className="inline-flex items-center gap-1.5 bg-glace-yellow/90 group-hover:bg-glace-yellow border border-glace-yellow/80 rounded-xl px-4 py-1.5 text-[14px] text-[#1e6a7f] font-bold transition-all duration-200">
                <ShoppingCart size={13} />اطلب الآن
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-white/15 group-hover:bg-white/25 border border-white/25 group-hover:border-white/50 rounded-xl px-4 py-1.5 text-[14px] transition-all duration-200">
                اعرف أكثر
                <ChevronLeft size={13} className="opacity-70" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Ice cream sub-nav ─────────────────────────────────────────────────────────

function IceCreamSubNav() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">

      {/* كاسة أو بسكوت */}
      <Link href="/menu/order-cup" className="group relative flex flex-col items-center text-center text-white cursor-pointer select-none">
        <div className="relative w-full bg-white/[.14] hover:bg-white/[.22] backdrop-blur-[12px] border border-glace-yellow/80 hover:border-glace-yellow rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
          <div className="relative flex justify-center items-end gap-1 bg-white/8 pt-6 pb-2 px-2 h-37.5 sm:h-41.25 overflow-hidden">
            <div className="absolute inset-0 bg-radial-[ellipse_at_50%_60%] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <Image src={biscuitIceCream} alt="بسكوت" width={80} height={130}
              className="relative z-10 h-27.5 sm:h-32.5 w-auto object-contain object-bottom drop-shadow-lg group-hover:scale-[1.05] transition-transform duration-300" />
            <Image src={iceCreamCup} alt="كاسة" width={100} height={110}
              className="relative z-10 h-24 sm:h-28 w-auto object-contain object-bottom drop-shadow-lg group-hover:scale-[1.05] transition-transform duration-300 delay-75" />
          </div>
          <div className="px-3 pt-3 pb-5">
            <h2 className="text-[18px] sm:text-[20px] font-bold leading-snug mb-1">كاسة أو بسكوت</h2>
            <p className="text-white/60 text-[13px] mb-3">كاسة · بسكوت · تيك اواي</p>
            <span className="inline-flex items-center gap-1.5 bg-glace-yellow/90 group-hover:bg-glace-yellow border border-glace-yellow/80 rounded-xl px-4 py-1.5 text-[14px] text-[#1e6a7f] font-bold transition-all duration-200">
              <ShoppingCart size={13} />اطلب الآن
            </span>
          </div>
        </div>
      </Link>

      {/* بوظة عائلي */}
      <Link href="/menu/order-family" className="group relative flex flex-col items-center text-center text-white cursor-pointer select-none">
        <div className="relative w-full bg-white/14 hover:bg-white/22 backdrop-blur-md border border-glace-yellow/80 hover:border-glace-yellow rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
          <div className="relative flex justify-center items-end bg-white/8 pt-6 pb-2 px-4 h-37.5 sm:h-41.25 overflow-hidden">
            <div className="absolute inset-0 bg-radial-[ellipse_at_50%_60%] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <Image src={familyIceCream} alt="بوظة عائلي" width={160} height={140}
              className="relative z-10 w-full max-w-32.5 sm:max-w-38.75 h-27.5 sm:h-32.5 object-contain object-bottom drop-shadow-lg group-hover:scale-[1.05] transition-transform duration-300" />
          </div>
          <div className="px-3 pt-3 pb-5">
            <h2 className="text-[18px] sm:text-[20px] font-bold leading-snug mb-1">بوظة عائلي</h2>
            <p className="text-white/60 text-[13px] mb-3">علب كلاسيكس · علب فلين</p>
            <span className="inline-flex items-center gap-1.5 bg-glace-yellow/90 group-hover:bg-glace-yellow border border-glace-yellow/80 rounded-xl px-4 py-1.5 text-[14px] text-[#1e6a7f] font-bold transition-all duration-200">
              <ShoppingCart size={13} />اطلب الآن
            </span>
          </div>
        </div>
      </Link>

    </div>
  );
}

// ── Direct order card (single-product categories) ─────────────────────────────

function DirectOrderCard({ categoryId }: { categoryId: string }) {
  const card = DIRECT_ORDER_CARDS[categoryId];
  if (!card) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      <Link href={card.href} className="group relative flex flex-col items-center text-center text-white cursor-pointer select-none">
        <div className="relative w-full bg-white/[.14] hover:bg-white/22 backdrop-blur-md border border-glace-yellow/80 hover:border-glace-yellow rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
          <div className="relative flex justify-center items-end bg-white/8 pt-6 pb-2 px-4 h-37.5 sm:h-41.25 overflow-hidden">
            <div className="absolute inset-0 bg-radial-[ellipse_at_50%_60%] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <Image src={card.image} alt="" width={160} height={140}
              className="relative z-10 w-full max-w-32.5 sm:max-w-38.75 h-27.5 sm:h-32.5 object-contain object-bottom drop-shadow-lg group-hover:scale-[1.05] transition-transform duration-300" />
          </div>
          <div className="px-3 pt-3 pb-5">
            <p className="text-white/60 text-[13px] mb-3">{card.sublabel}</p>
            <span className="inline-flex items-center gap-1.5 bg-glace-yellow/90 group-hover:bg-glace-yellow border border-glace-yellow/80 rounded-xl px-4 py-1.5 text-[14px] text-[#1e6a7f] font-bold transition-all duration-200">
              <ShoppingCart size={13} />اطلب الآن
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Tab content (items grid) ───────────────────────────────────────────────────

function MenuTabContent({
  categoryId,
  onOpen,
}: {
  categoryId: string;
  onOpen: (item: ApiMenuItem) => void;
}) {
  const { data: items = [], isLoading } = useMenuItems(categoryId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white/10 rounded-[24px] h-70 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} onOpen={onOpen} />
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function MenuClientPage() {
  const { data: categories = [], isLoading: catsLoading } = useMenuCategories();
  const [activeCategory, setActiveCategory] = useState("ice-cream");
  const [selectedItem, setSelectedItem] = useState<ApiMenuItem | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const confirmationItem: ApiMenuItem = {
    id: "confirmation",
    name: "",
    image: iceCreamCup,
    modalType: "confirmation",
    category: "ice-cream",
  };

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      {/* ── Floating decorations ── */}
      <Image src={imgIesPP} alt="" width={90}
        className="top-[55vh] right-4 sm:right-12 lg:right-20 absolute w-14 sm:w-18.75 lg:w-22.5 object-contain pointer-events-none opacity-70" />
      <Image src={imgIesC} alt="" width={110}
        className="top-[55vh] left-4 sm:left-12 lg:left-20 absolute w-16 sm:w-21.25 lg:w-27.5 object-contain pointer-events-none opacity-70" />
      <Image src={imgIcee} alt="" width={40}
        className="hidden lg:block top-32.5 right-[22%] absolute w-10 object-contain rotate-[-200deg] pointer-events-none opacity-60" />
      <Image src={imgIesP} alt="" width={80}
        className="hidden lg:block top-27.5 left-16 absolute w-20 object-contain pointer-events-none opacity-60" />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-4 max-w-325">

        {/* ── Hero strip ── */}
        <div className="relative flex flex-col items-center text-center pt-8 pb-10 sm:pb-14">
          {/* Floating ice cream images */}
          <div className="hidden sm:flex absolute top-0 left-0 gap-3 opacity-80 pointer-events-none">
            <Image src={iceCreamImg1} alt="" width={60} height={60} className="w-14 h-14 object-contain rotate-[-15deg] drop-shadow-lg" />
            <Image src={iceCreamImg2} alt="" width={50} height={50} className="w-12 h-12 object-contain rotate-10 mt-4 drop-shadow-lg" />
          </div>
          <div className="hidden sm:flex absolute top-0 right-0 gap-3 opacity-80 pointer-events-none">
            <Image src={iceCreamImg3} alt="" width={55} height={55} className="w-14 h-14 object-contain rotate-12 drop-shadow-lg" />
            <Image src={iceCreamImg1} alt="" width={45} height={45} className="w-11 h-11 object-contain rotate-[-8deg] mt-5 drop-shadow-lg" />
          </div>

          <div className="relative z-10">
            <p className="inline-block bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-1.5 text-white/80 text-[14px] sm:text-[15px] mb-4 tracking-wide">
              🍦 منيو جلاسيه الأمير
            </p>
            <h1 className="text-white text-[42px] sm:text-[56px] lg:text-[68px] font-bold leading-tight drop-shadow-lg">
              اختر ما يعجبك
            </h1>
            <p className="text-white/70 text-[17px] sm:text-[19px] mt-3 max-w-120 mx-auto leading-relaxed">
              بوظة طازجة، مشروبات مثلجة، وحلويات شرقية — كل شيء بنكهة جلاسيه
            </p>

          </div>
        </div>

        {/* ── Category selector ── */}
        {catsLoading ? (
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 rounded-[20px] w-36 h-18 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] ?? IceCream;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`
                    group relative flex flex-col items-center gap-1.5 px-6 sm:px-8 py-3 sm:py-4
                    rounded-[20px] border text-[16px] sm:text-[18px] transition-all duration-300 cursor-pointer
                    ${isActive
                      ? "bg-white text-[#1e6a7f] border-white scale-105 shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/18 hover:border-white/40 hover:scale-[1.02]"
                    }
                  `}
                >
                  <Icon
                    size={22}
                    className={`transition-colors ${isActive ? "text-[#1e9fd8]" : "text-white/80 group-hover:text-white"}`}
                  />
                  <span className="font-bold">{cat.label}</span>
                  {isActive && (
                    <span className="-bottom-1.5 absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Section header ── */}
        {!catsLoading && (
          <div className={`flex items-center gap-3 mb-6 px-1 bg-linear-to-r ${CATEGORY_GRADIENTS[activeCategory] ?? ""} rounded-[16px] py-3 px-4`}>
            {(() => {
              const Icon = CATEGORY_ICONS[activeCategory] ?? IceCream;
              const cat = categories.find((c) => c.id === activeCategory);
              return (
                <>
                  <div
                    className="flex justify-center items-center rounded-full w-9 h-9 shrink-0"
                    style={{ backgroundColor: `${CATEGORY_ACCENT[activeCategory]}33` }}
                  >
                    <Icon size={18} style={{ color: CATEGORY_ACCENT[activeCategory] }} />
                  </div>
                  <h2 className="text-white text-[22px] sm:text-[26px] font-bold">{cat?.label}</h2>
                  <div className="flex-1 h-px bg-white/15 mr-2" />
                </>
              );
            })()}
          </div>
        )}

        {/* ── Sub-navs / items grid ── */}
        {activeCategory === "ice-cream" ? (
          <IceCreamSubNav />
        ) : DIRECT_ORDER_CARDS[activeCategory] ? (
          <DirectOrderCard categoryId={activeCategory} />
        ) : (
          <MenuTabContent
            key={activeCategory}
            categoryId={activeCategory}
            onOpen={(item) => { setSelectedItem(item); setShowConfirmation(false); }}
          />
        )}

        {/* ── Bottom CTA ── */}
        <div className="flex flex-col items-center gap-4 mt-14 pt-10 border-t border-white/15">
          <p className="text-white/70 text-[17px] text-center">جاهز تطلب؟ أضف منتجاتك للسلة وأتمم طلبك</p>
          <Link
            href="/cart"
            className="flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[18px] px-8 py-3.5 rounded-full transition-all duration-200 shadow-[0_4px_20px_rgba(244,228,81,0.4)] hover:shadow-[0_6px_28px_rgba(244,228,81,0.5)] hover:-translate-y-0.5"
          >
            <ShoppingCart size={20} />
            عرض السلة
          </Link>
        </div>
      </div>


      {/* ── Modals ── */}
      {selectedItem && !showConfirmation && (
        <MenuModal
          item={selectedItem}
          onClose={() => { setSelectedItem(null); setShowConfirmation(false); }}
          onConfirm={() => setShowConfirmation(true)}
        />
      )}
      {showConfirmation && (
        <MenuModal
          item={confirmationItem}
          onClose={() => { setSelectedItem(null); setShowConfirmation(false); }}
        />
      )}
    </div>
  );
}
