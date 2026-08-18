"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, IceCreamCone, ShoppingCart, Minus, Plus } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import BackButton from "@/components/Order/BackButton";
import AddToCartToast from "@/components/Order/AddToCartToast";
import { iceCreamImg1, iceCreamImg3 } from "@/assets/images";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useCartStore } from "@/store/cartStore";
import { useMenuCategories } from "@/hooks/menu/useMenuCategories";
import { useMenuProducts } from "@/hooks/menu/useMenuProducts";
import { hasRealMedia, MEDIA_PLACEHOLDER } from "@/lib/media";
import {
  isFlatListProduct,
  resolveMenuImageSrc,
  type IProduct,
  type IProductVariant,
  type MenuImage,
} from "@/types/menu.types";

function pickFavoriteImage(item: IProductVariant, product: IProduct): string {
  const itemImage: MenuImage = item.image;
  if (itemImage && typeof itemImage !== "string") {
    return resolveMenuImageSrc(itemImage);
  }
  if (hasRealMedia(itemImage)) {
    return resolveMenuImageSrc(itemImage);
  }
  return resolveMenuImageSrc(product.image);
}

interface FavoriteItem {
  id: string;
  label: string;
  price: number;
  image: string;
  productId: string;
  productSlug: string;
  productName: string;
  category: string;
}

function FavoriteThumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const showFallback = failed || !src || src === MEDIA_PLACEHOLDER;

  if (showFallback) {
    return (
      <div className="flex justify-center items-center bg-white/10 rounded-xl w-16 h-16 shrink-0">
        <IceCreamCone size={26} className="text-white/35" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      className="rounded-xl w-16 h-16 object-contain shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

export default function FavoritesClientPage() {
  const { ids: favoriteIds, toggle: toggleFavorite } = useFavoritesStore();
  const addItem = useCartStore((s) => s.addItem);
  const { data: products = [] } = useMenuProducts();
  const { data: categories = [] } = useMenuCategories();
  const [addedItem, setAddedItem] = useState<FavoriteItem | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const categoryLabels = useMemo(
    () => new Map(categories.map((c) => [c.id, c.label])),
    [categories],
  );

  // Hearts on the order page store `${product.id}-${item.id}`. Older entries
  // used the item label — accept both so saved favorites still appear.
  const favoriteItems = useMemo(() => {
    const pool: FavoriteItem[] = [];
    const saved = new Set(favoriteIds);
    for (const product of products) {
      if (!isFlatListProduct(product)) continue;
      for (const item of product.items) {
        const byItemId = `${product.id}-${item.id}`;
        const byLabel = `${product.id}-${item.label}`;
        const id = saved.has(byItemId)
          ? byItemId
          : saved.has(byLabel)
            ? byLabel
            : saved.has(item.id)
              ? item.id
              : null;
        if (!id) continue;
        pool.push({
          id,
          label: item.label,
          price: item.price,
          image: pickFavoriteImage(item, product),
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          category:
            categoryLabels.get(product.categoryId) ?? product.categoryId,
        });
      }
    }
    return pool;
  }, [products, favoriteIds, categoryLabels]);

  const groupedByCategory = useMemo(() => {
    return favoriteItems.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, FavoriteItem[]>,
    );
  }, [favoriteItems]);

  function getQuantity(itemId: string): number {
    return quantities[itemId] ?? 0;
  }

  function incrementQuantity(itemId: string) {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? 0) + 1,
    }));
  }

  function decrementQuantity(itemId: string) {
    setQuantities((prev) => {
      const current = prev[itemId] ?? 0;
      if (current <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  }

  function handleAddToCart(item: FavoriteItem) {
    try {
      const quantity = getQuantity(item.id);
      addItem({
        productId: item.productId,
        name:
          item.label === item.productName
            ? item.label
            : `${item.productName} — ${item.label}`,
        image: item.image,
        type: item.label,
        selections: [],
        addonTotal: 0,
        unitPrice: item.price,
        quantity: quantity,
      });
      setAddedItem(item);
      setQuantities((prev) => {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      });
      const timeoutId = setTimeout(() => setAddedItem(null), 3000);
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  }

  const countLabel =
    favoriteItems.length === 0
      ? "لا عناصر بعد"
      : favoriteItems.length === 1
        ? "عنصر محفوظ واحد"
        : `${favoriteItems.length} عناصر محفوظة`;

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />
      {addedItem && (
        <AddToCartToast
          message={`تمت إضافة ${addedItem.label} إلى السلة`}
          onClose={() => setAddedItem(null)}
        />
      )}

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-28 max-w-3xl">
        <div className="mb-3 text-start">
          <BackButton />
        </div>
        <div className="relative flex flex-col items-center pt-4 sm:pt-6 pb-6 sm:pb-8 text-center">
          <Image
            src={iceCreamImg1}
            alt=""
            width={80}
            height={80}
            className="top-0 right-0 sm:right-8 absolute drop-shadow-lg w-16 sm:w-20 h-16 sm:h-20 object-contain rotate-[-18deg] pointer-events-none"
          />
          <Image
            src={iceCreamImg3}
            alt=""
            width={72}
            height={72}
            className="top-6 left-0 sm:left-8 absolute drop-shadow-lg w-14 sm:w-18 h-14 sm:h-18 object-contain rotate-12 pointer-events-none"
          />

          <div className="z-10 relative">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm mb-3 px-4 py-1 border border-white/20 rounded-full text-[13px] text-white/80">
              <Heart size={12} className="fill-red-400 text-red-400" />
              نكهاتك المحفوظة
            </span>
            <h1 className="drop-shadow-lg font-bold text-[32px] text-white sm:text-[44px] leading-tight">
              المفضلة
            </h1>
            <p className="mt-2 max-w-70 sm:max-w-90 text-[14px] text-white/65 sm:text-[16px] leading-relaxed">
              الأصناف اللي بتحبها، جاهزة ترجع تطلبها بضغطة
            </p>
            <p className="mt-2 text-[14px] text-white/55">{countLabel}</p>
          </div>
        </div>

        {favoriteItems.length === 0 ? (
          <div className="bg-white/12 backdrop-blur-[15px] px-6 py-12 border border-white/20 rounded-[24px] text-center">
            <Heart size={48} className="mx-auto mb-4 text-white/30" />
            <p className="font-medium text-[18px] text-white">
              لم تضيف أي عناصر للمفضلة
            </p>
            <p className="mt-2 text-[14px] text-white/55">
              ابدأ بالبحث عن المنتجات التي تحبها وأضفها للمفضلة
            </p>
            <Link
              href="/menu"
              className="inline-flex justify-center items-center bg-glace-yellow hover:bg-yellow-300 mt-6 px-6 py-2.5 rounded-full font-bold text-[#1a4a5a] text-[14px] transition-all"
            >
              استكشف المنيو
            </Link>
          </div>
        ) : (
          Object.entries(groupedByCategory).map(([category, items]) => (
            <section key={category} className="mb-8">
              <h2 className="mb-3 font-bold text-[16px] text-white sm:text-[18px]">
                {category}
              </h2>
              <div className="flex flex-col gap-2.5">
                {items.map((item) => {
                  const showProductName = item.productName !== item.label;
                  return (
                    <article
                      key={item.id}
                      className="flex items-center gap-3 bg-white/12 hover:bg-white/18 shadow-[0_6px_18px_rgba(0,0,0,0.1)] px-3 py-3 border border-white/20 hover:border-white/35 rounded-[18px] transition-all duration-200"
                    >
                      <Link
                        href={`/menu/order/${item.productSlug}`}
                        className="shrink-0"
                      >
                        <FavoriteThumb src={item.image} alt={item.label} />
                      </Link>

                      <Link
                        href={`/menu/order/${item.productSlug}`}
                        className="flex-1 min-w-0"
                      >
                        <h3 className="font-semibold text-[15px] text-white line-clamp-1 leading-snug">
                          {item.label}
                        </h3>
                        {showProductName && (
                          <p className="mt-0.5 text-[12px] text-white/50 line-clamp-1">
                            {item.productName}
                          </p>
                        )}
                        <p className="mt-1 font-bold tabular-nums text-[15px] text-glace-yellow">
                          {item.price} ₪
                        </p>
                      </Link>

                      <div className="relative z-10 flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.id)}
                          aria-label="إزالة من المفضلة"
                          className="flex justify-center items-center bg-white/10 hover:bg-white/20 border border-white/15 rounded-full w-9 h-9 cursor-pointer"
                        >
                          <Heart
                            size={16}
                            className="fill-red-500 text-red-500"
                          />
                        </button>

                        {getQuantity(item.id) > 0 ? (
                          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 border border-white/15 rounded-full">
                            <button
                              type="button"
                              onClick={() => decrementQuantity(item.id)}
                              className="flex justify-center items-center hover:bg-white/20 rounded-full w-6 h-6 text-white transition"
                              aria-label="إنقاص الكمية"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="min-w-5 font-bold text-[13px] text-white text-center">
                              {getQuantity(item.id)}
                            </span>
                            <button
                              type="button"
                              onClick={() => incrementQuantity(item.id)}
                              className="flex justify-center items-center hover:bg-white/20 rounded-full w-6 h-6 text-white transition"
                              aria-label="زيادة الكمية"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (getQuantity(item.id) > 0) {
                              handleAddToCart(item);
                            } else {
                              incrementQuantity(item.id);
                            }
                          }}
                          className="inline-flex justify-center items-center gap-1.5 bg-glace-yellow hover:brightness-105 px-3.5 py-2 rounded-full font-bold text-[#1a4a5a] text-[13px] transition-all cursor-pointer"
                        >
                          <ShoppingCart size={14} />
                          أضف للسلة
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
