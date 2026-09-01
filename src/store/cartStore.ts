import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Cart-level shared addon catalog (extras accordion on the cart page). */
export interface Addon {
  id: number;
  name: string;
  price: number;
}

export const ADDONS: Addon[] = [
  { id: 1, name: "بسكوت مخروط فاضي", price: 3 },
  { id: 2, name: "حلبي", price: 3 },
  { id: 3, name: "بندق", price: 5 },
  { id: 4, name: "صوص نوتيلا", price: 7 },
  { id: 5, name: "صوص لوتس", price: 7 },
  { id: 6, name: "صوص حلبي بيستاشيو", price: 7 },
  { id: 7, name: "صوص كراميل", price: 7 },
  { id: 8, name: "صوص كندر", price: 7 },
];

export const EMPTY_CONE_ADDON = ADDONS[0];
export const MULTI_CHOICE_ADDONS = ADDONS.filter((a) => a.id > 1);
export const MAX_MULTI_ADDONS = 4;

/** One structured, priced pick inside a cart line — replaces the old
 *  `flavors?: string[]` / `addons?: string[]` string-encoded pair (which
 *  needed two differently-anchored regexes to parse quantities back out). */
export type SelectionKind = "flavor" | "mix" | "addon";

export interface CartSelection {
  kind: SelectionKind;
  id: string; // flavor id / addon id / mix rule id — never a label-string key
  label: string;
  qty: number; // repeat count OR a toggle-selected flavor's count of 1
  unitPrice: number; // 0 for flavor choices bundled into the base price
}

/** One physical unit of a cart line, with its own additions — used when a line
 *  is customized "differently per unit" from the cart page. */
export interface CartUnit {
  selections: CartSelection[]; // this unit's additions (kind: "addon")
  // note?: string;            // reserved for future per-unit notes
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  /** Product thumbnail URL (StaticImageData.src) for cart display */
  image?: string;
  size?: string;
  type?: string;
  /** Builder products only — e.g. Cup's "بسكوت", Family's "فلين" container. */
  container?: string;
  flavorFamily?: "classic" | "special" | "mix";
  /** Structured flavor/mix/addon picks for this line. */
  selections: CartSelection[];
  addonTotal: number;
  unitPrice: number;
  quantity: number;
  /** When present, per-unit additions override the shared `selections`/`addonTotal`.
   *  Invariant: `units.length === quantity`. Absent = uniform line (default). */
  units?: CartUnit[];
  /** Addons priced once for the whole line, independent of quantity — e.g.
   *  "4 بسكوت إضافي" for the line stays 4 regardless of how many units are
   *  ordered. Kept separate from `selections`/`addonTotal`, which are always
   *  per-unit and scale with `quantity`. */
  flatSelections?: CartSelection[];
  flatAddonTotal?: number;
}

/** Sum of priced picks in a selection array (per-unit addon cost). */
export function sumSelections(selections: CartSelection[]): number {
  return selections.reduce((s, x) => s + x.unitPrice * x.qty, 0);
}

/** Full price of a cart line — base×qty plus addons, whether uniform or per-unit,
 *  plus any flat addons priced once for the whole line (never scaled by qty). */
export function getLineItemTotal(item: CartItem): number {
  const addonCost = item.units
    ? item.units.reduce((s, u) => s + sumSelections(u.selections), 0)
    : (item.addonTotal ?? 0) * item.quantity;
  return item.unitPrice * item.quantity + addonCost + (item.flatAddonTotal ?? 0);
}

function labelWithQty(s: CartSelection): string {
  return s.qty > 1 ? `${s.label} ×${s.qty}` : s.label;
}

/** Invoice-ready detail lines for a cart item — size/container/type, flavors,
 *  and addons (per-unit when customized) each as their own line, so
 *  kitchen/delivery staff never has to open the item or ask what's in it. */
export function getLineItemSummaryParts(item: CartItem): string[] {
  const parts: string[] = [];

  const props = [item.size, item.container, item.type].filter(Boolean);
  if (props.length > 0) parts.push(props.join(" · "));

  const flavors = item.selections
    .filter((s) => s.kind === "flavor" || s.kind === "mix")
    .map(labelWithQty);
  if (flavors.length > 0) parts.push(`الأطعمة: ${flavors.join("، ")}`);

  if (item.units) {
    // Group units that ended up with identical addon picks so the count is
    // stated once ("3 وحدات: ...") instead of repeating the same line per unit.
    const groups: { unitNumbers: number[]; label: string }[] = [];
    item.units.forEach((unit, i) => {
      const addons = unit.selections
        .filter((s) => s.kind === "addon")
        .map(labelWithQty);
      const label =
        addons.length > 0 ? `إضافات: ${addons.join("، ")}` : "بدون إضافات";
      const existing = groups.find((g) => g.label === label);
      if (existing) existing.unitNumbers.push(i + 1);
      else groups.push({ unitNumbers: [i + 1], label });
    });
    groups.sort((a, b) =>
      a.label === "بدون إضافات" ? 1 : b.label === "بدون إضافات" ? -1 : 0,
    );
    for (const g of groups) {
      const unitLabel =
        g.unitNumbers.length > 1
          ? `${g.unitNumbers.length} وحدات`
          : `وحدة ${g.unitNumbers[0]}`;
      parts.push(`${unitLabel} ${g.label}`);
    }
  } else {
    const addons = item.selections
      .filter((s) => s.kind === "addon")
      .map(labelWithQty);
    if (addons.length > 0) parts.push(`إضافات: ${addons.join("، ")}`);
  }

  const flatAddons = (item.flatSelections ?? []).map(labelWithQty);
  if (flatAddons.length > 0) {
    // HINT: fixed for the whole line — does not scale with quantity.
    parts.push(`إضافات ثابتة لكامل الطلبية: ${flatAddons.join("، ")}`);
  }

  return parts;
}

/** Same detail as `getLineItemSummaryParts`, joined into one line. Pass
 *  `includeName: false` where the item name is already shown alongside it. */
export function getLineItemSummary(
  item: CartItem,
  { includeName = true }: { includeName?: boolean } = {},
): string {
  const parts = getLineItemSummaryParts(item);
  if (includeName) parts.unshift(item.name);
  return parts.join("  •  ");
}

/** One priced table row for an invoice-style line-item breakdown. */
export interface LineItemRow {
  flavor: string; // flavors/mix for this row, or "—" when the line has none
  addons: string; // addons for this row, or "—" when there are none
  qty: number;
  unitPrice: number;
  total: number;
}

/** Same data as `getLineItemSummaryParts`, shaped as priced table rows
 *  instead of free-text lines — one row per unit-group when the line has
 *  per-unit customization, one row for the whole line otherwise. */
export function getLineItemRows(item: CartItem): LineItemRow[] {
  const flavors = item.selections
    .filter((s) => s.kind === "flavor" || s.kind === "mix")
    .map(labelWithQty)
    .join("، ") || "—";

  const flatAddonLabels = (item.flatSelections ?? []).map(labelWithQty);

  if (!item.units) {
    const addonLabels = item.selections
      .filter((s) => s.kind === "addon")
      .map(labelWithQty)
      .concat(flatAddonLabels)
      .join("، ") || "—";
    const addonUnitCost = item.addonTotal ?? 0;
    return [
      {
        flavor: flavors,
        addons: addonLabels,
        qty: item.quantity,
        unitPrice: item.unitPrice + addonUnitCost,
        total: getLineItemTotal(item),
      },
    ];
  }

  const groups: { unitNumbers: number[]; addons: string; addonCost: number }[] = [];
  item.units.forEach((unit, i) => {
    const addonLabels = unit.selections
      .filter((s) => s.kind === "addon")
      .map(labelWithQty)
      .join("، ") || "—";
    const addonCost = sumSelections(unit.selections);
    const existing = groups.find((g) => g.addons === addonLabels);
    if (existing) existing.unitNumbers.push(i + 1);
    else groups.push({ unitNumbers: [i + 1], addons: addonLabels, addonCost });
  });
  groups.sort((a, b) =>
    a.addons === "—" ? 1 : b.addons === "—" ? -1 : 0,
  );

  return groups.map((g) => ({
    flavor: flavors,
    addons: g.addons,
    qty: g.unitNumbers.length,
    unitPrice: item.unitPrice + g.addonCost,
    total: (item.unitPrice + g.addonCost) * g.unitNumbers.length,
  }));
}

interface CartState {
  items: CartItem[];
  /** Shared cart addons — charged once for the whole order */
  cartAddons: string[];
  cartAddonTotal: number;
  orderNote: string;
  coupon: string;
  discount: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  /** Apply one shared additions set to every unit of a line (clears per-unit units). */
  setItemSharedAddons: (id: string, selections: CartSelection[], addonTotal: number) => void;
  /** Apply per-unit additions to a line; drives quantity from `units.length`. */
  setItemUnits: (id: string, units: CartUnit[]) => void;
  /** Replace a line's flat addons — priced once for the whole line, independent
   *  of quantity (e.g. "4 بسكوت إضافي" for the whole order, not per unit). */
  setItemFlatAddons: (id: string, selections: CartSelection[], addonTotal: number) => void;
  setOrderNote: (note: string) => void;
  setCartAddons: (addons: string[], addonTotal: number) => void;
  /** Sets the applied coupon and its resolved discount amount — called by
   *  `useApplyCoupon()` after `POST /cart/apply-coupon` (or its fallback)
   *  resolves, rather than computed here. */
  setCoupon: (code: string, discount: number) => void;
  clearCart: () => void;
  itemsSubtotal: () => number;
  subtotal: () => number;
  total: () => number;
}

const CART_ADDON_NAMES = new Set(ADDONS.map((a) => a.name));

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Combine two flat-selection arrays, summing qty for matching addon ids —
 *  used when a matching cart line is re-added with its own flat picks. */
function mergeFlatSelections(
  a: CartSelection[],
  b: CartSelection[],
): CartSelection[] {
  const merged = new Map<string, CartSelection>();
  for (const sel of [...a, ...b]) {
    const prev = merged.get(sel.id);
    merged.set(sel.id, prev ? { ...prev, qty: prev.qty + sel.qty } : sel);
  }
  return Array.from(merged.values());
}

/** Check if two selection arrays are identical */
function selectionsMatch(a: CartSelection[], b: CartSelection[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x.id.localeCompare(y.id));
  const sortedB = [...b].sort((x, y) => x.id.localeCompare(y.id));
  return sortedA.every(
    (sel, i) =>
      sel.kind === sortedB[i].kind &&
      sel.id === sortedB[i].id &&
      sel.label === sortedB[i].label &&
      sel.qty === sortedB[i].qty &&
      sel.unitPrice === sortedB[i].unitPrice,
  );
}

/** Find existing cart item matching product + type + container + size + flavorFamily + selections */
function findMatchingItem(
  items: CartItem[],
  item: Omit<CartItem, "id">,
): CartItem | undefined {
  return items.find(
    (existing) =>
      existing.productId === item.productId &&
      existing.type === item.type &&
      existing.size === item.size &&
      existing.container === item.container &&
      existing.flavorFamily === item.flavorFamily &&
      existing.addonTotal === item.addonTotal &&
      selectionsMatch(existing.selections, item.selections),
  );
}

function parseAddonLine(line: string): { name: string; qty: number } {
  const match = line.match(/^(.*)\s×(\d+)$/);
  if (match) return { name: match[1].trim(), qty: Number(match[2]) };
  return { name: line.trim(), qty: 1 };
}

/** True if this line is a shared cart catalog addon (not order-page biscuit extras) */
function isCartCatalogAddon(line: string): boolean {
  const { name } = parseAddonLine(line);
  return CART_ADDON_NAMES.has(name);
}

function calcCatalogAddonTotal(addonLines: string[]): number {
  return addonLines.reduce((sum, line) => {
    const { name, qty } = parseAddonLine(line);
    if (!CART_ADDON_NAMES.has(name)) return sum;
    const addon = ADDONS.find((a) => a.name === name);
    return sum + (addon?.price ?? 0) * Math.max(0, qty);
  }, 0);
}

/** Product extras like "بسكوت إضافي ×3" use embedded qty × unit 1, or known names */
function calcProductAddonTotal(addonLines: string[]): number {
  return addonLines.reduce((sum, line) => {
    if (isCartCatalogAddon(line)) {
      return sum + calcCatalogAddonTotal([line]);
    }
    // e.g. بسكوت إضافي ×3 at 1₪ each
    const match = line.match(/×(\d+)/);
    if (match) return sum + Number(match[1]);
    return sum;
  }, 0);
}

/** Pre-v3 persisted item shape (still has string-encoded flavors/addons). */
interface LegacyCartItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  size?: string;
  type?: string;
  flavors?: string[];
  addons?: string[];
  addonTotal?: number;
  unitPrice: number;
  quantity: number;
}

/**
 * Migrate old persisted carts that stamped shared addons onto every item.
 * Moves catalog addons up to cart-level and leaves only product-specific extras on items.
 */
function migrateSharedAddonsFromItems(state: {
  items: LegacyCartItem[];
  cartAddons?: string[];
  cartAddonTotal?: number;
}): { items: LegacyCartItem[]; cartAddons: string[]; cartAddonTotal: number } {
  const existingCartAddons = state.cartAddons ?? [];
  if (existingCartAddons.length > 0) {
    return {
      items: state.items,
      cartAddons: existingCartAddons,
      cartAddonTotal:
        state.cartAddonTotal ?? calcCatalogAddonTotal(existingCartAddons),
    };
  }

  const first = state.items[0];
  if (!first?.addons?.length) {
    return {
      items: state.items,
      cartAddons: [],
      cartAddonTotal: 0,
    };
  }

  const catalogFromFirst = first.addons.filter(isCartCatalogAddon);
  const allShareSameCatalog =
    catalogFromFirst.length > 0 &&
    state.items.every((item) => {
      const catalog = (item.addons ?? []).filter(isCartCatalogAddon);
      return (
        catalog.length === catalogFromFirst.length &&
        catalog.every((line, i) => line === catalogFromFirst[i])
      );
    });

  if (!allShareSameCatalog) {
    return {
      items: state.items,
      cartAddons: [],
      cartAddonTotal: 0,
    };
  }

  return {
    items: state.items.map((item) => {
      const productAddons = (item.addons ?? []).filter(
        (line) => !isCartCatalogAddon(line),
      );
      return {
        ...item,
        addons: productAddons,
        addonTotal: calcProductAddonTotal(productAddons),
      };
    }),
    cartAddons: catalogFromFirst,
    cartAddonTotal: calcCatalogAddonTotal(catalogFromFirst),
  };
}

/** Collapse a raw, possibly-repeated array of labels into {label, qty} pairs. */
function countOccurrences(labels: string[]): Array<{ label: string; qty: number }> {
  const counts = new Map<string, number>();
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);
  return Array.from(counts.entries()).map(([label, qty]) => ({ label, qty }));
}

/**
 * v2 -> v3: convert each item's legacy `flavors`/`addons` string arrays into
 * structured `selections`. Historical `unitPrice`/`addonTotal` are left
 * untouched as the source of truth for totals — `selections` is
 * structural/display only, so no historical total is at risk even where a
 * per-flavor unit price can't be reconstructed.
 */
function migrateToStructuredSelections(items: LegacyCartItem[]): CartItem[] {
  return items.map((item) => {
    const selections: CartSelection[] = [];

    for (const { label, qty } of countOccurrences(item.flavors ?? [])) {
      selections.push({ kind: "flavor", id: label, label, qty, unitPrice: 0 });
    }

    for (const line of item.addons ?? []) {
      const { name, qty } = parseAddonLine(line);
      const catalogAddon = ADDONS.find((a) => a.name === name);
      selections.push({
        kind: "addon",
        id: name,
        label: name,
        qty,
        unitPrice: catalogAddon?.price ?? 1,
      });
    }

    return {
      id: item.id,
      productId: item.productId,
      name: item.name,
      image: item.image,
      size: item.size,
      type: item.type,
      selections,
      addonTotal: item.addonTotal ?? 0,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    };
  });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartAddons: [],
      cartAddonTotal: 0,
      orderNote: "",
      coupon: "",
      discount: 0,

      addItem: (item) =>
        set((state) => {
          const existing = findMatchingItem(state.items, item);
          if (existing) {
            // Increment quantity, and sum flat addons (each add's own flat
            // picks stack — e.g. 4 + 4 بسكوت = 8) rather than per-unit addons,
            // which already scale with quantity and stay untouched here.
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                      flatSelections: mergeFlatSelections(
                        i.flatSelections ?? [],
                        item.flatSelections ?? [],
                      ),
                      flatAddonTotal:
                        (i.flatAddonTotal ?? 0) + (item.flatAddonTotal ?? 0),
                    }
                  : i,
              ),
            };
          }
          // Add as new item if no match
          return {
            items: [
              ...state.items,
              {
                ...item,
                selections: item.selections ? [...item.selections] : [],
                addonTotal: item.addonTotal ?? 0,
                flatSelections: item.flatSelections
                  ? [...item.flatSelections]
                  : [],
                flatAddonTotal: item.flatAddonTotal ?? 0,
                id: genId(),
              },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((i) => i.id !== id);
          if (items.length === 0) {
            return {
              items,
              cartAddons: [],
              cartAddonTotal: 0,
              orderNote: "",
            };
          }
          return { items };
        }),

      updateQuantity: (id, qty) =>
        set((state) => {
          const items =
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => {
                  if (i.id !== id) return i;
                  if (!i.units) return { ...i, quantity: qty };
                  // Keep per-unit records in sync: pad new units with no
                  // additions, truncate when shrinking.
                  const units = Array.from(
                    { length: qty },
                    (_, idx) => i.units?.[idx] ?? { selections: [] },
                  );
                  return { ...i, quantity: qty, units };
                });
          if (items.length === 0) {
            return {
              items,
              cartAddons: [],
              cartAddonTotal: 0,
              orderNote: "",
            };
          }
          return { items };
        }),

      setItemSharedAddons: (id, selections, addonTotal) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  selections: [...selections],
                  addonTotal: Math.max(0, addonTotal),
                  units: undefined,
                }
              : i,
          ),
        })),

      setItemUnits: (id, units) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  units: units.map((u) => ({ selections: [...u.selections] })),
                  quantity: units.length,
                  // Per-unit additions supersede the line-level shared ones.
                  selections: [],
                  addonTotal: 0,
                }
              : i,
          ),
        })),

      setItemFlatAddons: (id, selections, addonTotal) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  flatSelections: [...selections],
                  flatAddonTotal: Math.max(0, addonTotal),
                }
              : i,
          ),
        })),

      setOrderNote: (note) => set({ orderNote: note }),

      setCartAddons: (addons, addonTotal) =>
        set({
          cartAddons: [...addons],
          cartAddonTotal: Math.max(0, addonTotal),
        }),

      setCoupon: (code, discount) => set({ coupon: code, discount }),

      clearCart: () =>
        set({
          items: [],
          cartAddons: [],
          cartAddonTotal: 0,
          orderNote: "",
          coupon: "",
          discount: 0,
        }),

      itemsSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, i) => sum + getLineItemTotal(i), 0);
      },

      subtotal: () => {
        const { cartAddonTotal } = get();
        return get().itemsSubtotal() + (cartAddonTotal ?? 0);
      },

      total: () => {
        const { discount } = get();
        return Math.max(0, get().subtotal() - discount);
      },
    }),
    {
      name: "glace-cart",
      // v4 adds optional per-unit `units` on items — additive, existing items
      // simply have no `units` and keep rendering as uniform lines.
      version: 4,
      migrate: (persisted, fromVersion) => {
        const raw = (persisted ?? {}) as {
          items?: LegacyCartItem[];
          cartAddons?: string[];
          cartAddonTotal?: number;
          orderNote?: string;
          coupon?: string;
          discount?: number;
        };

        let items = raw.items ?? [];
        let cartAddons = raw.cartAddons ?? [];
        let cartAddonTotal = raw.cartAddonTotal;

        if (fromVersion < 2) {
          const migrated = migrateSharedAddonsFromItems({
            items,
            cartAddons,
            cartAddonTotal,
          });
          items = migrated.items;
          cartAddons = migrated.cartAddons;
          cartAddonTotal = migrated.cartAddonTotal;
        }

        const finalItems: CartItem[] =
          fromVersion < 3 ? migrateToStructuredSelections(items) : (items as CartItem[]);

        return {
          items: finalItems,
          cartAddons,
          cartAddonTotal: cartAddonTotal ?? calcCatalogAddonTotal(cartAddons),
          orderNote: raw.orderNote ?? "",
          coupon: raw.coupon ?? "",
          discount: raw.discount ?? 0,
        };
      },
    },
  ),
);

export { parseAddonLine, calcCatalogAddonTotal, isCartCatalogAddon };
