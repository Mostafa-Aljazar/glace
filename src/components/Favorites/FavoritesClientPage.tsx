"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import BackButton from "@/components/Order/BackButton";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useCartStore } from "@/store/cartStore";
import { useMenuCategories } from "@/hooks/menu/useMenuCategories";
import { useMenuProducts } from "@/hooks/menu/useMenuProducts";
import { isFlatListProduct, resolveMenuImageSrc } from "@/types/menu.types";

interface FavoriteItem {
  id: string;
  label: string;
  price: number;
  image: string;
  productId: string;
  productName: string;
  category: string;
}

export default function FavoritesClientPage() {
  const { ids: favoriteIds, toggle: toggleFavorite } = useFavoritesStore();
  const addItem = useCartStore((s) => s.addItem);
  const { data: products = [] } = useMenuProducts();
  const { data: categories = [] } = useMenuCategories();

  const categoryLabels = useMemo(
    () => new Map(categories.map((c) => [c.id, c.label])),
    [categories],
  );

  // Favorite ids are written as `${productId}-${itemLabel}` from the order
  // page's heart button (OrderFlatListTemplate) — matched back against the
  // live product catalog here instead of a separate hardcoded list, so a
  // favorited item actually shows up on this page.
  const favoriteItems = useMemo(() => {
    const pool: FavoriteItem[] = [];
    for (const product of products) {
      if (!isFlatListProduct(product)) continue;
      for (const item of product.items) {
        const id = `${product.id}-${item.label}`;
        if (!favoriteIds.includes(id)) continue;
        pool.push({
          id,
          label: item.label,
          price: item.price,
          image: resolveMenuImageSrc(item.image ?? product.image),
          productId: product.id,
          productName: product.name,
          category: categoryLabels.get(product.categoryId) ?? product.categoryId,
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

  function handleAddToCart(item: FavoriteItem) {
    addItem({
      productId: item.productId,
      name: `${item.productName} — ${item.label}`,
      image: item.image,
      type: item.label,
      selections: [],
      addonTotal: 0,
      unitPrice: item.price,
      quantity: 1,
    });
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <BackButton />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-36 max-w-3xl">
        {/* ── Hero card ── */}
        <div className="bg-white/17 backdrop-blur-[15px] mb-6 rounded-[28px] overflow-hidden">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <h1 className="font-bold text-[28px] text-white sm:text-[34px] leading-tight">
                المفضلة
              </h1>
              <p className="text-[14px] text-white/55 mt-2">
                {favoriteItems.length} عنصر مفضل
              </p>
            </div>
          </div>
        </div>

        {/* ── Favorites list ── */}
        {favoriteItems.length === 0 ? (
          <div className="bg-white/17 backdrop-blur-[15px] rounded-[28px] overflow-hidden">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Heart size={48} className="text-white/30 mb-4" />
              <p className="text-[18px] font-medium text-white">
                لم تضيف أي عناصر للمفضلة
              </p>
              <p className="text-[14px] text-white/55 mt-2">
                ابدأ بالبحث عن المنتجات التي تحبها وأضفها للمفضلة
              </p>
              <Link
                href="/menu"
                className="mt-6 px-6 py-2.5 rounded-full font-bold text-[14px] bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] transition-all"
              >
                استكشف المنيو
              </Link>
            </div>
          </div>
        ) : (
          Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h2 className="mb-3 font-bold text-[18px] text-white">
                {category}
              </h2>
              <div className="bg-white/17 backdrop-blur-[15px] rounded-[28px] overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 border border-white/10 rounded-[16px] px-4 py-4 bg-white/8 hover:bg-white/12 transition-all"
                      >
                        {/* Image */}
                        <Image
                          src={item.image}
                          alt={item.label}
                          width={60}
                          height={60}
                          className="w-16 h-16 object-contain rounded-lg shrink-0"
                        />

                        {/* Label */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[15px] text-white">
                            {item.label}
                          </p>
                        </div>

                        {/* Price + heart favorite */}
                        <div className="flex items-center gap-2 shrink-0">
                          <p className="text-[16px] font-bold text-glace-yellow whitespace-nowrap">
                            {item.price} ₪
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleFavorite(item.id)}
                            className="transition-colors"
                          >
                            <Heart
                              size={20}
                              className="fill-red-500 text-red-500"
                            />
                          </button>
                        </div>

                        {/* Add to cart button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="flex items-center gap-1.5 bg-glace-yellow hover:bg-yellow-300 px-4 py-2 border-0 rounded-full font-bold text-[13px] text-[#1e6a7f] transition-all cursor-pointer shrink-0 shadow-md"
                        >
                          <ShoppingCart size={13} />
                          أضف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CartBar />
    </div>
  );
}
