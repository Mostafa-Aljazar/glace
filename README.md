# Glace Next (`glace-next`)

Next.js storefront for **جلاسيه الأمير** (Glace El Ameer) — ice cream, برادات, drinks, desserts, cart, checkout, accounts, and events. Arabic-first, RTL, mobile-first (bottom nav + floating actions).

This README documents everything built across **Cursor** sessions: the app shell, the ordering system, cart/checkout/payment, account/wallet/favorites, the API layer, and Swagger docs — plus the conventions to keep following.

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
- `src/app/(main)/layout.tsx` — the shell for all storefront routes: `LogoNav` (top nav) + page content + `BottomNav` (mobile tab bar) + `FloatingFavoritesButton`.

---

## Architecture conventions (for any new domain)

When wiring a new domain (menu, checkout, etc.) to a real API, follow this pattern:

1. **Types** — `src/types/<domain>.types.ts`, interfaces prefixed with **`I`** (`IHomePageData`, `IEvent`, …)
2. **Fake data** — `src/data/fake-data/*`, used as fallback whenever the backend fails or returns invalid data — **never leave a page blank**
3. **Fetch function** — `src/hooks/<domain>/fetch*.ts` via `guestApi` / `userApi`
4. **React Query hook** — `useQuery` / `useMutation` with `initialData` or a catch → fake-data fallback
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

All other endpoints (home, events, menu, contact, auth, cart, etc.) call the backend API at `NEXT_PUBLIC_API_URL`.

**Fallback strategy:** All fetch functions catch errors and return fake data, so pages never render blank.

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
| `GET` | `/menu/products/{id}` | `IProduct \| null` | `fetchMenuProductById`, `useMenuProduct` |

### Protected Endpoints (require auth token)

- `POST /auth/login` (`LoginRequest` → `LoginResponse`)
- `POST /auth/register` (`RegisterRequest` → user + token)
- `POST /auth/logout`
- `GET /auth/me` (current user)
- `PUT /auth/profile` (update profile)
- `POST /auth/password` (change password)

See `src/hooks/auth/` for implementations.

---

## What was built with Cursor

### 1. Home page ↔ `GET /home`

- Aggregate payload: `hero`, `about`, `whyGlace`, `branches`, `events`, `opinions`
- Types: `src/types/home.types.ts`
- Fake: `src/data/fake-data/homePage.ts` (`FAKE_HOME_PAGE`), hero slides in `src/data/fake-data/heroSlides.ts`
- Hooks: `src/hooks/home/` — `useHomePage`, plus `useHeroSlides` (shares the `useHomePage` cache instead of refetching)
- UI: `HomeClientPage` loads once and passes data into `HeroSection` / `AboutSection` / `WhyGlaceSection` / `TimesWorkSection` / `EventsSection` / `OpinionsSection` — hardcoded section content was removed from those components in favor of the fetched payload

### 2. Events ↔ `GET /events`, `GET /events/{id}`

- Types: `src/types/events.types.ts` (`IEvent`, `IEventsListResponse`)
- Fake: `src/data/fake-data/events.ts` (+ legacy re-export `src/data/Events.ts`)
- Hooks: `src/hooks/events/`
- UI: `/events` list with pagination (`EventsClientPage`, `EventsGrid`, `EventsPagination`) and `/events/[id]` detail + related events (`EventDetailClientPage`)
- Swagger schemas + examples; local mocks under `src/app/api/events/`

### 3. Contact ↔ `POST /contact` only

- Types: `IContactRequest`, `IContactResponse` only (no page-content GET — form labels stay hardcoded in the UI)
- `sendContactMessage` + `useSendContactMessage`, with a fake-success fallback when the backend is down
- Swagger: **POST** only, under the Contact tag

### 4. Menu API & Ordering System

**Complete API contract** is in [`docs/MENU_CATALOG.md`](docs/MENU_CATALOG.md) — a professional backend specification for your Laravel developer:
- **3 endpoints:** `GET /menu/categories`, `GET /menu/products?category=`, `GET /menu/products/{id}`
- **19 products** across 16 categories (ice-cream, bread, drinks, desserts, etc.)
- **23 global flavors** with availability control + premium pricing
- **Two order templates:** builder (wizard: size → flavor → quantity) and flat-list (pick items + optional mixes)
- **Mix system:** pick-2/pick-3 flavor combinations with per-flavor pricing
- **Dashboard features:** control availability at product, item, flavor, size, container, and mix levels

**Frontend:**

- `MenuClientPage`: sticky, **auto-scrolling category selector** — the active category chip tracks scroll position and auto-scrolls into view
- **Types:** `src/types/menu.types.ts` — `IMenuCategory`, `IFlavorOption`, `IProduct` (discriminated union on `kind`), `IBuilderProduct`, `IFlatListProduct`, `ISizeOption`, `IMixRule`, `IProductVariant`
- **Fake data:** `src/data/fake-data/menu.ts` (16 categories, 23 flavors, 19 products)
- **Hooks:** `useMenuCategories()`, `useMenuProducts(categoryId)`, `useMenuProduct(productId)` + fetch functions
- **Order templates:** `OrderBuilderTemplate` (wizard flow) and `OrderFlatListTemplate` (flat items + mixes)
- **Cart consolidation:** identical items with same selections automatically increment quantity instead of creating duplicates

### 5. Ordering flow (`/menu/order/*`)

Two generations of order pages exist side by side:

- **Legacy per-category pages** — `src/app/(main)/menu/order-*/page.tsx` → dedicated client components (`CupOrderClientPage`, `FamilyOrderClientPage`, `BradOrderClientPage`, `MilkshakeOrderClientPage`, `DrinksOrderClientPage`, `KunafahOrderClientPage`, `OtherDessertsOrderClientPage`, `SubscriptionsOrderClientPage`, `LuqaimatOrderClientPage`)
- **Unified dynamic route** — `src/app/(main)/menu/order/[type]/page.tsx` renders `DessertsOrderClientPage` for any id in `DESSERT_CATEGORIES_V2` (`pancake`, `waffle`, `crepe`, `pizza`, `molten`, `cold-drinks`, `juices`); `generateStaticParams`/`generateMetadata` come from the same config. `src/app/(main)/menu/order/loqaimat/page.tsx` is a sibling static route for `LoqaimatOrderClientPage`. This is the pattern to extend for any *new* simple category instead of adding another `order-*` folder.
- **Order domain data** — `src/data/OrderData.ts`: flavors (`CLASSIC_FLAVORS`/`SPECIAL_FLAVORS`, each with an `available` flag for out-of-stock states), size/type pricing (`ICE_PRICES`, `SIZE_MAX_BALLS`), the shared addon catalog (`ADDONS`, `EMPTY_CONE_ADDON`, `MULTI_CHOICE_ADDONS`, capped at `MAX_MULTI_ADDONS`), and `DESSERT_CATEGORIES_V2` (per-category items + optional `mixes`)
- **Mix flavor system** (`MixOrderSection` + `MixFlavorModal`): a dessert category can define `MixConfig`s (e.g. "مكس" pick-2, "سوبر مكس" pick-3) with **per-flavor pricing** — pistachio flavors price differently from the rest (`getMixFlavorPrice`/`getMixSelectionPrice`/`isPistachioFlavor`). The modal enforces the pick count and a max-repeat-per-flavor rule, then adds a priced mix selection with a note of which flavors (and how many of each) were chosen
- **Shared order UX**: `AddToCartButton`, `CartBar` (sticky add-to-cart bar), `FlavorBall`, `ColorSwatchPicker`, `ImageZoomDialog`, `BackButton`, `BiscuitAddons`
- **Leave-page guard** (`useLeavePageGuard` in `src/hooks/order/`): while an order page has pending/unsaved selections it (a) blocks `beforeunload`, (b) intercepts browser back (`popstate`) and re-pushes history until confirmed, (c) intercepts clicks on internal `<a>` links and visually disables them (`opacity-50`, `aria-disabled`), (d) intercepts the menu-button open request, all funneled through `OrderLeaveConfirmationDialog`. Custom DOM events (`ORDER_MENU_OPEN_REQUEST`, `ORDER_OPEN_MENU`, `ORDER_PROTECTED_LINK_CLICK`, `ORDER_BEFORE_BACK_REQUEST`) let `LogoNav`/other chrome cooperate with whatever order page is active.

### 6. Cart (`/cart`)

**Store** (`src/store/cartStore.ts`):

- Shared cart-level addons: `cartAddons`, `cartAddonTotal`, `setCartAddons` — charged once for the whole order, picked from the `ADDONS` catalog
- Shared `orderNote` for the whole cart (per-item notes were removed)
- Item `addons` now hold only **product-specific** extras (e.g. extra biscuit), not catalog addons
- Versioned persistence (`version: 2`) with a `migrate()` that detects old carts which stamped the same catalog addons onto every line item and hoists them up to `cartAddons` once
- `clearCart()`, and clear subtotal math: `itemsSubtotal()` (items + their own addons) → `subtotal()` (+ cart-level addons) → `total()` (− coupon discount)

**UI** (`CartClientPage`):

- **حذف الكل** (clear-all) button, per-item delete control
- **One shared addons accordion** under the product list (not per item, not a modal) sourced from `OrderData`'s catalog, capped at 4 multi-select addons
- **One shared order note** field after the addons
- Contrast/yellow styling for line totals

### 7. Checkout & Payment (`/checkout`, `/payment`)

- `CheckoutClientPage` — delivery vs. pickup, address form, order summary
- `PaymentClientPage` — payment method selection (`jawwal`/`paypal`/`cash`/`visa`/`wallet`, per `PaymentMethod` in `orderStore.ts`)
- `orderStore.ts` (`useOrderStore`) — `placeOrder()` snapshots the cart into an `Order` (id `ORD-<timestamp>`, status starts at `قيد المراجعة`), `updateStatus()`, `getOrder()` — all persisted, no backend yet

### 8. Favorites (`/favorites`)

- `favoritesStore.ts` (`useFavoritesStore`) — simple persisted id-set with `toggle()`/`isFavorite()`
- `FloatingFavoritesButton` (global, in the main layout) + `FavoritesClientPage`

### 9. Account, Wallet, Orders

- `/my-account` → `MyAccountClientPage` + `AccountSidebar`/`AccountHeroStrip` shell with dashboard panels: `OverviewPanel`, `OrdersPanel`, `WalletPanel`, `SecurityPanel`, `ProfilePanel` (`src/components/Account/dashboard/`), backed by shared `DashboardCard`/`StatCard`/`EmptyState`
- `/my-wallet` → `MyWalletClientPage`, backed by `walletStore.ts` (`useWalletStore`) — persisted `balance` + `transactions` ledger, `topUp()`/`deduct()`
- `/my-orders` → `MyOrderClientPage`, `/order-status/[id]` → `OrderStatusClientPage`, both reading from `orderStore.ts`
- Auth: `/auth/login`, `/auth/register`, `/auth/restore-password`, `/auth/new-password` → `LoginForm`/`RegisterForm`/`RestorePasswordForm`/`NewPasswordForm` inside `AuthLayout`, backed by `authStore.ts` (`useAuthStore`, persisted token/user) and the `useLogin`/`useRegister`/`useMe`/… hooks (not wired to Swagger yet)

### 10. Offers, coming-soon, error/loading polish

- `/offers` → `OffersClientPage` with a polished empty state ("لا توجد عروض متاحة حالياً") replacing the old listing
- `(standalone)/coming-soon` → `ComingSoonClientPage`, outside the main nav shell
- `src/app/(main)/error.tsx` restyled to match the same glass-card empty-state look
- `LoadingPage` (global splash) and various loading/checkout/payment touch-ups

### 11. Swagger app

- Spec: `docs/swagger.yaml`
- UI: `src/app/swagger/` (`SwaggerUIClient.tsx` + `swagger.css`) → `/swagger`
- Dependency: `swagger-ui-react` (+ `@types/swagger-ui-react`)
- Models expanded with examples; "Try it out" enabled against local mocks or a real backend

---

## Documentation

### Swagger / OpenAPI

**URL:** http://localhost:3000/swagger

**Files:**
- `docs/swagger.yaml` — OpenAPI 3 spec (all endpoints + schemas + examples)
- `src/app/swagger/SwaggerUIClient.tsx` — interactive UI (Try it out enabled)
- `src/app/api/openapi/route.ts` — serves the YAML file

**Features:**
- ✅ Try endpoints directly against your backend
- ✅ Full schema definitions with examples
- ✅ Arabic-first, Glace-branded styling
- ✅ Supports GET, POST, PUT, PATCH, DELETE

### Menu Catalog (Backend Contract)

**File:** [`docs/MENU_CATALOG.md`](docs/MENU_CATALOG.md)

**For:** Your Laravel backend developer — complete specification of:
- 16 categories with metadata (icons, colors, sort order)
- 23 flavors with availability control + premium pricing
- 19 products (builder templates + flat-list templates)
- Dashboard features required (availability toggles, CRUD)
- Error handling expectations
- Implementation checklist

**Share this file with your backend team.** It's the contract your frontend expects.

---

## State stores at a glance

| Store | File | Persisted key | Holds |
|-------|------|----------------|-------|
| Cart | `src/store/cartStore.ts` | `glace-cart` (v2, migrates old shape) | items, shared addons, order note, coupon |
| Order | `src/store/orderStore.ts` | `glace-orders` | placed orders + status history |
| Favorites | `src/store/favoritesStore.ts` | `glace-favorites` | favorited product ids |
| Auth | `src/store/authStore.ts` | `glace-auth` | token + user |
| Wallet | `src/store/walletStore.ts` | `glace-wallet` | balance + transactions |

All are local-only today (no backend sync) — treat them as the shape a future API integration should match.

---

## Important paths

```
docs/swagger.yaml                          # OpenAPI 3 spec (all 3 menu endpoints + other APIs)
docs/MENU_CATALOG.md                       # Professional backend contract for menu API
src/app/swagger/SwaggerUIClient.tsx        # Interactive Swagger UI page at /swagger
src/app/api/openapi/                       # Serves swagger.yaml (for Swagger UI only)
src/types/menu.types.ts                    # Menu API types: IMenuCategory, IFlavorOption, IProduct
src/types/home|events|contact.types.ts     # Per-domain API types (I-prefixed)
src/data/fake-data/menu.ts                 # All menu categories, flavors, products (FAKE_MENU_CATEGORIES, FAKE_FLAVORS, FAKE_PRODUCTS)
src/data/fake-data/                        # Fake API payloads per domain (fallback on API failure)
src/hooks/menu/fetchMenuCategories.ts      # Fetch 3 endpoints + error → fake-data fallback
src/hooks/menu/fetchMenuProducts.ts
src/hooks/menu/fetchMenuProductById.ts
src/hooks/home|events|contact|auth/        # Other domain hooks
src/store/cartStore.ts                     # Cart state + consolidation logic (identical items merge)
src/store/orderStore|favoritesStore|authStore|walletStore.ts
src/lib/axios.ts                           # guestApi / userApi clients (configured via NEXT_PUBLIC_API_URL)
src/components/Order/templates/            # OrderBuilderTemplate.tsx, OrderFlatListTemplate.tsx
src/components/Order/shared/               # StepCard, Pill, QuantityStepper, StickyOrderBar, etc.
src/components/Cart|Menu|Checkout|Payment|Favorites|Account|Wallet|Auth|Offers/
```

---

## Mental models

**Home:** one `GET /home` → paint all sections.
**Events:** list + detail endpoints → React Query.
**Contact:** only send message (`POST`), no content GET.
**Menu:** browse categories → tap item → modal (table/flavors/confirmation) → "اطلب الآن" into an order page.
**Order pages:** pick size/flavors/mixes → product-specific addons only → add to cart; leaving with unsaved picks always confirms first.
**Cart:** products → **shared addons accordion** → **shared note** → coupon → summary.
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
   - Menu: 3 endpoints (categories, products, products/{id})
   - Auth: login, register, logout, me, profile, password
   - Others: home, events, contact, cart, checkout, orders, wallet, favorites

3. **Use the fake data as fallback** — the frontend already handles backend failures gracefully (logs error, returns fake data).

4. **Add endpoints to Swagger** as you build them (already documented for menu).

**Note:** Remove `src/app/api/*` mock routes once the backend is live (keep only `/api/openapi` for Swagger UI if desired).

---

## For developers & agents

- **Next.js 16** with breaking changes vs. training data — read `AGENTS.md` and `node_modules/next/dist/docs/` before touching framework APIs (routing, params/searchParams as promises, etc.).
- **API pattern:** All new endpoints follow: types → fake data → fetch function → React Query hook → Swagger → UI. Fake data is the fallback when the backend fails, so pages never render blank.
- **Interface naming:** All API types use **`I`** prefix (`IMenuCategory`, `IProduct`, etc.). Matches TypeScript and Swagger schema names.
- **Menu API:** Complete contract in `docs/MENU_CATALOG.md` — send this to your backend developer. It specifies JSON structure, availability control, pricing, and all 19 products.
- **Axios config:** `src/lib/axios.ts` uses `NEXT_PUBLIC_API_URL` from `.env.local`. Update the env file to switch between local/staging/production backends.
- **Cart consolidation:** Identical items (same product, size, flavors, addons) automatically merge into one line with increased quantity.
- Don't commit secrets; don't invent commits unless asked.

---

## License / ownership

Private project for Glace El Ameer. Default create-next-app boilerplate text has been fully replaced by this README.
