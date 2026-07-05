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
import {
  chocolateIce,
  vanillaaIce,
  strawberryIce,
  caramelIce,
  nescafeIce,
  nutellaIce,
  lotusIce,
  kinderBuenoIce,
  oreoIce,
  kitKatIce,
  pistachioIce,
  marioIce,
} from "@/assets/images";
import type { StaticIMG } from "@/assets/images";

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: StaticIMG;
  category: string;
}

const ALL_ITEMS: FavoriteItem[] = [
  // Milkshake
  {
    id: "classic-chocolate",
    name: "كلاسيك شوكولاته",
    price: 8,
    image: chocolateIce,
    category: "ميلك شيك",
  },
  {
    id: "classic-vanilla",
    name: "كلاسيك فانيلا",
    price: 8,
    image: vanillaaIce,
    category: "ميلك شيك",
  },
  {
    id: "classic-strawberry",
    name: "كلاسيك فراولة",
    price: 8,
    image: strawberryIce,
    category: "ميلك شيك",
  },
  {
    id: "classic-caramel",
    name: "كلاسيك كاراميل",
    price: 8,
    image: caramelIce,
    category: "ميلك شيك",
  },
  {
    id: "classic-nescafe",
    name: "كلاسيك نسكافيه",
    price: 8,
    image: nescafeIce,
    category: "ميلك شيك",
  },
  {
    id: "classic-barouka",
    name: "كلاسيك باروكا",
    price: 8,
    image: caramelIce,
    category: "ميلك شيك",
  },
  {
    id: "special-nutella",
    name: "سبيشال نوتيلا",
    price: 10,
    image: nutellaIce,
    category: "ميلك شيك",
  },
  {
    id: "special-lotus",
    name: "سبيشال لوتس",
    price: 10,
    image: lotusIce,
    category: "ميلك شيك",
  },
  {
    id: "special-kinder",
    name: "سبيشال كندر",
    price: 10,
    image: kinderBuenoIce,
    category: "ميلك شيك",
  },
  {
    id: "special-oreo",
    name: "سبيشال أوريو",
    price: 10,
    image: oreoIce,
    category: "ميلك شيك",
  },
  {
    id: "special-kitkat",
    name: "سبيشال كت كات",
    price: 10,
    image: kitKatIce,
    category: "ميلك شيك",
  },
  {
    id: "special-fitness",
    name: "سبيشال فيتنس",
    price: 10,
    image: nescafeIce,
    category: "ميلك شيك",
  },
  {
    id: "special-shoufan",
    name: "سبيشال شوفان",
    price: 10,
    image: nutellaIce,
    category: "ميلك شيك",
  },
  {
    id: "serlac",
    name: "سيرلاك (أطعم خاصة)",
    price: 8,
    image: marioIce,
    category: "ميلك شيك",
  },
  {
    id: "einstein",
    name: "اينشتاين (أطعم خاصة)",
    price: 9,
    image: marioIce,
    category: "ميلك شيك",
  },
  {
    id: "pistachio",
    name: "بيستاشيو (أطعم خاصة)",
    price: 13,
    image: pistachioIce,
    category: "ميلك شيك",
  },
];

export default function FavoritesClientPage() {
  const { ids: favoriteIds, toggle: toggleFavorite, isFavorite } =
    useFavoritesStore();
  const addItem = useCartStore((s) => s.addItem);

  const favoriteItems = useMemo(
    () => ALL_ITEMS.filter((item) => favoriteIds.includes(item.id)),
    [favoriteIds],
  );

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
      productId: "favorites",
      name: `${item.category} - ${item.name}`,
      type: item.name,
      addons: [],
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
                          alt={item.name}
                          width={60}
                          height={60}
                          className="w-16 h-16 object-contain rounded-lg shrink-0"
                        />

                        {/* Label + price */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[15px] text-white">
                            {item.name}
                          </p>
                          <p className="text-[16px] font-bold text-glace-yellow">
                            {item.price} ₪
                          </p>
                        </div>

                        {/* Heart favorite */}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.id)}
                          className="shrink-0 transition-colors"
                        >
                          <Heart
                            size={20}
                            className="fill-red-500 text-red-500"
                          />
                        </button>

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
