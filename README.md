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
# http://localhost:3000/swagger
```

Env:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## App shell

- `src/app/layout.tsx` — root HTML shell, `lang="ar" dir="rtl"`, global `QueryProvider`, a global `LoadingPage` splash screen gated by a `sessionStorage` flag (`glace-splash-seen`) so it only shows once per session.
- `src/app/(main)/layout.tsx` — the shell for all storefront routes: `LogoNav` (top nav) + page content + `BottomNav` (mobile tab bar) + `FloatingFavoritesButton`.
- `src/app/(standalone)/` — routes outside the main shell (currently `coming-soon`).

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

**Local Next mocks** (so Swagger's "Try it out" works against `:3000` without a backend):

| Route | Purpose |
|--------|---------|
| `GET /api/openapi` | Serves `docs/swagger.yaml` |
| `GET /api/home` | Mock home payload |
| `GET /api/events` | Mock paginated events |
| `GET /api/events/[id]` | Mock event detail |

Only 3 domains have a local mock route + full Swagger docs so far (`home`, `events`, `contact` — contact has no GET, only mocks the POST via the hook's fallback). Everything else (menu, cart, checkout, auth, favorites, wallet, orders) is fake-data/local-state only — see [Continuing work](#continuing-work-suggested).

Swagger servers (Try it out):

1. `http://localhost:3000/api` — local mocks
2. `http://localhost:8000/api` — real backend
3. Production placeholder

---

## API surface (documented in Swagger today)

| Method | Path | Types | Hooks / functions |
|--------|------|--------|-------------------|
| `GET` | `/home` | `IHomePageData` | `fetchHomePage`, `useHomePage` |
| `GET` | `/events?page&perPage` | `IEventsListResponse` | `fetchEvents`, `useEvents` |
| `GET` | `/events/{id}` | `IEvent` | `fetchEventById`, `useEvent` |
| `POST` | `/contact` | `IContactRequest` → `IContactResponse` | `sendContactMessage`, `useSendContactMessage` |

Hooks that exist in code but aren't in Swagger yet: `useLogin` / `useRegister` / `useLogout` / `useMe` / `useUpdateProfile` / `useChangePassword` (`src/hooks/auth/`), `useMenuCategories` / `useMenuItems` (`src/hooks/menu/`).

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

### 4. Menu (`/menu`)

- `MenuClientPage`: sticky, **auto-scrolling category selector** — the active category chip tracks scroll position and auto-scrolls into view
- Categories (`src/data/fake-data/menuApiData.ts`, `FAKE_CATEGORIES`): آيس كريم → براد → براد مع بوظة → مشروبات باردة → مشروبات ساخنة → عصائر طبيعية → ذرة → ميلك شيك → كنافة آيس كريم → لقيمات → بان كيك → وافل → كريب → بيتزا جلاسيه → مولتن كيك → حلويات (اضافات اخرى / جديدنا were removed)
- `MenuModal` renders one of three shapes per item (`modalType`): `table` (size/flavor price grid, now with a **mix** column for family-size — `classic` / `mix` / `special`), `flavors` (flavor gallery), or `confirmation`
- Types: `PriceRow.mix` in `src/types/index.ts`, `ApiMenuItem`/`ApiPriceRow` in `menuApiData.ts`

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
docs/swagger.yaml                          # OpenAPI source of truth
src/app/swagger/                           # Swagger UI page
src/app/api/openapi|home|events/           # Local mocks
src/types/index.ts                         # Shared/legacy types + re-exports
src/types/home|events|contact.types.ts     # Per-domain API types (I-prefixed)
src/data/OrderData.ts                      # Flavors, pricing, addon catalog, mixes
src/data/fake-data/                        # Fake API payloads per domain
src/hooks/home|events|contact|auth|menu|order/
src/store/cartStore|orderStore|favoritesStore|authStore|walletStore.ts
src/lib/axios.ts                           # guestApi / userApi clients
src/components/Order/                      # Order pages, mix modal, cart bar, leave-guard dialog
src/components/Cart|Menu|Checkout|Payment|Favorites|Account|Wallet|Auth|Offers|ComingSoon/
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

## Continuing work (suggested)

Wire the same API pattern (types → fake data → fetch fn → RQ hook → Swagger → UI) for whatever moves to a real backend next:

- Menu categories/items (hooks already exist — `useMenuCategories`/`useMenuItems` — just needs Swagger + a real fetch fn)
- Cart / checkout / order placement (currently 100% client-state in `cartStore`/`orderStore`)
- Auth endpoints (hooks exist, no Swagger yet)
- Favorites / wallet / offers

Prefer documenting in **`docs/swagger.yaml`** first. Add a Next `app/api/*` mock route only when "Try it out" on `:3000` is actually needed (Contact deliberately has none — a POST-only fallback in the hook is enough).

---

## Agent notes

- This is **Next.js 16** with breaking changes vs. training data — read `AGENTS.md` and the local Next docs (`node_modules/next/dist/docs/`) before touching framework APIs (routing, params/searchParams as promises, etc.).
- Keep interface names with the **`I`** prefix for new API types; keep fake-data fallbacks so no page ever renders blank on a failed request.
- Don't commit secrets; don't invent commits unless asked.

---

## License / ownership

Private project for Glace El Ameer. Default create-next-app boilerplate text has been fully replaced by this README.
