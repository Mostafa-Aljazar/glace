"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import EventsBackground from "@/components/Events/EventsBackground";
import AddToCartButton from "@/components/Order/AddToCartButton";
import AddToCartToast from "@/components/Order/AddToCartToast";
import BackButton from "@/components/Order/BackButton";
import FlavorBall from "@/components/Order/FlavorBall";
import OrderLeaveConfirmationDialog from "@/components/Order/OrderLeaveConfirmationDialog";
import { ExtraBiscuitCounter } from "@/components/Order/BiscuitAddons";
import StepCard from "@/components/Order/shared/StepCard";
import Pill from "@/components/Order/shared/Pill";
import { useLeavePageGuard, useAddToCartFeedback } from "@/hooks/order";
import { useMenuAddons } from "@/hooks/menu";
import { useCartStore, type CartSelection } from "@/store/cartStore";
import {
  resolveBuilderPrice,
  resolveMenuImageSrc,
  type IBuilderProduct,
  type IFlavorOption,
} from "@/types/menu.types";

/** Backend id of the extra-biscuit addon inside `GET /menu/addons`. */
const EXTRA_BISCUIT_ADDON_ID = "extra-biscuit";

/** Full price-table heading from API labels (avoid "أسعار أسعار …"). */
function priceTableTitle(
  label: string | undefined,
  fallbackName: string,
): string {
  const raw = (label ?? fallbackName).trim();
  if (!raw) return "الأسعار";
  if (/^أسعار(\s|$)/.test(raw)) return raw;
  return `أسعار ${raw}`;
}

type FlavorFamily = "classic" | "special" | "mix";

const FAMILY_LABELS: Record<FlavorFamily, string> = {
  classic: "كلاسيك",
  special: "سبيشل",
  mix: "مكس",
};

/** Narrows the backend flavor catalog to the balls offered for one family. */
function flavorPoolFor(
  catalog: IFlavorOption[],
  family: FlavorFamily,
): IFlavorOption[] {
  if (family === "classic")
    return catalog.filter(
      (f) => f.family === "classic" || f.family === "stevia",
    );
  if (family === "special")
    return catalog.filter((f) => f.family === "special");
  return catalog; // mix: all families combined
}

/** One size×flavor-family price table for one container group (or the whole
 *  product when sizes aren't split per container, e.g. برادة flavor). */
function PriceTable({
  title,
  sizes,
  showFamilySplit,
}: {
  title: string;
  sizes: IBuilderProduct["sizes"];
  showFamilySplit: boolean;
}) {
  return (
    <div className="bg-white/10 border border-white/15 rounded-[20px] overflow-hidden">
      <h3 className="px-4 pt-3.5 pb-2 font-bold text-[14px] text-white/85">
        {title}
      </h3>
      <div
        className="gap-y-1 grid px-4 pb-3 text-[13px]"
        style={{
          gridTemplateColumns: showFamilySplit
            ? "1.4fr 0.8fr 0.8fr 0.8fr"
            : "1.4fr 0.9fr",
        }}
      >
        <div className="pb-1.5 font-bold text-[11px] text-white/50">الحجم</div>
        {showFamilySplit && (
          <div className="pb-1.5 font-bold text-[11px] text-white/50 text-center">
            كرات
          </div>
        )}
        <div className="pb-1.5 font-bold text-[11px] text-white/50 text-center">
          {showFamilySplit ? "كلاسيك" : "السعر"}
        </div>
        {showFamilySplit && (
          <div className="pb-1.5 font-bold text-[11px] text-white/50 text-center">
            سبيشال
          </div>
        )}

        {sizes.map((size) => {
          const classic = size.prices.find(
            (p) => p.flavorFamily === "classic",
          )?.price;
          const special = size.prices.find(
            (p) => p.flavorFamily === "special",
          )?.price;
          return (
            <div key={size.id} className="contents">
              <div className="py-1 text-white">{size.label}</div>
              {showFamilySplit && (
                <div className="py-1 tabular-nums text-white/70 text-center">
                  {size.maxBalls > 0 ? `×${size.maxBalls}` : "—"}
                </div>
              )}
              <div className="py-1 font-bold tabular-nums text-[#a8e8f8] text-center">
                {classic !== undefined ? `${classic} ₪` : "—"}
              </div>
              {showFamilySplit && (
                <div className="py-1 font-bold tabular-nums text-glace-yellow text-center">
                  {special !== undefined ? `${special} ₪` : "—"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderBuilderTemplate({
  product,
}: {
  product: IBuilderProduct;
}) {
  const searchParams = useSearchParams();
  const requestedContainer = searchParams.get("container");

  // Extra-biscuit pricing is backend-owned — never hardcode a charge.
  const { data: sharedAddons } = useMenuAddons();
  const extraBiscuitAddon = sharedAddons?.find(
    (a) => a.id === EXTRA_BISCUIT_ADDON_ID,
  );
  // Until the catalog loads (or if the backend dropped the addon) the step is
  // hidden rather than shown at a guessed price.
  const showExtraBiscuit =
    !!product.hasExtraBiscuitAddon &&
    !!extraBiscuitAddon &&
    extraBiscuitAddon.available !== false;
  const extraBiscuitPrice = extraBiscuitAddon?.price ?? 0;

  const firstAvailableContainer =
    product.containerOptions?.find((c) => c.available)?.id ??
    product.containerOptions?.[0]?.id ??
    "";
  const [containerId, setContainerId] = useState(
    (requestedContainer &&
    product.containerOptions?.some((c) => c.id === requestedContainer)
      ? requestedContainer
      : firstAvailableContainer) || "",
  );

  const availableSizes = useMemo(
    () =>
      product.sizes.filter(
        (s) => !s.containerId || s.containerId === containerId,
      ),
    [product.sizes, containerId],
  );
  const firstOrderableSize =
    availableSizes.find((s) => s.available !== false) ?? availableSizes[0];
  const [sizeId, setSizeId] = useState(firstOrderableSize?.id ?? "");
  const selectedSize =
    availableSizes.find((s) => s.id === sizeId) ?? availableSizes[0];

  const hasFlavorStep = !!product.flavorFamilies?.length;
  const [flavorFamily, setFlavorFamily] = useState<FlavorFamily | "">(
    product.flavorFamilies?.[0] ?? "",
  );
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
  const [extraBiscuitCount, setExtraBiscuitCount] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const {
    addedToCart,
    validationMsg,
    showValidation,
    markAdded,
    toastMsg,
    dismissToast,
  } = useAddToCartFeedback();

  const selectedContainer = product.containerOptions?.find(
    (c) => c.id === containerId,
  );
  const maxBalls = selectedSize?.maxBalls ?? 0;

  // Flavor balls ride along on the product detail payload — one request, and
  // each product can offer its own set.
  const catalog = useMemo(() => product.flavors ?? [], [product.flavors]);

  const flavorPool =
    hasFlavorStep && flavorFamily ? flavorPoolFor(catalog, flavorFamily) : [];
  const isRepeatable = product.selectionMode === "repeatable";

  // A مكس only makes sense when the size allows more than one ball — a
  // 1-ball size can only ever hold a single flavor, so it can't be split
  // between classic and special.
  const availableFlavorFamilies = (product.flavorFamilies ?? []).filter(
    (f) => f !== "mix" || maxBalls > 1,
  );
  const mixClassicPool = useMemo(
    () => flavorPoolFor(catalog, "classic"),
    [catalog],
  );
  const mixSpecialPool = useMemo(
    () => flavorPoolFor(catalog, "special"),
    [catalog],
  );
  const mixClassicIds = useMemo(
    () => new Set(mixClassicPool.map((f) => f.id)),
    [mixClassicPool],
  );
  const mixSpecialIds = useMemo(
    () => new Set(mixSpecialPool.map((f) => f.id)),
    [mixSpecialPool],
  );

  const hasPendingSelections =
    (product.containerOptions
      ? containerId !== firstAvailableContainer
      : false) ||
    sizeId !== (availableSizes[0]?.id ?? "") ||
    selectedFlavorIds.length > 0 ||
    extraBiscuitCount > 0 ||
    quantity !== 1;

  const clearSelections = useCallback(() => {
    // Compute the reset size against the DEFAULT container's sizes directly —
    // not the `availableSizes` closure, which is still keyed to whichever
    // container was selected when the user filled the form. Using that stale
    // list here left `sizeId` mismatched against the post-reset container,
    // so `hasPendingSelections` never returned to false after add-to-cart.
    const defaultSizes = product.sizes.filter(
      (s) => !s.containerId || s.containerId === firstAvailableContainer,
    );
    setContainerId(firstAvailableContainer);
    setSizeId(defaultSizes[0]?.id ?? "");
    setFlavorFamily(product.flavorFamilies?.[0] ?? "");
    setSelectedFlavorIds([]);
    setExtraBiscuitCount(0);
    setQuantity(1);
  }, [firstAvailableContainer, product]);

  const {
    showCloseConfirm,
    handleCancelLeave,
    handleConfirmLeave,
    handleBeforeBack: guardBeforeBack,
  } = useLeavePageGuard(hasPendingSelections, clearSelections);

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const productCartQuantity = cartItems
    .filter((i) => i.productId === product.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  function selectContainer(id: string) {
    setContainerId(id);
    const nextSizes = product.sizes.filter(
      (s) => !s.containerId || s.containerId === id,
    );
    setSizeId(nextSizes[0]?.id ?? "");
    setSelectedFlavorIds([]);
  }

  function selectContainerAndSize(cId: string, sId: string) {
    setContainerId(cId);
    setSizeId(sId);
    setSelectedFlavorIds([]);
  }

  function selectFlavorFamily(family: FlavorFamily) {
    setFlavorFamily(family);
    setSelectedFlavorIds([]);
  }

  function selectSize(id: string) {
    setSizeId(id);
    const newSize = availableSizes.find((s) => s.id === id);
    if (newSize && newSize.maxBalls <= 1 && flavorFamily === "mix") {
      setFlavorFamily(product.flavorFamilies?.find((f) => f !== "mix") ?? "");
      setSelectedFlavorIds([]);
    }
  }

  function addFlavor(flavorId: string) {
    setSelectedFlavorIds((prev) => {
      if (!isRepeatable && prev.includes(flavorId)) return prev;
      // maxBalls caps the total picks in both modes — toggle mode only
      // controls whether one flavor can be picked more than once, it isn't
      // an "unlimited picks" mode.
      if (prev.length >= maxBalls) return prev;
      if (isRepeatable) {
        // Mix must end up with at least one classic AND one special ball —
        // once only one slot is left, refuse to spend it on a family that
        // already has a representative, so the other family keeps a slot.
        if (flavorFamily === "mix" && maxBalls - prev.length === 1) {
          const classicCount = prev.filter((id) =>
            mixClassicIds.has(id),
          ).length;
          const specialCount = prev.filter((id) =>
            mixSpecialIds.has(id),
          ).length;
          if (mixClassicIds.has(flavorId) && specialCount === 0) return prev;
          if (mixSpecialIds.has(flavorId) && classicCount === 0) return prev;
        }
      }
      return [...prev, flavorId];
    });
  }

  function removeFlavor(flavorId: string) {
    setSelectedFlavorIds((prev) => {
      if (isRepeatable) {
        const idx = prev.lastIndexOf(flavorId);
        if (idx === -1) return prev;
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      }
      return prev.filter((id) => id !== flavorId);
    });
  }

  const unitBasePrice = selectedSize
    ? resolveBuilderPrice(
        product,
        selectedSize,
        (flavorFamily || "classic") as FlavorFamily,
      )
    : 0;
  const addonSum = showExtraBiscuit ? extraBiscuitCount * extraBiscuitPrice : 0;
  const totalPrice = (unitBasePrice + addonSum) * quantity;

  function handleBeforeBack(): boolean {
    return guardBeforeBack();
  }

  function handleAddToCart() {
    if (containerSizesList.length > 0) {
      if (!containerId || !sizeId) return showValidation("اختر النوع و الحجم");
    } else {
      if (product.containerOptions && !containerId)
        return showValidation("اختر النوع");
      if (!selectedSize) return showValidation("اختر الحجم");
    }
    if (hasFlavorStep && selectedFlavorIds.length === 0)
      return showValidation("اختر الأطعمة");
    if (flavorFamily === "mix") {
      const hasClassic = selectedFlavorIds.some((id) => mixClassicIds.has(id));
      const hasSpecial = selectedFlavorIds.some((id) => mixSpecialIds.has(id));
      if (!hasClassic || !hasSpecial) {
        return showValidation("اختر نكهة كلاسيك ونكهة سبيشل على الأقل");
      }
    }

    const flavorCounts = new Map<string, number>();
    for (const id of selectedFlavorIds)
      flavorCounts.set(id, (flavorCounts.get(id) ?? 0) + 1);

    const selections: CartSelection[] = Array.from(flavorCounts.entries()).map(
      ([id, qty]) => ({
        kind: "flavor",
        id,
        label: flavorPool.find((f) => f.id === id)?.nameAr ?? id,
        qty,
        unitPrice: 0,
      }),
    );

    if (showExtraBiscuit && extraBiscuitCount > 0) {
      selections.push({
        kind: "addon",
        id: EXTRA_BISCUIT_ADDON_ID,
        label: extraBiscuitAddon?.label ?? "بسكوت إضافي",
        qty: extraBiscuitCount,
        unitPrice: extraBiscuitPrice,
      });
    }

    const cartName = selectedContainer?.name ?? product.name;

    addItem({
      productId: product.id,
      name: cartName,
      image: resolveMenuImageSrc(selectedContainer?.image ?? product.image),
      size: selectedSize.label,
      container: product.containerOptions
        ? selectedContainer?.label
        : undefined,
      flavorFamily: hasFlavorStep
        ? (flavorFamily as "classic" | "special" | "mix")
        : undefined,
      type: hasFlavorStep
        ? FAMILY_LABELS[flavorFamily as FlavorFamily]
        : selectedContainer?.label,
      selections,
      addonTotal: addonSum,
      unitPrice: unitBasePrice,
      quantity,
    });

    markAdded(`تمت إضافة ${cartName} ×${quantity} إلى السلة`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    clearSelections();
  }

  let stepNumber = 1;

  const hasFamilySplit = product.sizes.some((s) =>
    s.prices.some((p) => p.flavorFamily === "special"),
  );

  // Merged container+size selection only for family product
  const isFamilyProduct = product.slug === "family";
  const containerSizesList = useMemo(() => {
    if (!isFamilyProduct || !product.containerOptions?.length) return [];
    const composite: Array<{
      containerId: string;
      sizeId: string;
      label: string;
      available: boolean;
      image?: string;
    }> = [];
    for (const container of product.containerOptions) {
      const containerSizes = product.sizes.filter(
        (s) => !s.containerId || s.containerId === container.id,
      );
      for (const size of containerSizes) {
        composite.push({
          containerId: container.id,
          sizeId: size.id,
          label: `${size.label} ${container.label}`,
          // Off when the container OR the size alone is stopped, so e.g.
          // "1 لتر فلين" can be disabled while "1/2 لتر فلين" stays orderable.
          available: container.available && size.available !== false,
          // Per-size image wins; fall back to container image when absent.
          image: size.image
            ? resolveMenuImageSrc(size.image)
            : container.image
              ? resolveMenuImageSrc(container.image)
              : undefined,
        });
      }
    }
    return composite;
  }, [product, isFamilyProduct]);

  const priceGroups = useMemo(() => {
    const byContainer = new Map<string | undefined, typeof product.sizes>();
    for (const size of product.sizes) {
      const key = size.containerId;
      byContainer.set(key, [...(byContainer.get(key) ?? []), size]);
    }
    return Array.from(byContainer.entries()).map(([containerKey, sizes]) => {
      const container = product.containerOptions?.find(
        (c) => c.id === containerKey,
      );
      const title = priceTableTitle(
        container?.pricingLabel ?? product.pricingLabel,
        product.name,
      );
      return { key: containerKey ?? "shared", title, sizes };
    });
  }, [product]);

  // Only the table for the currently selected container (or the single
  // shared table when sizes aren't split per container at all).
  const activePriceGroup =
    priceGroups.find((g) => g.key === (containerId || "shared")) ??
    priceGroups[0];

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />
      <BackButton onBeforeBack={handleBeforeBack} />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-52 lg:pb-36 max-w-3xl">
        <div className="bg-white/17 backdrop-blur-[15px] mb-6 rounded-[28px] overflow-hidden">
          <div className="flex md:flex-row flex-col gap-4 p-5">
            {/* Hero (right side in RTL) */}
            <div className="flex flex-col flex-1 justify-center items-center gap-3 text-center">
              <div>
                <h1 className="font-bold text-[24px] text-white sm:text-[28px] leading-tight">
                  {product.name}
                </h1>
                {product.description ? (
                  <p className="text-[16px] text-white/55 md:text-[18px]">
                    {product.description}
                  </p>
                ) : null}
              </div>
              <div className="flex items-end gap-1">
                <Image
                  src={resolveMenuImageSrc(product.image)}
                  alt={product.name}
                  width={160}
                  height={160}
                  className="drop-shadow-xl w-28 sm:w-32 h-28 sm:h-32 object-contain"
                />
              </div>

              {hasFlavorStep && hasFamilySplit && (
                <div className="space-y-2 mt-1 w-full text-start">
                  <p className="text-[16px] text-white/60 md:text-[18px] leading-relaxed">
                    <span className="font-bold text-glace-yellow">
                      كلاسيك:{" "}
                    </span>
                    {mixClassicPool
                      .slice(0, 5)
                      .map((f) => f.nameAr)
                      .join("، ")}{" "}
                    ...
                  </p>
                  <p className="text-[16px] text-white/60 md:text-[18px] leading-relaxed">
                    <span className="font-bold text-glace-yellow">سبيشل: </span>
                    {mixSpecialPool
                      .slice(0, 5)
                      .map((f) => f.nameAr)
                      .join("، ")}{" "}
                    ...
                  </p>
                </div>
              )}
            </div>

            {/* Price table for the currently selected container (left side in RTL) */}
            <div className="flex flex-col flex-1 justify-center gap-3">
              {activePriceGroup && (
                <PriceTable
                  key={activePriceGroup.key}
                  title={activePriceGroup.title}
                  sizes={activePriceGroup.sizes}
                  showFamilySplit={activePriceGroup.sizes.some((s) =>
                    s.prices.some((p) => p.flavorFamily === "special"),
                  )}
                />
              )}
            </div>
          </div>
        </div>

        {containerSizesList.length > 0 ? (
          <StepCard
            step={stepNumber++}
            title="اختر النوع و الحجم"
            done={!!containerId && !!sizeId}
          >
            <div className="flex flex-col gap-3">
              {containerSizesList.map((option) => (
                <button
                  key={`${option.containerId}-${option.sizeId}`}
                  type="button"
                  disabled={!option.available}
                  onClick={() =>
                    option.available &&
                    selectContainerAndSize(option.containerId, option.sizeId)
                  }
                  className={`flex items-center justify-between gap-3 p-4 rounded-[16px] border-2 transition-all ${
                    !option.available
                      ? "bg-white/5 border-red-400/50 cursor-not-allowed"
                      : containerId === option.containerId &&
                          sizeId === option.sizeId
                        ? "bg-glace-yellow border-glace-yellow"
                        : "bg-white/10 border-white/20 hover:bg-white/15"
                  }`}
                >
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    {option.image ? (
                      <img
                        src={option.image}
                        alt={option.label}
                        className={`w-14 h-14 object-contain shrink-0 ${!option.available ? "opacity-60" : ""}`}
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-lg border border-dashed shrink-0 ${
                          !option.available
                            ? "border-white/15 bg-white/5"
                            : containerId === option.containerId &&
                                sizeId === option.sizeId
                              ? "border-[#1e6a7f]/30 bg-white/20"
                              : "border-white/25 bg-white/5"
                        }`}
                        aria-hidden
                      />
                    )}
                    <span
                      className={`text-[14px] font-medium ${
                        !option.available
                          ? "text-white/70"
                          : containerId === option.containerId &&
                              sizeId === option.sizeId
                            ? "text-[#1e6a7f] font-bold"
                            : "text-white"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                  {!option.available && (
                    <div className="flex justify-center items-center bg-red-500/90 rounded-full w-12 h-12 shrink-0">
                      <span className="font-bold text-[9px] text-white text-center leading-tight">
                        غير
                        <br />
                        متوفر
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </StepCard>
        ) : (
          <>
            {product.containerOptions &&
              product.containerOptions.length > 0 && (
                <StepCard
                  step={stepNumber++}
                  title="اختر النوع"
                  done={!!containerId}
                >
                  <div className="flex flex-wrap gap-2.5">
                    {product.containerOptions.map((c) => (
                      <Pill
                        key={c.id}
                        label={c.label}
                        active={containerId === c.id}
                        unavailable={!c.available}
                        onClick={() => c.available && selectContainer(c.id)}
                      />
                    ))}
                  </div>
                </StepCard>
              )}

            <StepCard step={stepNumber++} title="اختر الحجم" done={!!sizeId}>
              <div className="flex flex-wrap gap-2.5">
                {availableSizes.map((s) => (
                  <Pill
                    key={s.id}
                    label={s.label}
                    active={sizeId === s.id}
                    unavailable={s.available === false}
                    onClick={() => selectSize(s.id)}
                  />
                ))}
              </div>
            </StepCard>
          </>
        )}

        {hasFlavorStep && (
          <>
            <StepCard
              step={stepNumber++}
              title={product.includesIceCreamStep ? "أضف بوظة" : "نوع الأطعمة"}
              done={!!flavorFamily}
            >
              <div className="flex flex-wrap gap-2.5">
                {availableFlavorFamilies.map((f) => (
                  <Pill
                    key={f}
                    label={FAMILY_LABELS[f]}
                    active={flavorFamily === f}
                    onClick={() => selectFlavorFamily(f)}
                  />
                ))}
              </div>
            </StepCard>

            <StepCard
              step={stepNumber++}
              title="اختر الأطعمة"
              subtitle={
                isRepeatable
                  ? `${selectedFlavorIds.length}/${maxBalls} كورة`
                  : undefined
              }
              done={selectedFlavorIds.length > 0}
            >
              {catalog.length === 0 ? (
                <p className="bg-white/8 py-6 border border-white/15 rounded-[16px] text-[14px] text-white/60 text-center">
                  لا توجد أطعمة متاحة حالياً
                </p>
              ) : flavorFamily === "mix" ? (
                <div className="space-y-4">
                  {(() => {
                    const classicCount = selectedFlavorIds.filter((id) =>
                      mixClassicIds.has(id),
                    ).length;
                    const specialCount = selectedFlavorIds.filter((id) =>
                      mixSpecialIds.has(id),
                    ).length;
                    const remaining = maxBalls - selectedFlavorIds.length;
                    const classicFull =
                      remaining <= 0 || (remaining === 1 && specialCount === 0);
                    const specialFull =
                      remaining <= 0 || (remaining === 1 && classicCount === 0);
                    return (
                      <>
                        <div>
                          <p className="mb-2 font-bold text-[12px] text-glace-yellow">
                            كلاسيك
                          </p>
                          <div className="flex flex-wrap gap-4">
                            {mixClassicPool.map((flavor) => {
                              const count = selectedFlavorIds.filter(
                                (id) => id === flavor.id,
                              ).length;
                              return (
                                <FlavorBall
                                  key={flavor.id}
                                  flavor={flavor}
                                  count={
                                    isRepeatable
                                      ? count
                                      : selectedFlavorIds.includes(flavor.id)
                                        ? 1
                                        : 0
                                  }
                                  isFull={
                                    isRepeatable
                                      ? classicFull
                                      : classicFull &&
                                        !selectedFlavorIds.includes(flavor.id)
                                  }
                                  onAdd={() => addFlavor(flavor.id)}
                                  onRemove={(e) => {
                                    e.stopPropagation();
                                    removeFlavor(flavor.id);
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 font-bold text-[12px] text-white/85">
                            سبيشل
                          </p>
                          <div className="flex flex-wrap gap-4">
                            {mixSpecialPool.map((flavor) => {
                              const count = selectedFlavorIds.filter(
                                (id) => id === flavor.id,
                              ).length;
                              return (
                                <FlavorBall
                                  key={flavor.id}
                                  flavor={flavor}
                                  count={
                                    isRepeatable
                                      ? count
                                      : selectedFlavorIds.includes(flavor.id)
                                        ? 1
                                        : 0
                                  }
                                  isFull={
                                    isRepeatable
                                      ? specialFull
                                      : specialFull &&
                                        !selectedFlavorIds.includes(flavor.id)
                                  }
                                  onAdd={() => addFlavor(flavor.id)}
                                  onRemove={(e) => {
                                    e.stopPropagation();
                                    removeFlavor(flavor.id);
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {flavorPool.map((flavor) => {
                    const count = selectedFlavorIds.filter(
                      (id) => id === flavor.id,
                    ).length;
                    const isFull = selectedFlavorIds.length >= maxBalls;
                    return (
                      <FlavorBall
                        key={flavor.id}
                        flavor={flavor}
                        count={
                          isRepeatable
                            ? count
                            : selectedFlavorIds.includes(flavor.id)
                              ? 1
                              : 0
                        }
                        isFull={
                          isRepeatable
                            ? isFull
                            : isFull && !selectedFlavorIds.includes(flavor.id)
                        }
                        onAdd={() => addFlavor(flavor.id)}
                        onRemove={(e) => {
                          e.stopPropagation();
                          removeFlavor(flavor.id);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </StepCard>
          </>
        )}

        {showExtraBiscuit && (
          <StepCard step={stepNumber++} title="إضافات">
            <ExtraBiscuitCounter
              count={extraBiscuitCount}
              unitPrice={extraBiscuitPrice}
              label={extraBiscuitAddon?.label}
              maxQty={extraBiscuitAddon?.maxQty}
              onChange={setExtraBiscuitCount}
            />
          </StepCard>
        )}
      </div>

      <div className="bottom-28 lg:bottom-0 z-9999997 fixed inset-x-0 px-3 sm:px-4 pt-6 pb-4 pointer-events-none">
        <div className="flex items-center gap-2 sm:gap-4 bg-[#2d8aaa]/92 backdrop-blur-md mx-auto px-3 sm:px-5 py-3 sm:py-4 border border-white/35 rounded-[24px] max-w-3xl shadow-[0_8px_28px_rgba(0,0,0,0.22)] pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-white/25 px-1.5 sm:px-2 py-1 border border-white/35 rounded-full shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex justify-center items-center hover:bg-white/25 rounded-full w-7 h-7 text-white transition-colors cursor-pointer"
            >
              −
            </button>
            <span className="min-w-5 font-bold text-[15px] text-white text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex justify-center items-center hover:bg-white/25 rounded-full w-7 h-7 text-white transition-colors cursor-pointer"
            >
              +
            </button>
          </div>

          <div className="shrink-0">
            <p className="text-[11px] sm:text-[12px] text-white/75">الإجمالي</p>
            <p className="font-bold text-[18px] sm:text-[22px] text-glace-yellow leading-none tabular-nums">
              {totalPrice.toFixed(2)} ₪
            </p>
          </div>

          <AddToCartButton
            onClick={handleAddToCart}
            canAdd={!!selectedSize}
            addedToCart={addedToCart}
            validationMsg={validationMsg}
            cartQuantity={productCartQuantity}
          />
        </div>
      </div>

      <AddToCartToast message={toastMsg} onClose={dismissToast} />

      <OrderLeaveConfirmationDialog
        open={showCloseConfirm}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />
    </div>
  );
}
