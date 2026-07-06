"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import EventsBackground from "@/components/Events/EventsBackground";
import MenuModal from "@/components/Menu/MenuModal";
import {
  imgIesPP,
  imgIesC,
  imgIcee,
  imgIesP,
  iceCreamCup,
  iceCreamImg1,
  iceCreamImg2,
  iceCreamImg3,
  biscuitIceCream,
  familyIceCream,
  refrigerator,
  iceCream,
  milkshake,
  iceCreamKunafa,
  coldDrinks,
  naturalJuices,
} from "@/assets/images";
import {
  IceCream,
  CupSoda,
  Cake,
  ShoppingCart,
  ChevronLeft,
  GlassWater,
  Milk,
  Apple,
} from "lucide-react";
import { useMenuCategories } from "@/hooks/menu/useMenuCategories";
import { useMenuItems } from "@/hooks/menu/useMenuItems";
import type { ApiMenuItem } from "@/data/fake-data/menuApiData";

const CATEGORY_ICONS: Record<string, typeof IceCream> = {
  "ice-cream": IceCream,
  brad: GlassWater,
  "brad-boza": GlassWater,
  milkshake: Milk,
  kunafa: Cake,
  "cold-drinks": CupSoda,
  juices: Apple,
  desserts: Cake,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "ice-cream": "from-[#51c9f4]/30 to-[#388dab]/30",
  brad: "from-[#f4a851]/30 to-[#c97d2a]/30",
  "brad-boza": "from-[#f4a851]/30 to-[#c97d2a]/30",
  milkshake: "from-[#f4519f]/20 to-[#b02f74]/20",
  kunafa: "from-[#f4a851]/20 to-[#c97d2a]/20",
  "cold-drinks": "from-[#51b4f4]/20 to-[#2a6eb0]/20",
  juices: "from-[#3fbd59]/20 to-[#2a8540]/20",
  desserts: "from-[#da51f4]/20 to-[#9a2fb0]/20",
};

const CATEGORY_ACCENT: Record<string, string> = {
  "ice-cream": "#51c9f4",
  brad: "#f4a851",
  "brad-boza": "#f4a851",
  milkshake: "#f4519f",
  kunafa: "#f4a851",
  "cold-drinks": "#51b4f4",
  juices: "#3fbd59",
  desserts: "#da51f4",
};

const DIRECT_ORDER_CARDS: Record<
  string,
  { image: Parameters<typeof Image>[0]["src"]; sublabel: string; href: string }
> = {
  brad: {
    image: refrigerator,
    sublabel: "صغير · وسط · كبير · نص لتر · لتر",
    href: "/menu/order-brad",
  },
  "brad-boza": {
    image: iceCream,
    sublabel: "كلاسيك · سبيشل · مكس",
    href: "/menu/order-brad?withIceCream=true",
  },
  milkshake: {
    image: milkshake,
    sublabel: "كلاسيك · سبيشل · أطعمة خاصة",
    href: "/menu/order-milkshake",
  },
  kunafa: {
    image: iceCreamKunafa,
    sublabel: "عربية · لوتس · نوتيلا · بلوبيري",
    href: "/menu/order-kunafa",
  },
  "cold-drinks": {
    image: coldDrinks,
    sublabel: "آيس كوفي · موكا · بوبا شيك",
    href: "/menu/order-desserts?type=cold-drinks",
  },
  juices: {
    image: naturalJuices,
    sublabel: "فراولة · بلوليمونادا · مانجا",
    href: "/menu/order-desserts?type=juices",
  },
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
      className="group relative flex flex-col items-center text-white text-center cursor-pointer select-none"
    >
      {/* Card body */}
      <div
        className={`relative w-full bg-white/14 hover:bg-white/22 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] border ${item.orderHref ? "border-glace-yellow/80 hover:border-glace-yellow" : "border-white/20 hover:border-white/40"}`}
      >
        {/* Image area */}
        <div className="relative flex justify-center items-center bg-white/8 px-4 pt-6 pb-2 overflow-hidden">
          <div className="absolute inset-0 bg-radial-[ellipse_at_50%_60%] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Image
            src={item.image}
            alt={item.name}
            width={160}
            height={140}
            className="z-10 relative drop-shadow-lg w-full max-w-32.5 sm:max-w-38.75 h-27.5 sm:h-32.5 object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Text area */}
        <div className="px-3 pt-3 pb-5">
          <h2 className="mb-1 font-bold text-[18px] sm:text-[20px] line-clamp-2 leading-snug">
            {item.name}
          </h2>

          {item.priceRows && item.priceRows.length > 0 && (
            <p className="mb-3 text-[13px] text-white/60">
              {item.priceRows[0].price !== undefined
                ? `يبدأ من ${item.priceRows[0].price} ₪`
                : item.priceRows[0].classic !== undefined
                  ? `يبدأ من ${item.priceRows[0].classic} ₪`
                  : null}
            </p>
          )}
          {item.flavors && (
            <p className="mb-3 text-[13px] text-white/60">
              {item.flavors.length} طعم متاح
            </p>
          )}

          <div className="flex justify-center">
            {item.orderHref ? (
              <span className="inline-flex items-center gap-1.5 bg-glace-yellow/90 group-hover:bg-glace-yellow px-4 py-1.5 border border-glace-yellow/80 rounded-xl font-bold text-[#1e6a7f] text-[14px] transition-all duration-200">
                <ShoppingCart size={13} />
                اطلب الآن
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-white/15 group-hover:bg-white/25 px-4 py-1.5 border border-white/25 group-hover:border-white/50 rounded-xl text-[14px] transition-all duration-200">
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
    <div className="gap-4 sm:gap-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-8">
      {/* كاسة أو بسكوت */}
      <Link
        href="/menu/order-cup"
        className="group relative flex flex-col items-center text-white text-center cursor-pointer select-none"
      >
        <div className="relative bg-white/14 hover:bg-white/22 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-md border border-glace-yellow/80 hover:border-glace-yellow rounded-2xl w-full overflow-hidden transition-all hover:-translate-y-1 duration-300">
          <div className="relative flex justify-center items-end gap-1 bg-white/8 px-2 pt-6 pb-2 h-37.5 sm:h-41.25 overflow-hidden">
            <div className="absolute inset-0 bg-radial-[ellipse_at_50%_60%] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <Image
              src={biscuitIceCream}
              alt="بسكوت"
              width={80}
              height={130}
              className="z-10 relative drop-shadow-lg w-auto h-27.5 sm:h-32.5 object-bottom object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <Image
              src={iceCreamCup}
              alt="كاسة"
              width={100}
              height={110}
              className="z-10 relative drop-shadow-lg w-auto h-24 sm:h-28 object-bottom object-contain group-hover:scale-[1.05] transition-transform duration-300 delay-75"
            />
          </div>
          <div className="px-3 pt-3 pb-5">
            <h2 className="mb-1 font-bold text-[18px] sm:text-[20px] leading-snug">
              كاسة أو بسكوت
            </h2>
            <p className="mb-3 text-[13px] text-white/60">
              كاسة · بسكوت · تيك اواي
            </p>
            <span className="inline-flex items-center gap-1.5 bg-glace-yellow/90 group-hover:bg-glace-yellow px-4 py-1.5 border border-glace-yellow/80 rounded-xl font-bold text-[#1e6a7f] text-[14px] transition-all duration-200">
              <ShoppingCart size={13} />
              اطلب الآن
            </span>
          </div>
        </div>
      </Link>

      {/* بوظة عائلي */}
      <Link
        href="/menu/order-family"
        className="group relative flex flex-col items-center text-white text-center cursor-pointer select-none"
      >
        <div className="relative bg-white/14 hover:bg-white/22 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-md border border-glace-yellow/80 hover:border-glace-yellow rounded-2xl w-full overflow-hidden transition-all hover:-translate-y-1 duration-300">
          <div className="relative flex justify-center items-end bg-white/8 px-4 pt-6 pb-2 h-37.5 sm:h-41.25 overflow-hidden">
            <div className="absolute inset-0 bg-radial-[ellipse_at_50%_60%] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <Image
              src={familyIceCream}
              alt="بوظة عائلي"
              width={160}
              height={140}
              className="z-10 relative drop-shadow-lg w-full max-w-32.5 sm:max-w-38.75 h-27.5 sm:h-32.5 object-bottom object-contain group-hover:scale-[1.05] transition-transform duration-300"
            />
          </div>
          <div className="px-3 pt-3 pb-5">
            <h2 className="mb-1 font-bold text-[18px] sm:text-[20px] leading-snug">
              بوظة عائلي
            </h2>
            <p className="mb-3 text-[13px] text-white/60">
              علب كلاسيكس · علب فلين
            </p>
            <span className="inline-flex items-center gap-1.5 bg-glace-yellow/90 group-hover:bg-glace-yellow px-4 py-1.5 border border-glace-yellow/80 rounded-xl font-bold text-[#1e6a7f] text-[14px] transition-all duration-200">
              <ShoppingCart size={13} />
              اطلب الآن
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
    <div className="gap-4 sm:gap-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-8">
      <Link
        href={card.href}
        className="group relative flex flex-col items-center text-white text-center cursor-pointer select-none"
      >
        <div className="relative bg-white/[.14] hover:bg-white/22 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-md border border-glace-yellow/80 hover:border-glace-yellow rounded-2xl w-full overflow-hidden transition-all hover:-translate-y-1 duration-300">
          <div className="relative flex justify-center items-end bg-white/8 px-4 pt-6 pb-2 h-37.5 sm:h-41.25 overflow-hidden">
            <div className="absolute inset-0 bg-radial-[ellipse_at_50%_60%] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <Image
              src={card.image}
              alt=""
              width={160}
              height={140}
              className="z-10 relative drop-shadow-lg w-full max-w-32.5 sm:max-w-38.75 h-27.5 sm:h-32.5 object-bottom object-contain group-hover:scale-[1.05] transition-transform duration-300"
            />
          </div>
          <div className="px-3 pt-3 pb-5">
            <p className="mb-3 text-[13px] text-white/60">{card.sublabel}</p>
            <span className="inline-flex items-center gap-1.5 bg-glace-yellow/90 group-hover:bg-glace-yellow px-4 py-1.5 border border-glace-yellow/80 rounded-xl font-bold text-[#1e6a7f] text-[14px] transition-all duration-200">
              <ShoppingCart size={13} />
              اطلب الآن
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
      <div className="gap-4 sm:gap-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/10 rounded-[24px] h-70 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="gap-4 sm:gap-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} onOpen={onOpen} />
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function MenuClientPage() {
  const { data: categories = [], isLoading: catsLoading } = useMenuCategories();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryCategory = searchParams.get("category");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const categoryButtonRefs = useRef<Record<string, HTMLButtonElement | null>>(
    {},
  );
  const selectorScrollRef = useRef<HTMLDivElement | null>(null);
  const suppressObserverRef = useRef(false);
  const suppressObserverTimeoutRef = useRef<number | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState(
    queryCategory ?? "ice-cream",
  );
  const [selectedItem, setSelectedItem] = useState<ApiMenuItem | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (!queryCategory) return;
    const section = sectionRefs.current[queryCategory];
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [queryCategory]);

  useEffect(() => {
    if (!categories.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressObserverRef.current) return;

        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          const categoryId =
            visibleEntry.target.getAttribute("data-category-id");
          if (categoryId && categoryId !== activeCategory) {
            setActiveCategory(categoryId);
          }
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -70% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75],
      },
    );

    categories.forEach((cat) => {
      const section = sectionRefs.current[cat.id];
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [categories, activeCategory]);

  useEffect(() => {
    if (!categories.length) return;
    const handleScrollEnd = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (scrolledToBottom) {
        const lastCategoryId = categories[categories.length - 1].id;
        setActiveCategory((current) =>
          current === lastCategoryId ? current : lastCategoryId,
        );
      }
    };

    window.addEventListener("scroll", handleScrollEnd, { passive: true });
    handleScrollEnd();
    return () => window.removeEventListener("scroll", handleScrollEnd);
  }, [categories]);

  useEffect(() => {
    const activeButton = categoryButtonRefs.current[activeCategory];
    const scrollContainer = selectorScrollRef.current;
    if (!activeButton || !scrollContainer) return;

    const targetLeft =
      activeButton.offsetLeft -
      scrollContainer.clientWidth / 2 +
      activeButton.offsetWidth / 2;

    scrollContainer.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [activeCategory]);

  const setSectionRef = (categoryId: string) => (node: HTMLElement | null) => {
    sectionRefs.current[categoryId] = node;
  };

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    suppressObserverRef.current = true;
    window.clearTimeout(suppressObserverTimeoutRef.current);
    suppressObserverTimeoutRef.current = window.setTimeout(() => {
      suppressObserverRef.current = false;
    }, 800);
    const section = sectionRefs.current[categoryId];
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", categoryId);
    router.replace(`/menu?${params.toString()}`);
  };

  const confirmationItem: ApiMenuItem = {
    id: "confirmation",
    name: "",
    image: iceCreamCup,
    modalType: "confirmation",
    category: "ice-cream",
  };

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen">
      <EventsBackground />

      {/* ── Floating decorations ── */}
      <Image
        src={imgIesPP}
        alt=""
        width={90}
        className="top-[55vh] right-4 sm:right-12 lg:right-20 absolute opacity-70 w-14 sm:w-18.75 lg:w-22.5 object-contain pointer-events-none"
      />
      <Image
        src={imgIesC}
        alt=""
        width={110}
        className="top-[55vh] left-4 sm:left-12 lg:left-20 absolute opacity-70 w-16 sm:w-21.25 lg:w-27.5 object-contain pointer-events-none"
      />
      <Image
        src={imgIcee}
        alt=""
        width={40}
        className="hidden lg:block top-32.5 right-[22%] absolute opacity-60 w-10 object-contain rotate-[-200deg] pointer-events-none"
      />
      <Image
        src={imgIesP}
        alt=""
        width={80}
        className="hidden lg:block top-27.5 left-16 absolute opacity-60 w-20 object-contain pointer-events-none"
      />

      <div className="z-90 relative mx-auto px-4 sm:px-6 lg:px-8 pt-22.5 lg:pt-26.5 pb-4 max-w-screen-2xl">
        {/* ── Hero strip ── */}
        <div className="relative flex flex-col items-center pt-8 pb-10 sm:pb-14 text-center">
          {/* Floating ice cream images */}
          <div className="hidden top-0 left-0 absolute sm:flex gap-3 opacity-80 pointer-events-none">
            <Image
              src={iceCreamImg1}
              alt=""
              width={60}
              height={60}
              className="drop-shadow-lg w-14 h-14 object-contain rotate-[-15deg]"
            />
            <Image
              src={iceCreamImg2}
              alt=""
              width={50}
              height={50}
              className="drop-shadow-lg mt-4 w-12 h-12 object-contain rotate-10"
            />
          </div>
          <div className="hidden top-0 right-0 absolute sm:flex gap-3 opacity-80 pointer-events-none">
            <Image
              src={iceCreamImg3}
              alt=""
              width={55}
              height={55}
              className="drop-shadow-lg w-14 h-14 object-contain rotate-12"
            />
            <Image
              src={iceCreamImg1}
              alt=""
              width={45}
              height={45}
              className="drop-shadow-lg mt-5 w-11 h-11 object-contain rotate-[-8deg]"
            />
          </div>

          <div className="z-10 relative">
            <h1 className="drop-shadow-lg font-bold text-[42px] text-white sm:text-[56px] lg:text-[68px] leading-tight">
              منيو جلاسيه الأمير - غزة
            </h1>
            <p className="mx-auto mt-3 max-w-120 text-[17px] text-white/70 sm:text-[19px] leading-relaxed">
              بوظة طازجة، مشروبات مثلجة، وحلويات شرقية ، كل شيء بنكهة جلاسيه
            </p>
          </div>
        </div>

        {/* ── Category selector ── */}
        {catsLoading ? (
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/10 rounded-[20px] w-36 h-18 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="top-0 z-50 sticky -mx-4 sm:-mx-6 lg:-mx-8">
              <div
                ref={selectorScrollRef}
                className="bg-transparent shadow-none border-white/15 backdrop-blur-xl px-3 py-3 border-[1.25px] rounded-none w-full overflow-x-auto no-scrollbar"
              >
                <div className="flex gap-3 sm:gap-4 min-w-max">
                  {categories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.id] ?? IceCream;
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        ref={(node) => {
                          categoryButtonRefs.current[cat.id] = node;
                        }}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`
                          group relative inline-flex items-center gap-2 min-w-37.5 sm:min-w-45 px-5 py-3
                          rounded-[20px] border text-[15px] sm:text-[16px] transition-all duration-300 cursor-pointer
                          ${
                            isActive
                              ? "bg-white text-[#1e6a7f] border-white shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
                              : "bg-white/10 text-white border-white/20 hover:bg-white/18 hover:border-white/40"
                          }
                        `}
                      >
                        <Icon
                          size={20}
                          className={`transition-colors ${isActive ? "text-[#1e9fd8]" : "text-white/80 group-hover:text-white"}`}
                        />
                        <span className="font-bold">{cat.label}</span>
                        {isActive && (
                          <span className="-bottom-1.5 left-1/2 absolute bg-white rounded-full w-2 h-2 -translate-x-1/2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Category sections ── */}
        {!catsLoading && (
          <div className="space-y-12">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] ?? IceCream;
              return (
                <section
                  key={cat.id}
                  id={cat.id}
                  data-category-id={cat.id}
                  ref={setSectionRef(cat.id)}
                  className="scroll-mt-32"
                >
                  <div
                    className={`flex items-center gap-3 mb-6 px-1 bg-linear-to-r ${CATEGORY_GRADIENTS[cat.id] ?? ""} rounded-[16px] py-3 px-4`}
                  >
                    <div
                      className="flex justify-center items-center rounded-full w-9 h-9 shrink-0"
                      style={{
                        backgroundColor: `${CATEGORY_ACCENT[cat.id]}33`,
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ color: CATEGORY_ACCENT[cat.id] }}
                      />
                    </div>
                    <h2 className="font-bold text-[22px] text-white sm:text-[26px]">
                      {cat.label}
                    </h2>
                    <div className="flex-1 bg-white/15 mr-2 h-px" />
                  </div>

                  {cat.id === "ice-cream" ? (
                    <IceCreamSubNav />
                  ) : DIRECT_ORDER_CARDS[cat.id] ? (
                    <DirectOrderCard categoryId={cat.id} />
                  ) : (
                    <MenuTabContent
                      key={cat.id}
                      categoryId={cat.id}
                      onOpen={(item) => {
                        setSelectedItem(item);
                        setShowConfirmation(false);
                      }}
                    />
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="flex flex-col items-center gap-4 mt-14 pt-10 border-white/15 border-t">
          <p className="text-[17px] text-white/70 text-center">
            جاهز تطلب؟ أضف منتجاتك للسلة وأتمم طلبك
          </p>
          <Link
            href="/cart"
            className="flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 shadow-[0_4px_20px_rgba(244,228,81,0.4)] hover:shadow-[0_6px_28px_rgba(244,228,81,0.5)] px-8 py-3.5 rounded-full font-bold text-[#1e6a7f] text-[18px] transition-all hover:-translate-y-0.5 duration-200"
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
          onClose={() => {
            setSelectedItem(null);
            setShowConfirmation(false);
          }}
          onConfirm={() => setShowConfirmation(true)}
        />
      )}
      {showConfirmation && (
        <MenuModal
          item={confirmationItem}
          onClose={() => {
            setSelectedItem(null);
            setShowConfirmation(false);
          }}
        />
      )}
    </div>
  );
}
