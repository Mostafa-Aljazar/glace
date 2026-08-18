"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import EventsBackground from "@/components/Events/EventsBackground";
import DataError from "@/components/Common/DataError";
import { MenuIcon } from "@/components/Menu/MenuIcon";
import {
  imgIesPP,
  imgIesC,
  imgIcee,
  imgIesP,
  iceCreamImg1,
  iceCreamImg2,
  iceCreamImg3,
} from "@/assets/images";
import { ShoppingCart } from "lucide-react";
import { useMenuCategories } from "@/hooks/menu/useMenuCategories";
import { useMenuProducts } from "@/hooks/menu/useMenuProducts";
import {
  resolveMenuImageSrc,
  type IMenuCategory,
  type IProduct,
} from "@/types/menu.types";

// ── Product card ────────────────────────────────────────────────────────────

function MenuProductCard({ product }: { product: IProduct }) {
  const priceTeaser =
    product.kind === "builder"
      ? product.sizes[0]?.prices[0]?.price
      : product.items[0]?.price;

  return (
    <Link
      href={`/menu/order/${product.slug}`}
      className="group relative flex flex-col items-center text-white text-center cursor-pointer select-none"
    >
      <div className="relative bg-white/12 hover:bg-white/18 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] border border-white/20 hover:border-white/35 rounded-[20px] w-full overflow-hidden transition-all duration-300">
        <div className="relative flex justify-center items-center px-3 pt-5 pb-1">
          <Image
            src={resolveMenuImageSrc(product.image)}
            alt={product.name}
            width={200}
            height={180}
            className="drop-shadow-lg w-full max-w-40 sm:max-w-38.75 h-36 sm:h-32.5 object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex flex-col items-center px-3 pt-2 pb-3">
          <h2 className="mb-0.5 font-semibold text-[16px] sm:text-[18px] line-clamp-2 leading-snug">
            {product.name}
          </h2>

          {priceTeaser !== undefined && (
            <p className="mb-3 tabular-nums text-[13px] text-white/70">
              يبدأ من {priceTeaser} ₪
            </p>
          )}

          <span className="inline-flex justify-center items-center gap-1.5 bg-glace-yellow group-hover:brightness-105 px-3 py-2 rounded-full w-full font-bold text-[#1a4a5a] text-[13px] sm:text-[14px] transition-all duration-200">
            <ShoppingCart size={14} />
            اطلب الآن
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Category section (products grid) ────────────────────────────────────────

function MenuCategorySection({ categoryId }: { categoryId: string }) {
  // One shared products query for the whole page — filtering here keeps the
  // menu at a single `/menu/products` request instead of one per category.
  const { data: allProducts, isLoading, isError, refetch } = useMenuProducts();
  const products = (allProducts ?? []).filter(
    (p) => p.categoryId === categoryId,
  );

  if (isLoading) {
    return (
      <div className="gap-3 sm:gap-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/10 rounded-[24px] h-80 sm:h-70 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <DataError
        title="تعذّر تحميل منتجات هذا القسم"
        onRetry={() => void refetch()}
      />
    );
  }

  // An empty category is a real backend answer, not a failure.
  if (products.length === 0) {
    return (
      <p className="bg-white/8 py-8 border border-white/15 rounded-[24px] text-[14px] text-white/60 text-center">
        لا توجد منتجات في هذا القسم حالياً
      </p>
    );
  }

  return (
    <div className="gap-3 sm:gap-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <MenuProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function MenuClientPage() {
  const {
    data: allCategories,
    isLoading: catsLoading,
    isError: catsError,
    refetch: refetchCats,
  } = useMenuCategories();
  // A category switched off in the dashboard disappears from the menu entirely.
  const categories = useMemo(
    () => (allCategories ?? []).filter((c) => c.available !== false),
    [allCategories],
  );
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

  useEffect(() => {
    if (!queryCategory) return;
    const section = sectionRefs.current[queryCategory];
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
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
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", categoryId);
    router.replace(`/menu?${params.toString()}`);
  };

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen">
      <EventsBackground />

      <Image
        src={imgIesPP}
        alt=""
        width={90}
        className="hidden sm:block top-[55vh] right-4 sm:right-12 lg:right-20 absolute opacity-70 w-14 sm:w-18.75 lg:w-22.5 object-contain pointer-events-none"
      />
      <Image
        src={imgIesC}
        alt=""
        width={110}
        className="hidden sm:block top-[55vh] left-4 sm:left-12 lg:left-20 absolute opacity-70 w-16 sm:w-21.25 lg:w-27.5 object-contain pointer-events-none"
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

      <div className="z-90 relative mx-auto px-3 sm:px-6 lg:px-8 pt-22.5 lg:pt-26.5 pb-28 lg:pb-8 max-w-screen-2xl">
        <div className="relative flex flex-col items-center pt-8 pb-10 sm:pb-14 text-center">
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
            <h1 className="drop-shadow-lg font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight">
              منيو جلاسيه الأمير - غزة
            </h1>
          </div>
        </div>

        {catsError ? (
          <DataError
            title="تعذّر تحميل المنيو"
            description="لم نتمكن من الوصول إلى الخادم، حاول مرة أخرى"
            onRetry={() => void refetchCats()}
            className="mb-8"
          />
        ) : catsLoading ? (
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/10 rounded-[20px] w-36 h-18 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="top-0 z-50 sticky -mx-3 sm:-mx-6 lg:-mx-8 mb-6">
            <div
              ref={selectorScrollRef}
              className="bg-[#2f7a96]/75 backdrop-blur-md px-3 py-2.5 w-full overflow-x-auto no-scrollbar"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-max">
                {categories.map((cat: IMenuCategory) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      ref={(node) => {
                        categoryButtonRefs.current[cat.id] = node;
                      }}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 text-[13px] sm:text-[15px] font-semibold border transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-white text-[#1a4a5a] border-white shadow-[0_4px_14px_rgba(0,0,0,0.16)]"
                          : "bg-white/8 text-white border-white/20 hover:bg-white/16 hover:border-white/35"
                      }`}
                    >
                      <MenuIcon
                        name={cat.icon}
                        size={16}
                        className={
                          isActive ? "text-[#1e9fd8]" : "text-white/85"
                        }
                      />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!catsLoading && (
          <div className="space-y-8 sm:space-y-12">
            {categories.map((cat) => (
              <section
                key={cat.id}
                id={cat.id}
                data-category-id={cat.id}
                ref={setSectionRef(cat.id)}
                className="scroll-mt-16"
              >
                <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
                  <MenuIcon
                    name={cat.icon}
                    size={18}
                    className="text-glace-yellow shrink-0"
                  />
                  <h2 className="font-bold text-[18px] text-white sm:text-[24px]">
                    {cat.label}
                  </h2>
                  <div className="flex-1 bg-white/20 h-px" />
                </div>

                <MenuCategorySection categoryId={cat.id} />
              </section>
            ))}
          </div>
        )}

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
    </div>
  );
}
