"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import EventsBackground from "@/components/Events/EventsBackground";
import CartBar from "@/components/Order/CartBar";
import FlavorBall from "@/components/Order/FlavorBall";
import InCartLines from "@/components/Order/InCartLines";
import OrderLeaveConfirmationDialog from "@/components/Order/OrderLeaveConfirmationDialog";
import { ExtraBiscuitCounter } from "@/components/Order/BiscuitAddons";
import StepCard from "@/components/Order/shared/StepCard";
import Pill from "@/components/Order/shared/Pill";
import { useCartHydrated } from "@/hooks/cart/useCartHydrated";
import { useLeavePageGuard, useAddToCartFeedback } from "@/hooks/order";
import { useMenuAddons } from "@/hooks/menu";
import { useCartStore, type CartSelection } from "@/store/cartStore";
import {
  EXTRA_BISCUIT_ADDON_ID,
  pickPriceCell,
  resolveBuilderPrice,
  resolveMenuImageSrc,
  type IAddonOption,
  type IBuilderProduct,
  type IFlavorOption,
  type ISizeOption,
} from "@/types/menu.types";

/** Containers whose units can take per-unit additions — same rule the cart
 *  page's "تخصيص الإضافات" uses (`CartClientPage.resolveAddons`). */
const CUP_CONTAINERS = ["كاسة", "بسكوت"];

/** The single orderable option's id when there is exactly one — such a step
 *  is picked automatically instead of making the user tap the only choice. */
function soleId<T extends { id: string }>(options: T[]): string {
  return options.length === 1 ? options[0].id : "";
}

/** Collapse repeated flavor ids into {id, qty} pairs, keeping pick order. */
function countFlavorPicks(ids: string[]): Array<{ id: string; qty: number }> {
  const counts = new Map<string, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return Array.from(counts, ([id, qty]) => ({ id, qty }));
}

/** Clamp an addon qty to its kind: toggle → 0/1, counter → 0..maxQty. */
function addonMaxQty(addon: IAddonOption): number {
  return addon.type === "counter" ? (addon.maxQty ?? 99) : 1;
}

/** Size-pill caption: ball count when the size holds flavors, otherwise the
 *  size's own price (برادة has no balls, so each pill shows e.g. "3 ₪"). */
function sizePillSubtitle(size: ISizeOption): string | undefined {
  if (size.maxBalls > 0) return `${size.maxBalls} كورة`;
  const price = pickPriceCell(size.prices, "classic");
  return price > 0 ? `${price} ₪` : undefined;
}

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
  rowLabel,
}: {
  title: string;
  sizes: IBuilderProduct["sizes"];
  showFamilySplit: boolean;
  /** Overrides each row's size label, e.g. to prefix the container name
   *  ("1/2 لتر بلاستيك") when merging multiple containers into one table. */
  rowLabel?: (size: IBuilderProduct["sizes"][number]) => string;
}) {
  const showMix = sizes.some((s) =>
    s.prices.some((p) => p.flavorFamily === "mix"),
  );

  return (
    <div className="bg-white/10 border border-white/15 rounded-[20px] overflow-hidden">
      <h3 className="px-4 pt-3.5 pb-2 font-bold text-[14px] text-white/85">
        {title}
      </h3>
      <div
        className="gap-y-1.5 grid px-4 pb-3 text-[12px] items-center"
        style={{
          gridTemplateColumns: showFamilySplit
            ? `1.5fr 0.75fr 0.75fr 0.75fr${showMix ? " 0.75fr" : ""}`
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
        {showFamilySplit && showMix && (
          <div className="pb-1.5 font-bold text-[11px] text-white/50 text-center">
            مكس
          </div>
        )}

        {sizes.map((size) => {
          const classic = size.prices.find(
            (p) => p.flavorFamily === "classic",
          )?.price;
          const special = size.prices.find(
            (p) => p.flavorFamily === "special",
          )?.price;
          const mix = size.prices.find(
            (p) => p.flavorFamily === "mix",
          )?.price;
          return (
            <div key={size.id} className="contents">
              <div className="py-1 font-medium text-[12px] text-white whitespace-nowrap">
                {rowLabel ? rowLabel(size) : size.label}
              </div>
              {showFamilySplit && (
                <div className="py-1 text-[12px] tabular-nums text-white/70 text-center">
                  {size.maxBalls > 0 ? `×${size.maxBalls}` : "—"}
                </div>
              )}
              <div className="py-1 font-bold text-[12px] tabular-nums text-[#a8e8f8] text-center">
                {classic !== undefined ? `${classic} ₪` : "—"}
              </div>
              {showFamilySplit && (
                <div className="py-1 font-bold text-[12px] tabular-nums text-glace-yellow text-center">
                  {special !== undefined ? `${special} ₪` : "—"}
                </div>
              )}
              {showFamilySplit && showMix && (
                <div className="py-1 font-bold text-[12px] tabular-nums text-[#c9f2a8] text-center">
                  {mix !== undefined ? `${mix} ₪` : "—"}
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

  // Nothing with a real choice is pre-selected — the user must actively pick
  // it, so the total stays 0 until then. A step with exactly one orderable
  // option is the exception: it's derived as picked (never stored, so a reset
  // or container switch re-derives it). A container passed via the URL is
  // honored as a starting point since that reflects an explicit prior choice.
  const [pickedContainerId, setContainerId] = useState(
    requestedContainer &&
      product.containerOptions?.some((c) => c.id === requestedContainer)
      ? requestedContainer
      : "",
  );
  const containerId =
    pickedContainerId ||
    soleId((product.containerOptions ?? []).filter((c) => c.available));

  const availableSizes = useMemo(
    () =>
      product.sizes.filter(
        (s) => !s.containerId || s.containerId === containerId,
      ),
    [product.sizes, containerId],
  );
  const [pickedSizeId, setSizeId] = useState("");
  // Sizes only become auto-pickable once the container is known.
  const sizeId =
    pickedSizeId ||
    (!product.containerOptions?.length || containerId
      ? soleId(availableSizes.filter((s) => s.available !== false))
      : "");
  const selectedSize = availableSizes.find((s) => s.id === sizeId);

  const hasFlavorStep = !!product.flavorFamilies?.length;
  const [pickedFlavorFamily, setFlavorFamily] = useState<FlavorFamily | "">(
    "",
  );
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
  const [extraBiscuitCount, setExtraBiscuitCount] = useState(0);
  // Per-unit additions picked on this page (addon id → qty per unit).
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});

  const { validationMsg, showValidation } = useAddToCartFeedback();

  // Whichever step failed validation on the last add-to-cart attempt — its
  // card gets a red border + an inline hint, and the page auto-scrolls to it.
  type StepKey = "typeSize" | "flavorFamily" | "flavorPicks" | "extras";
  const [invalidStep, setInvalidStep] = useState<StepKey | null>(null);
  // A completed step folds down to one line; the one the user reopened to
  // edit stays expanded until they pick something in it.
  const [editingStep, setEditingStep] = useState<
    "container" | "size" | "family" | "picks" | null
  >(null);
  const typeSizeStepRef = useRef<HTMLDivElement>(null);
  const flavorFamilyStepRef = useRef<HTMLDivElement>(null);
  const flavorPicksStepRef = useRef<HTMLDivElement>(null);
  const extrasStepRef = useRef<HTMLDivElement>(null);
  // The size card when it's separate from the container card — its own
  // auto-scroll target once a container is picked.
  const sizeStepRef = useRef<HTMLDivElement>(null);
  const inCartRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Record<StepKey, React.RefObject<HTMLDivElement | null>>>({
    typeSize: typeSizeStepRef,
    flavorFamily: flavorFamilyStepRef,
    flavorPicks: flavorPicksStepRef,
    extras: extrasStepRef,
  });

  const flagInvalidStep = useCallback((step: StepKey, msg: string) => {
    setInvalidStep(step);
    showValidation(msg);
    stepRefs.current[step].current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [showValidation]);

  const maxBalls = selectedSize?.maxBalls ?? 0;
  const isFamilyProduct = product.slug === "family";
  // Family mix is always an even split of whatever maxBalls the size
  // returns (foam or plastic): ½ لتر = 4+4, 1 لتر = 6+6.
  const mixHalf =
    isFamilyProduct && maxBalls > 1 && maxBalls % 2 === 0 ? maxBalls / 2 : 0;
  const equalMixSplit = mixHalf > 0;

  // Flavor balls ride along on the product detail payload — one request, and
  // each product can offer its own set.
  const catalog = useMemo(() => product.flavors ?? [], [product.flavors]);

  // A مكس only makes sense when the size allows more than one ball — a
  // 1-ball size can only ever hold a single flavor, so it can't be split
  // between classic and special.
  const availableFlavorFamilies = (product.flavorFamilies ?? []).filter(
    (f) => f !== "mix" || maxBalls > 1,
  );
  const flavorFamily: FlavorFamily | "" =
    pickedFlavorFamily ||
    (selectedSize && availableFlavorFamilies.length === 1
      ? availableFlavorFamilies[0]
      : "");

  const flavorPool =
    hasFlavorStep && flavorFamily ? flavorPoolFor(catalog, flavorFamily) : [];
  const isRepeatable = product.selectionMode === "repeatable";
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

  // Only what the user actually picked counts — auto-derived single options
  // aren't "unsaved work" worth a leave confirmation.
  const hasPendingSelections =
    !!pickedContainerId ||
    !!pickedSizeId ||
    !!pickedFlavorFamily ||
    selectedFlavorIds.length > 0 ||
    extraBiscuitCount > 0 ||
    Object.keys(addonQty).length > 0;

  // Reset back to the same baseline the page loads with (single-option steps
  // re-derive themselves).
  const clearSelections = useCallback(() => {
    setContainerId("");
    setSizeId("");
    setFlavorFamily("");
    setSelectedFlavorIds([]);
    setExtraBiscuitCount(0);
    setAddonQty({});
    setEditingStep(null);
    setInvalidStep(null);
  }, []);

  const { showCloseConfirm, handleCancelLeave, handleConfirmLeave } =
    useLeavePageGuard(hasPendingSelections, clearSelections);

  const hydrated = useCartHydrated();
  const addItem = useCartStore((s) => s.addItem);
  const allCartItems = useCartStore((s) => s.items);
  const productLines = useMemo(
    () =>
      hydrated ? allCartItems.filter((i) => i.productId === product.id) : [],
    [hydrated, allCartItems, product.id],
  );

  function selectContainer(id: string) {
    setContainerId(id);
    // No size carries over — a different container has its own sizes, and
    // the only one auto-picked is a container's sole size.
    setSizeId("");
    setSelectedFlavorIds([]);
    setEditingStep(null);
  }

  function selectContainerAndSize(cId: string, sId: string) {
    setContainerId(cId);
    setSizeId(sId);
    setSelectedFlavorIds([]);
    setEditingStep(null);
  }

  function selectFlavorFamily(family: FlavorFamily) {
    setFlavorFamily(family);
    setSelectedFlavorIds([]);
    setEditingStep(null);
  }

  function selectSize(id: string) {
    setSizeId(id);
    setEditingStep(null);
    const newSize = availableSizes.find((s) => s.id === id);
    if (newSize && newSize.maxBalls <= 1 && flavorFamily === "mix") {
      setFlavorFamily(product.flavorFamilies?.find((f) => f !== "mix") ?? "");
      setSelectedFlavorIds([]);
    }
  }

  // Per-unit additions offered on this page — the same catalog and rules the
  // cart's "تخصيص الإضافات" uses, minus the extra biscuit (a flat, whole-line
  // extra with its own counter below).
  const selectedContainer = product.containerOptions?.find(
    (c) => c.id === containerId,
  );
  const unitAddons = useMemo(() => {
    const own = product.addons ?? [];
    const eligible =
      own.length > 0 ||
      product.slug === "family" ||
      (!!selectedContainer && CUP_CONTAINERS.includes(selectedContainer.label));
    const source = own.length > 0 ? own : eligible ? (sharedAddons ?? []) : [];
    return source.filter(
      (a) => a.available !== false && a.id !== EXTRA_BISCUIT_ADDON_ID,
    );
  }, [product.addons, product.slug, selectedContainer, sharedAddons]);

  function setUnitAddonQty(addon: IAddonOption, qty: number) {
    setAddonQty((prev) => {
      const next = { ...prev };
      const v = Math.max(0, Math.min(qty, addonMaxQty(addon)));
      if (v <= 0) delete next[addon.id];
      else next[addon.id] = v;
      return next;
    });
  }

  const addonSelections: CartSelection[] = unitAddons.flatMap((addon) => {
    const qty = addonQty[addon.id] ?? 0;
    if (qty <= 0) return [];
    return [
      {
        kind: "addon" as const,
        id: addon.id,
        label: addon.label,
        qty,
        unitPrice: addon.price,
      },
    ];
  });
  const addonUnitTotal = addonSelections.reduce(
    (sum, s) => sum + s.unitPrice * s.qty,
    0,
  );

  function addFlavor(flavorId: string) {
    // Filling the last slot folds a reopened picks step back down.
    if (selectedFlavorIds.length + 1 >= maxBalls) setEditingStep(null);
    setSelectedFlavorIds((prev) => {
      if (!isRepeatable && prev.includes(flavorId)) return prev;
      // maxBalls caps the total picks in both modes — toggle mode only
      // controls whether one flavor can be picked more than once, it isn't
      // an "unlimited picks" mode.
      if (prev.length >= maxBalls) return prev;
      if (isRepeatable && flavorFamily === "mix") {
        const classicCount = prev.filter((id) => mixClassicIds.has(id)).length;
        const specialCount = prev.filter((id) => mixSpecialIds.has(id)).length;
        if (equalMixSplit) {
          if (mixClassicIds.has(flavorId) && classicCount >= mixHalf)
            return prev;
          if (mixSpecialIds.has(flavorId) && specialCount >= mixHalf)
            return prev;
        } else if (maxBalls - prev.length === 1) {
          // Mix must end up with at least one classic AND one special ball —
          // once only one slot is left, refuse to spend it on a family that
          // already has a representative, so the other family keeps a slot.
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

  // Price stays 0 until the user has actually picked a size (and, when the
  // product has a flavor step, a flavor family too) — nothing is
  // pre-selected, so nothing should be priced by default.
  const unitBasePrice =
    selectedSize && (!hasFlavorStep || flavorFamily)
      ? resolveBuilderPrice(
          product,
          selectedSize,
          (flavorFamily || "classic") as FlavorFamily,
        )
      : 0;
  // Extra biscuit is priced once for the whole line — it does NOT scale with
  // quantity (4 بسكوت stays 4 regardless of how many units are ordered).
  const flatAddonSum = showExtraBiscuit
    ? extraBiscuitCount * extraBiscuitPrice
    : 0;
  // What one tap of "أضف" puts in the cart: one unit with its per-unit
  // additions, plus the whole-line flat extras.
  const addPrice = unitBasePrice + addonUnitTotal + flatAddonSum;

  function handleAddToCart() {
    if (containerSizesList.length > 0) {
      if (!containerId || !sizeId)
        return flagInvalidStep("typeSize", "اختر النوع و الحجم");
    } else {
      if (product.containerOptions && !containerId)
        return flagInvalidStep("typeSize", "اختر النوع");
    }
    if (!selectedSize) return flagInvalidStep("typeSize", "اختر الحجم");
    if (hasFlavorStep && !flavorFamily)
      return flagInvalidStep("flavorFamily", "اختر نوع الأطعمة");
    if (hasFlavorStep && selectedFlavorIds.length === 0)
      return flagInvalidStep(
        "flavorPicks",
        "اضغط على كرات الأطعمة للاختيار",
      );
    if (flavorFamily === "mix") {
      const classicCount = selectedFlavorIds.filter((id) =>
        mixClassicIds.has(id),
      ).length;
      const specialCount = selectedFlavorIds.filter((id) =>
        mixSpecialIds.has(id),
      ).length;
      if (equalMixSplit) {
        if (classicCount !== mixHalf || specialCount !== mixHalf) {
          return flagInvalidStep(
            "flavorPicks",
            `اختر ${mixHalf} كرات كلاسيك و ${mixHalf} كرات سبيشل`,
          );
        }
      } else if (classicCount === 0 || specialCount === 0) {
        return flagInvalidStep(
          "flavorPicks",
          "اختر نكهة كلاسيك ونكهة سبيشل على الأقل",
        );
      }
    }

    setInvalidStep(null);

    const selections: CartSelection[] = countFlavorPicks(selectedFlavorIds).map(
      ({ id, qty }) => ({
        kind: "flavor",
        id,
        label: flavorPool.find((f) => f.id === id)?.nameAr ?? id,
        qty,
        unitPrice: 0,
      }),
    );

    const flatSelections: CartSelection[] =
      showExtraBiscuit && extraBiscuitCount > 0
        ? [
            {
              kind: "addon",
              id: EXTRA_BISCUIT_ADDON_ID,
              label: extraBiscuitAddon?.label ?? "بسكوت إضافي",
              qty: extraBiscuitCount,
              unitPrice: extraBiscuitPrice,
            },
          ]
        : [];

    const cartName = selectedContainer?.name ?? product.name;

    addItem({
      productId: product.id,
      name: cartName,
      // Most specific picture first: the chosen size's own image (it shows
      // the actual cup/cone with its scoop count), then the container's.
      image: resolveMenuImageSrc(
        selectedSize.image ?? selectedContainer?.image ?? product.image,
      ),
      size: selectedSize.label,
      sizeId: selectedSize.id,
      container: product.containerOptions
        ? selectedContainer?.label
        : undefined,
      containerId: product.containerOptions ? selectedContainer?.id : undefined,
      flavorFamily: hasFlavorStep
        ? (flavorFamily as "classic" | "special" | "mix")
        : undefined,
      type: hasFlavorStep
        ? FAMILY_LABELS[flavorFamily as FlavorFamily]
        : selectedContainer?.label,
      selections: [...selections, ...addonSelections],
      addonTotal: addonUnitTotal,
      flatSelections,
      flatAddonTotal: flatAddonSum,
      unitPrice: unitBasePrice,
      // Always one — more of the same configuration is stepped from "في
      // سلتك" (an identical re-add merges into the same line anyway).
      quantity: 1,
    });

    clearSelections();
    // Bring "في سلتك" into view, where the new line now sits with its
    // stepper; the cart bar's count/total pulse confirms the add. Deferred a
    // frame so the section has rendered the new line (or mounted at all).
    window.requestAnimationFrame(() => {
      const el = inCartRef.current;
      window.scrollTo({
        top: el ? el.getBoundingClientRect().top + window.scrollY - 112 : 0,
        behavior: "smooth",
      });
    });
  }

  let stepNumber = 1;

  const hasFamilySplit = product.sizes.some((s) =>
    s.prices.some((p) => p.flavorFamily === "special"),
  );

  // Merged container+size selection only for family product
  const containerSizesList = useMemo(() => {
    if (!isFamilyProduct || !product.containerOptions?.length) return [];
    const composite: Array<{
      containerId: string;
      sizeId: string;
      label: string;
      available: boolean;
      image?: string;
      maxBalls: number;
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
          maxBalls: size.maxBalls,
        });
      }
    }
    return composite;
  }, [product, isFamilyProduct]);

  // Steps must be completed in order — each step is locked until every step
  // before it is done, so e.g. "نوع الأطعمة" can't be touched before a
  // size is picked.
  const typeAndSizeDone =
    containerSizesList.length > 0
      ? !!containerId && !!sizeId
      : (!product.containerOptions || !!containerId) && !!sizeId;
  const flavorFamilyDone = !hasFlavorStep || !!flavorFamily;
  const flavorPicksLocked = !typeAndSizeDone || !flavorFamilyDone;
  const flavorPicksDone = !hasFlavorStep || selectedFlavorIds.length > 0;

  // Mirrors handleAddToCart's mix validation, so the red border on "اختر
  // الأطعمة" clears live as soon as the user actually satisfies it, rather
  // than only after another add-to-cart attempt.
  const flavorPicksSatisfied = (() => {
    if (!hasFlavorStep || selectedFlavorIds.length === 0) return false;
    if (flavorFamily !== "mix") return true;
    const classicCount = selectedFlavorIds.filter((id) =>
      mixClassicIds.has(id),
    ).length;
    const specialCount = selectedFlavorIds.filter((id) =>
      mixSpecialIds.has(id),
    ).length;
    return equalMixSplit
      ? classicCount === mixHalf && specialCount === mixHalf
      : classicCount > 0 && specialCount > 0;
  })();
  const extrasLocked = flavorPicksLocked || !flavorPicksDone;
  const hasExtrasStep = showExtraBiscuit || unitAddons.length > 0;

  // Picks only count as finished (fold + move on) once every ball slot is
  // used — fewer balls is still orderable, but the user may be mid-pick.
  const flavorPicksComplete =
    flavorPicksSatisfied && selectedFlavorIds.length >= maxBalls;
  const canAdd =
    typeAndSizeDone &&
    flavorFamilyDone &&
    (!hasFlavorStep || flavorPicksSatisfied);

  // The first step still waiting on the user. When it moves forward, the page
  // scrolls to it so the user never has to hunt for what comes next.
  type ProgressStep = StepKey | "size" | "done";
  const currentStep: ProgressStep = !typeAndSizeDone
    ? product.containerOptions?.length &&
      containerSizesList.length === 0 &&
      containerId
      ? "size"
      : "typeSize"
    : !flavorFamilyDone
      ? "flavorFamily"
      : hasFlavorStep && !flavorPicksComplete
        ? "flavorPicks"
        : hasExtrasStep
          ? "extras"
          : "done";
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    const order: ProgressStep[] = [
      "typeSize",
      "size",
      "flavorFamily",
      "flavorPicks",
      "extras",
      "done",
    ];
    const prev = prevStepRef.current;
    prevStepRef.current = currentStep;
    // Only on forward progress — a reset after adding, or reopening an
    // earlier step, must not yank the page around.
    if (currentStep === "done" || order.indexOf(currentStep) <= order.indexOf(prev))
      return;
    const el = (
      currentStep === "size" ? sizeStepRef : stepRefs.current[currentStep]
    ).current;
    if (!el) return;
    // Explicit offset rather than scrollIntoView + scroll-margin, which lands
    // the card under the fixed header on mobile Chrome.
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 112,
      behavior: "smooth",
    });
  }, [currentStep]);

  const flavorPicksSummary = countFlavorPicks(selectedFlavorIds)
    .map(({ id, qty }) => {
      const name = catalog.find((f) => f.id === id)?.nameAr ?? id;
      return qty > 1 ? `${name} ×${qty}` : name;
    })
    .join("، ");

  // Live one-line recap for the bottom bar, e.g. "كاسة · وسط · 2/3 كورة".
  const progressSummary = [
    selectedContainer?.label,
    selectedSize?.label,
    hasFlavorStep && flavorFamily ? FAMILY_LABELS[flavorFamily] : undefined,
    hasFlavorStep && flavorFamily && maxBalls > 0
      ? `${selectedFlavorIds.length}/${maxBalls} كورة`
      : undefined,
  ]
    .filter(Boolean)
    .join(" · ");
  const nextHint = !typeAndSizeDone
    ? product.containerOptions?.length && !containerId
      ? "اختر النوع"
      : "اختر الحجم"
    : !flavorFamilyDone
      ? "اختر نوع الأطعمة"
      : hasFlavorStep && !flavorPicksSatisfied
        ? "اختر الأطعمة"
        : hasFlavorStep && !flavorPicksComplete
          ? `باقي ${maxBalls - selectedFlavorIds.length} كورة`
          : "";

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

  // Family product: one merged table across every container (بلاستيك/فلين)
  // instead of switching tables with the selected container.
  const mergedFamilyPriceGroup = useMemo(() => {
    if (!isFamilyProduct || !product.containerOptions?.length) return null;
    const sizes = product.containerOptions.flatMap((container) =>
      product.sizes.filter((s) => s.containerId === container.id),
    );
    return {
      key: "family-merged",
      title: priceTableTitle(product.pricingLabel, product.name),
      sizes,
    };
  }, [isFamilyProduct, product]);

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />
      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-72 lg:pb-52 max-w-3xl">
        <div className="bg-white/17 backdrop-blur-[15px] mb-6 rounded-[28px] overflow-hidden">
          <div className="flex md:flex-row flex-col gap-4 p-5">
            {/* Hero (right side in RTL) */}
            <div className="flex flex-col flex-1 justify-center items-center gap-3 text-center">
              <h1 className="font-bold text-[36px] text-white sm:text-[46px] leading-tight">
                {product.name}
              </h1>
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

            {/* Price table (left side in RTL): merged across containers for
                the family product, otherwise just the selected container's */}
            <div className="flex flex-col flex-1 justify-center gap-3">
              {mergedFamilyPriceGroup ? (
                <PriceTable
                  key={mergedFamilyPriceGroup.key}
                  title={mergedFamilyPriceGroup.title}
                  sizes={mergedFamilyPriceGroup.sizes}
                  showFamilySplit={mergedFamilyPriceGroup.sizes.some((s) =>
                    s.prices.some((p) => p.flavorFamily === "special"),
                  )}
                  rowLabel={(size) => {
                    const container = product.containerOptions?.find(
                      (c) => c.id === size.containerId,
                    );
                    return container
                      ? `${size.label} ${container.label}`
                      : size.label;
                  }}
                />
              ) : (
                activePriceGroup && (
                  <PriceTable
                    key={activePriceGroup.key}
                    title={activePriceGroup.title}
                    sizes={activePriceGroup.sizes}
                    showFamilySplit={activePriceGroup.sizes.some((s) =>
                      s.prices.some((p) => p.flavorFamily === "special"),
                    )}
                  />
                )
              )}
            </div>
          </div>
        </div>

        <div ref={inCartRef}>
          <InCartLines lines={productLines} />
        </div>

        {containerSizesList.length > 0 ? (
          <StepCard
            ref={typeSizeStepRef}
            step={stepNumber++}
            title="اختر النوع و الحجم"
            done={!!containerId && !!sizeId}
            collapsed={!!selectedSize && editingStep !== "size"}
            summary={`${selectedSize?.label ?? ""} ${selectedContainer?.label ?? ""}`}
            onExpand={() => setEditingStep("size")}
            error={invalidStep === "typeSize" && !(containerId && sizeId)}
            errorMsg="اختر النوع و الحجم"
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
                    <div className="flex flex-col items-start min-w-0">
                      <span
                        className={`text-start text-[14px] font-medium ${
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
                      {option.maxBalls > 0 && (
                        <span
                          className={`text-start text-[12px] ${
                            !option.available
                              ? "text-white/50"
                              : containerId === option.containerId &&
                                  sizeId === option.sizeId
                                ? "text-[#1e6a7f]/70"
                                : "text-white/60"
                          }`}
                        >
                          {option.maxBalls} كورة
                        </span>
                      )}
                    </div>
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
                  ref={typeSizeStepRef}
                  step={stepNumber++}
                  title="اختر النوع"
                  done={!!containerId}
                  collapsed={!!selectedContainer && editingStep !== "container"}
                  summary={selectedContainer?.label}
                  onExpand={() => setEditingStep("container")}
                  error={invalidStep === "typeSize" && !containerId}
                  errorMsg="اختر النوع"
                >
                  <div className="flex flex-wrap gap-2.5">
                    {product.containerOptions.map((c) => (
                      <Pill
                        key={c.id}
                        label={c.label}
                        active={containerId === c.id}
                        unavailable={!c.available}
                        onClick={() => c.available && selectContainer(c.id)}
                        image={
                          c.image ? resolveMenuImageSrc(c.image) : undefined
                        }
                      />
                    ))}
                  </div>
                </StepCard>
              )}

            <StepCard
              ref={
                !product.containerOptions || product.containerOptions.length === 0
                  ? typeSizeStepRef
                  : sizeStepRef
              }
              step={stepNumber++}
              title="اختر الحجم"
              done={!!sizeId}
              collapsed={!!selectedSize && editingStep !== "size"}
              summary={selectedSize?.label}
              onExpand={() => setEditingStep("size")}
              locked={!!product.containerOptions && !containerId}
              error={invalidStep === "typeSize" && !!containerId && !sizeId}
              errorMsg="اختر الحجم"
            >
              <div className="flex flex-wrap gap-2.5">
                {availableSizes.map((s) => (
                  <Pill
                    key={s.id}
                    label={s.label}
                    active={sizeId === s.id}
                    unavailable={s.available === false}
                    onClick={() => selectSize(s.id)}
                    subtitle={sizePillSubtitle(s)}
                    image={s.image ? resolveMenuImageSrc(s.image) : undefined}
                  />
                ))}
              </div>
            </StepCard>
          </>
        )}

        {hasFlavorStep && (
          <>
            <StepCard
              ref={flavorFamilyStepRef}
              step={stepNumber++}
              title={product.includesIceCreamStep ? "أضف بوظة" : "نوع الأطعمة"}
              done={!!flavorFamily}
              collapsed={!!flavorFamily && editingStep !== "family"}
              summary={flavorFamily ? FAMILY_LABELS[flavorFamily] : undefined}
              onExpand={() => setEditingStep("family")}
              locked={!typeAndSizeDone}
              error={invalidStep === "flavorFamily" && !flavorFamily}
              errorMsg="اختر نوع الأطعمة"
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
              ref={flavorPicksStepRef}
              step={stepNumber++}
              title="اختر الأطعمة"
              subtitle={
                isRepeatable
                  ? equalMixSplit && flavorFamily === "mix"
                    ? `${selectedFlavorIds.length}/${maxBalls} · ${mixHalf} كلاسيك + ${mixHalf} سبيشل`
                    : `${selectedFlavorIds.length}/${maxBalls} كورة`
                  : undefined
              }
              done={selectedFlavorIds.length > 0}
              collapsed={flavorPicksComplete && editingStep !== "picks"}
              summary={flavorPicksSummary}
              onExpand={() => setEditingStep("picks")}
              locked={flavorPicksLocked}
              error={invalidStep === "flavorPicks" && !flavorPicksSatisfied}
              errorMsg={validationMsg || "اضغط على كرات الأطعمة للاختيار"}
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
                    const classicFull = equalMixSplit
                      ? classicCount >= mixHalf || remaining <= 0
                      : remaining <= 0 ||
                        (remaining === 1 && specialCount === 0);
                    const specialFull = equalMixSplit
                      ? specialCount >= mixHalf || remaining <= 0
                      : remaining <= 0 ||
                        (remaining === 1 && classicCount === 0);
                    return (
                      <>
                        <div>
                          <p className="mb-2 font-bold text-[12px] text-glace-yellow">
                            كلاسيك
                            {equalMixSplit ? ` ${classicCount}/${mixHalf}` : ""}
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
                            {equalMixSplit ? ` ${specialCount}/${mixHalf}` : ""}
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

        {hasExtrasStep && (
          <StepCard
            ref={extrasStepRef}
            step={stepNumber++}
            title="إضافات"
            subtitle="اختياري"
            locked={extrasLocked}
          >
            <div className="flex flex-col gap-2.5">
              {unitAddons.map((addon) => (
                <ExtraBiscuitCounter
                  key={addon.id}
                  count={addonQty[addon.id] ?? 0}
                  unitPrice={addon.price}
                  label={addon.label}
                  maxQty={addonMaxQty(addon)}
                  onChange={(qty) => setUnitAddonQty(addon, qty)}
                />
              ))}
              {showExtraBiscuit && (
                <ExtraBiscuitCounter
                  count={extraBiscuitCount}
                  unitPrice={extraBiscuitPrice}
                  label={extraBiscuitAddon?.label}
                  maxQty={extraBiscuitAddon?.maxQty}
                  onChange={setExtraBiscuitCount}
                />
              )}
            </div>
          </StepCard>
        )}
      </div>

      <div className="bottom-28 lg:bottom-0 z-9999997 fixed inset-x-0 px-3 sm:px-4 pt-6 pb-4 pointer-events-none">
        <div className="flex flex-col gap-2 mx-auto max-w-3xl">
          <CartBar floating={false} />

          <div className="flex items-center gap-3 sm:gap-4 bg-[#2d8aaa]/92 shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-md px-4 sm:px-5 py-3 sm:py-4 border border-white/35 rounded-[24px] pointer-events-auto">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-white/75 truncate">
                {progressSummary || product.name}
              </p>
              <p
                className={`font-bold text-[14px] sm:text-[15px] truncate ${
                  canAdd ? "text-glace-yellow" : "text-white"
                }`}
              >
                {nextHint || (canAdd ? "جاهز للإضافة" : "")}
              </p>
            </div>

            {/* Still clickable before the required steps are done — the tap
                flags and scrolls to whichever step is missing. */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`shrink-0 px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-[14px] sm:text-[16px] whitespace-nowrap tabular-nums transition-all cursor-pointer ${
                canAdd
                  ? "bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] shadow-[0_4px_20px_rgba(244,228,81,0.4)] hover:-translate-y-0.5"
                  : "bg-white/30 text-white/70"
              }`}
            >
              {canAdd ? `أضف · ${addPrice.toFixed(2)} ₪` : "أضف"}
            </button>
          </div>
        </div>
      </div>

      <OrderLeaveConfirmationDialog
        open={showCloseConfirm}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />
    </div>
  );
}
