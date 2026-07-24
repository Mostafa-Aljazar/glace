<p align="center">
  <table>
    <tr>
      <td align="center" bgcolor="#1e6a7f">
        <img src="./public/images/logo.svg" alt="جلاسيه الأمير — Glace El Ameer" width="240" />
      </td>
    </tr>
  </table>
</p>

<br />

<h1 align="center">Glace Next (<code>glace-next</code>)</h1>

<p align="center">
  Next.js storefront for <strong>جلاسيه الأمير</strong> (Glace El Ameer) — ice cream, برادات, drinks, desserts, cart, checkout, accounts, and events.<br />
  Arabic-first · RTL · mobile-first (bottom nav + floating actions)
</p>

This README is the project map: app shell, menu/ordering, **per-unit cart additions**, checkout/payment, account/wallet/favorites, the Axios + React Query API layer, and the OpenAPI docs your backend team should follow.

---

## Stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js **16** (App Router) — **read `AGENTS.md` / `node_modules/next/dist/docs/` before changing framework APIs**, this version has breaking changes vs. training data |
| UI | React 19, Tailwind 4, shadcn/Radix (`radix-ui`, `@base-ui/react`), Lucide icons, Swiper, Framer Motion |
| State | Zustand (`cart`, `order`, `favorites`, `auth`, `wallet` stores, each persisted to localStorage) |
| Data fetching | TanStack React Query + Axios (`guestApi` / `userApi` in `src/lib/axios.ts`) |
| Forms | react-hook-form + zod |
| API docs | OpenAPI 3 → `docs/swagger.yaml` + Swagger UI at `/swagger` |

```bash
npm install
npm run dev
# http://localhost:3000
# http://localhost:3000/swagger (OpenAPI 3 interactive docs with Glace branding)
```

**Environment Setup:**

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Update this when your Laravel backend is ready. All frontend API calls automatically use this URL.

| Environment | Backend URL |
|---|---|
| **Local Development** | `http://localhost:8000/api` |
| **Staging** | `https://staging-api.glace.com/api` |
| **Production** | `https://api.glace.com/api` |

---

## App shell

- `src/app/layout.tsx` — root HTML shell, `lang="ar" dir="rtl"`, global `QueryProvider`, a global `LoadingPage` splash screen gated by a `sessionStorage` flag (`glace-splash-seen`) so it only shows once per session.
- `src/app/(main)/layout.tsx` — the shell for all storefront routes: `LogoNav` (top nav) + page content + `BottomNav` (mobile tab bar) + `FloatingFavoritesButton` (hidden on `/menu/order/*` so it does not collide with the add-to-cart bar).

---

## Architecture conventions (for any new domain)

When wiring a new domain (menu, checkout, etc.) to a real API, follow this pattern:

1. **Types** — `src/types/<domain>.types.ts`, interfaces prefixed with **`I`** (`IHomePageData`, `IEvent`, `IAddonOption`, …)
2. **Fake data** — `src/data/fake-data/*`, used as fallback whenever the backend fails or returns invalid data — **never leave a page blank**
3. **Fetch function** — `src/hooks/<domain>/fetch*.ts` via `guestApi` / `userApi`
4. **React Query hook** — `useQuery` / `useMutation` with a catch → fake-data fallback (prefer **no** `initialData` when you want a real loading state, e.g. `useMenuAddons`)
5. **Swagger** — paths + schemas + examples in `docs/swagger.yaml`
6. **UI** — consume the hook; don't hardcode section content once an API exists for it

Images from a real API are URL strings; fake data may use Next `StaticImageData`. Helpers like `resolveHomeImageSrc` / `resolveEventImageSrc` normalize both.

**API Configuration:**

All frontend API calls use **Axios** instances configured via `NEXT_PUBLIC_API_URL` in `.env.local`:

```ts
// src/lib/axios.ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const guestApi = axios.create({ baseURL: BASE });  // public endpoints
const userApi = axios.create({ baseURL: BASE });   // auto-injects auth token from localStorage
```

**Local routes** (only needed for Swagger UI):

| Route | Purpose |
|--------|---------|
| `GET /api/openapi` | Serves `docs/swagger.yaml` for Swagger UI at `/swagger` |

All other endpoints (home, events, menu, contact, auth, etc.) call the backend API at `NEXT_PUBLIC_API_URL`.

**Fallback strategy:** Fetch functions catch errors and return fake data so pages never render blank. List endpoints drop malformed rows individually.

---

## API surface (all documented in Swagger)

### Public Endpoints

| Method | Path | Types | Hooks / functions |
|--------|------|--------|-------------------|
| `GET` | `/home` | `IHomePageData` | `fetchHomePage`, `useHomePage` |
| `GET` | `/events?page&perPage` | `IEventsListResponse` | `fetchEvents`, `useEvents` |
| `GET` | `/events/{id}` | `IEvent` | `fetchEventById`, `useEvent` |
| `POST` | `/contact` | `IContactRequest` → `IContactResponse` | `sendContactMessage`, `useSendContactMessage` |
| `GET` | `/menu/categories` | `IMenuCategory[]` | `fetchMenuCategories`, `useMenuCategories` |
| `GET` | `/menu/products?category={id}` | `IProduct[]` | `fetchMenuProducts`, `useMenuProducts` |
| `GET` | `/menu/products/{slug}` | `IProduct \| null` | `fetchMenuProductById`, `useMenuProduct` (lookup by **slug**, not PK) |
| `GET` | `/menu/addons` | `IAddonOption[]` | `fetchMenuAddons`, `useMenuAddons` |

### Protected Endpoints (require auth token)

- `POST /auth/login` (`LoginRequest` → `LoginResponse`)
- `POST /auth/register` (`RegisterRequest` → user + token)
- `POST /auth/logout`
- `GET /auth/me` (current user)
- `PUT /auth/profile` (update profile)
- `POST /auth/password` (change password)

See `src/hooks/auth/` for implementations.

---

## What was built

### 1. Home page ↔ `GET /home`

- Aggregate payload: `hero`, `about`, `whyGlace`, `branches`, `events` (no opinions section)
- Types: `src/types/home.types.ts`
- Fake: `src/data/fake-data/homePage.ts` (`FAKE_HOME_PAGE`), hero slides in `src/data/fake-data/heroSlides.ts`
- Hooks: `src/hooks/home/` — `useHomePage`, plus `useHeroSlides` (shares the `useHomePage` cache instead of refetching)
- UI: `HomeClientPage` loads once and passes data into `HeroSection` / `AboutSection` / `WhyGlaceSection` / `TimesWorkSection` / `EventsSection`

### 2. Events ↔ `GET /events`, `GET /events/{id}`

- Types: `src/types/events.types.ts` (`IEvent`, `IEventsListResponse`)
- Fake: `src/data/fake-data/events.ts` (+ legacy re-export `src/data/Events.ts`)
- Hooks: `src/hooks/events/`
- UI: `/events` list with pagination (`EventsClientPage`, `EventsGrid`, `EventsPagination`) and `/events/[id]` detail + related events (`EventDetailClientPage`)
- Swagger schemas + examples

### 3. Contact ↔ `POST /contact` only

- Types: `IContactRequest`, `IContactResponse` only (no page-content GET — form labels stay hardcoded in the UI)
- `sendContactMessage` + `useSendContactMessage`, with a fake-success fallback when the backend is down
- Swagger: **POST** only, under the Contact tag

### 4. Menu API & Ordering System

**Complete API contract:** [`docs/MENU_CATALOG.md`](docs/MENU_CATALOG.md) — share this with the Laravel team.

| Concern | Detail |
|--------|--------|
| Endpoints | `GET /menu/categories`, `GET /menu/products?category=`, `GET /menu/products/{slug}`, `GET /menu/addons` |
| Identity | Opaque product **`id`** (PK for cart/orders/favorites) vs URL-safe **`slug`** (order routes + product detail) |
| Catalog size | ~16 categories, ~23 flavors, ~19 products (builder + flat-list) |
| Addons | Shared `IAddonOption[]` from `/menu/addons`; optional per-product `addons` override |
| Addon UI types | `type: "toggle"` (checkbox) or `"counter"` (+/− qty, e.g. biscuit) + optional `maxQty` — set per addon in the dashboard |
| Order templates | Builder (wizard: size → flavor → quantity) and flat-list (items + optional mixes) |
| Mixes | Pick-2 / pick-3 with per-flavor pricing |
| Dashboard | Availability at product, item, flavor, size, container, mix, and addon levels |

**Frontend:**

- `MenuClientPage`: sticky, **auto-scrolling category selector** — the active category chip tracks scroll position and auto-scrolls into view; extra bottom padding clears the mobile `BottomNav`
- **Types:** `src/types/menu.types.ts` — `IMenuCategory`, `IFlavorOption`, `IProduct` (discriminated union on `kind`), `IBuilderProduct`, `IFlatListProduct`, `ISizeOption`, `IMixRule`, `IProductVariant`, `IAddonOption`
- **Fake data:** `src/data/fake-data/menu.ts` — `FAKE_MENU_CATEGORIES`, `FAKE_FLAVORS`, `FAKE_PRODUCTS`, `FAKE_ADDONS`
- **Hooks:** `useMenuCategories()`, `useMenuProducts(categoryId)`, `useMenuProduct(slug)`, `useMenuAddons()` + matching fetch functions
- **Order templates:** `OrderBuilderTemplate` and `OrderFlatListTemplate` under `src/components/Order/`
- **Cart consolidation:** identical items with the same selections merge quantity instead of duplicating lines

### 5. Ordering flow (`/menu/order/*`)

- **Unified dynamic route** — `src/app/(main)/menu/order/[type]/page.tsx` → `OrderTypeClientPage` loads the product by **slug** via `useMenuProduct` and picks builder vs flat-list from `kind`
- **Legacy / sibling routes** — older dedicated order pages and category-specific routes may still exist alongside the dynamic `[type]` pattern; prefer extending `[type]` for new simple categories
- **Shared order UX** — `AddToCartButton`, `FlavorBall`, `ColorSwatchPicker`, `ImageZoomDialog`, `BackButton`, `BiscuitAddons`, mix modal (`MixOrderSection` + `MixFlavorModal`)
- **Bottom chrome** — a single frosted **أضف للسلة** action bar (raised above `BottomNav` on mobile). The old stacked `CartBar` (“عرض السلة”) is **not** mounted on order templates anymore (file kept; still used on favorites). Decorative corner ice images were removed from `CartBar`. Content + loading skeletons use extra `pb-*` so the last cards clear the nav
- **Leave-page guard** (`useLeavePageGuard` in `src/hooks/order/`): blocks unload / back / internal links / menu open while unsaved picks exist, via `OrderLeaveConfirmationDialog` and custom DOM events coordinated with `LogoNav`

### 6. Cart (`/cart`) — per-unit additions

Additions are **per cart line / per unit**, not a cart-wide accordion.

**Store** (`src/store/cartStore.ts`, persist key `glace-cart`, **version 4**):

- Line items use structured `selections: CartSelection[]` (`kind`: flavor | mix | addon) with `qty` and `unitPrice`
- Optional `units?: CartUnit[]` — when present, each physical unit has its own addon selections; invariant `units.length === quantity`
- `setItemSharedAddons` / `setItemUnits` apply one set to all units or distinct sets per unit
- Shared `orderNote`, coupon / discount, `clearCart()`
- Pricing: `getLineItemTotal` / `itemsSubtotal` / `subtotal` / `total` (legacy `cartAddons` fields may still exist for migration; the cart UI no longer drives a cart-wide addon accordion)
- Migrations: v2 hoist shared catalog addons; v3 string flavors/addons → structured selections; v4 additive `units`

**UI** (`CartClientPage` + `CustomizeAdditionsDialog`):

- Hydration skeleton until Zustand persist finishes (no empty-cart flash; `persist` is only read in a client `useEffect` for SSR-safe builds)
- Per-item **تخصيص الإضافات** when a catalog resolves (product override → else `useMenuAddons()` shared list)
- Dialog modes: same additions for all units, or different additions per unit; toggle vs counter rows from addon `type`
- Per-unit breakdown: units with additions first; units without collapsed as **بدون إضافات ×N** (yellow accents for key labels)
- Responsive cards: full-width body on mobile; indented under the image on `md+`
- Clear-all, qty steppers, delete, shared order note, coupon, order summary

### 7. Checkout & Payment (`/checkout`, `/payment`)

- `CheckoutClientPage` — delivery vs. pickup, address form, order summary
- `PaymentClientPage` — payment method selection (`jawwal`/`paypal`/`cash`/`visa`/`wallet`, per `PaymentMethod` in `orderStore.ts`)
- `orderStore.ts` (`useOrderStore`) — `placeOrder()` snapshots the cart into an `Order` (id `ORD-<timestamp>`, status starts at `قيد المراجعة`), `updateStatus()`, `getOrder()` — all persisted, no backend yet
- **Backend note:** when checkout is API-backed, each ordered unit must carry selected addon ids + the product **PK** (`id`), so quantity N can have up to N distinct addition sets

### 8. Favorites (`/favorites`)

- `favoritesStore.ts` (`useFavoritesStore`) — simple persisted id-set with `toggle()`/`isFavorite()`
- `FloatingFavoritesButton` (global; skipped on order routes) + `FavoritesClientPage` (still mounts `CartBar`)

### 9. Account, Wallet, Orders

- `/my-account` → `MyAccountClientPage` + `AccountSidebar`/`AccountHeroStrip` shell with dashboard panels: `OverviewPanel`, `OrdersPanel`, `WalletPanel`, `SecurityPanel`, `ProfilePanel` (`src/components/Account/dashboard/`), backed by shared `DashboardCard`/`StatCard`/`EmptyState`
- `/my-wallet` → `MyWalletClientPage`, backed by `walletStore.ts` (`useWalletStore`) — persisted `balance` + `transactions` ledger, `topUp()`/`deduct()`
- `/my-orders` → `MyOrderClientPage`, `/order-status/[id]` → `OrderStatusClientPage`, both reading from `orderStore.ts`
- Auth: `/auth/login`, `/auth/register`, `/auth/restore-password`, `/auth/new-password` → forms inside `AuthLayout`, backed by `authStore.ts` and `useLogin`/`useRegister`/`useMe`/… hooks

### 10. Offers, coming-soon, error/loading polish

- `/offers` → `OffersClientPage` with a polished empty state ("لا توجد عروض متاحة حالياً")
- `(standalone)/coming-soon` → `ComingSoonClientPage`, outside the main nav shell
- `src/app/(main)/error.tsx` restyled to match the glass-card empty-state look
- `LoadingPage` (global splash) and various loading/checkout/payment touch-ups

### 11. Swagger app

- Spec: `docs/swagger.yaml`
- UI: `src/app/swagger/` (`SwaggerUIClient.tsx` + `swagger.css`) → `/swagger`
- Dependency: `swagger-ui-react` (+ `@types/swagger-ui-react`)
- Models expanded with examples; "Try it out" enabled against a real backend (or fake fallbacks in the app)

---

## Documentation

### Swagger / OpenAPI

**URL:** http://localhost:3000/swagger

**Files:**
- `docs/swagger.yaml` — OpenAPI 3 spec (home, events, contact, menu categories/products/**slug**/addons, schemas + examples)
- `src/app/swagger/SwaggerUIClient.tsx` — interactive UI (Try it out enabled)
- `src/app/api/openapi/route.ts` — serves the YAML file

**Highlights for backend:**
- Product detail is **`GET /menu/products/{slug}`** (route-model-bind on `slug`; response `id` remains the PK)
- **`GET /menu/addons`** returns `IAddonOption[]` (`type`: `toggle` | `counter`, optional `maxQty`)
- Products may include optional `description` and `addons[]` overrides

### Menu Catalog (Backend Contract)

**File:** [`docs/MENU_CATALOG.md`](docs/MENU_CATALOG.md)

**For your Laravel backend developer** — full specification of:
- Categories, flavors, products (builder + flat-list), mixes, pricing
- **`id` vs `slug`**, product `description`, shared vs per-product **addons**
- Dashboard availability / CRUD expectations
- Error handling and an implementation checklist

**Share this file with your backend team.** It is the contract the frontend expects.

---

## State stores at a glance

| Store | File | Persisted key | Holds |
|-------|------|----------------|-------|
| Cart | `src/store/cartStore.ts` | `glace-cart` (v4, migrates older shapes) | items (+ optional per-unit `units`), selections, order note, coupon |
| Order | `src/store/orderStore.ts` | `glace-orders` | placed orders + status history |
| Favorites | `src/store/favoritesStore.ts` | `glace-favorites` | favorited product ids |
| Auth | `src/store/authStore.ts` | `glace-auth` | token + user |
| Wallet | `src/store/walletStore.ts` | `glace-wallet` | balance + transactions |

All are local-only today (no backend sync) — treat them as the shape a future API integration should match.

---

## Important paths

```
docs/swagger.yaml                          # OpenAPI 3 (menu includes {slug} + /menu/addons)
docs/MENU_CATALOG.md                       # Backend contract for menu + addons
src/app/swagger/SwaggerUIClient.tsx        # Interactive Swagger UI at /swagger
src/app/api/openapi/                       # Serves swagger.yaml (Swagger UI only)
src/types/menu.types.ts                    # IMenuCategory, IProduct, IAddonOption, …
src/types/home|events|contact.types.ts     # Per-domain API types (I-prefixed)
src/data/fake-data/menu.ts                 # FAKE_MENU_CATEGORIES, FAKE_FLAVORS, FAKE_PRODUCTS, FAKE_ADDONS
src/data/fake-data/                        # Fake API payloads per domain
src/hooks/menu/fetchMenuCategories.ts
src/hooks/menu/fetchMenuProducts.ts
src/hooks/menu/fetchMenuProductById.ts     # GET /menu/products/{slug}
src/hooks/menu/fetchMenuAddons.ts          # GET /menu/addons
src/hooks/menu/useMenuAddons.ts
src/hooks/home|events|contact|auth/        # Other domain hooks
src/store/cartStore.ts                     # Cart + per-unit units + consolidation
src/components/Cart/CartClientPage.tsx
src/components/Cart/CustomizeAdditionsDialog.tsx
src/components/Order/OrderBuilderTemplate.tsx
src/components/Order/OrderFlatListTemplate.tsx
src/components/Order/OrderTypeClientPage.tsx
src/components/Order/shared/               # StepCard, Pill, QuantityStepper, …
src/lib/axios.ts                           # guestApi / userApi (NEXT_PUBLIC_API_URL)
src/components/Cart|Menu|Checkout|Payment|Favorites|Account|Wallet|Auth|Offers/
```

---

## Mental models

**Home:** one `GET /home` → paint all sections.
**Events:** list + detail endpoints → React Query.
**Contact:** only send message (`POST`), no content GET.
**Menu:** browse categories → product by **slug** → order page (builder or flat-list) → add to cart.
**Order pages:** pick size/flavors/mixes → add to cart; one action bar + BottomNav (no stacked CartBar); leave with unsaved picks always confirms first.
**Cart:** hydrate store → products → **تخصيص الإضافات** (shared catalog or product override; toggle/counter; optional per-unit sets) → shared note → coupon → summary.
**Checkout → Payment → Order:** cart snapshot becomes an `Order` in `orderStore`, trackable at `/order-status/[id]` or `/my-orders`.
**Account:** one dashboard shell, swappable panels (overview/orders/wallet/security/profile).

---

## Next steps: Backend Integration

When your Laravel backend is ready:

1. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.com/api
   ```
   All frontend API calls automatically switch to the backend.

2. **Implement endpoints** from `docs/MENU_CATALOG.md` and `docs/swagger.yaml`:
   - Menu: categories, products, **products/{slug}**, **addons**
   - Auth: login, register, logout, me, profile, password
   - Others: home, events, contact, then cart/checkout/orders/wallet/favorites as you go live

3. **Use the fake data as fallback** — the frontend already handles backend failures gracefully (logs error, returns fake data).

4. **Keep Swagger in sync** as you add checkout/order payloads that include **per-unit addon ids** + product PKs.

**Note:** Remove obsolete `src/app/api/*` mock routes once the backend is live (keep only `/api/openapi` for Swagger UI if desired).

---

## For developers & agents

- **Next.js 16** with breaking changes vs. training data — read `AGENTS.md` and `node_modules/next/dist/docs/` before touching framework APIs (routing, params/searchParams as promises, etc.).
- **API pattern:** types → fake data → fetch function → React Query hook → Swagger → UI. Fake data is the fallback when the backend fails.
- **Interface naming:** All API types use the **`I`** prefix (`IMenuCategory`, `IProduct`, `IAddonOption`, …).
- **Menu contract:** [`docs/MENU_CATALOG.md`](docs/MENU_CATALOG.md) + [`docs/swagger.yaml`](docs/swagger.yaml) — send both to the backend developer.
- **Slug vs id:** URLs and `useMenuProduct` use **slug**; cart/favorites/orders store the opaque **id**.
- **Addons:** shared `GET /menu/addons`; product `addons` overrides; `type`/`maxQty` drive toggle vs counter UI.
- **Cart persist:** never call `useCartStore.persist.*` during SSR/prerender — only inside client effects.
- **Axios config:** `src/lib/axios.ts` + `NEXT_PUBLIC_API_URL` switches local/staging/production.
- Don't commit secrets; don't invent commits unless asked.

---

## Team

جلاسيه الأمير (Glace El Ameer) — Next.js storefront

- **Mostafa Aljazar — Frontend Developer** · [@Mostafa-Aljazar](https://github.com/Mostafa-Aljazar) · [LinkedIn](https://www.linkedin.com/in/mostafa-aljazar/) · [WhatsApp](https://wa.me/972595796456)

---

<p align="center">Made with ❤️ by Mostafa Aljazar · Glace El Ameer · 2026</p>
