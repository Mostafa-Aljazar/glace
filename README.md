<div align="center">

<img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>

<br />

<img src="./public/images/logo.svg" alt="جلاسيه الأمير — Glace El Ameer" width="260" />

# 🍦 Glace Next

### _Arabic-first ice cream storefront — not just a menu._

**Glace Next** (`glace-next`) is the Next.js storefront for **جلاسيه الأمير (Glace El Ameer)**.
It covers browsing, ordering, per-unit cart additions, checkout, accounts, wallet, favorites, and events —
built RTL / mobile-first, with a documented OpenAPI contract for the Laravel backend.

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [API Overview](#api-overview)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Team](#team)

---

## About the Project

**Glace Next** is the customer-facing web app for Glace El Ameer.

Customers browse categories and products, build complex ice-cream orders (sizes, flavors, mixes),
customize **additions per cart unit**, check out, track orders, and manage account / wallet / favorites —
all in Arabic, RTL, and optimized for mobile.

The frontend talks to a Laravel API via `NEXT_PUBLIC_API_URL`. While the backend is being built,
every fetch falls back to typed fake data so the UI never goes blank.

---

## Features

| Feature | Description |
| --- | --- |
| **Home & brand story** | Hero, about, why Glace, branches, and events from a single `GET /home` payload |
| **Menu catalog** | Categories + products with sticky auto-scrolling category chips |
| **Builder & flat-list orders** | Wizard flow (size → flavor → qty) or flat item lists with optional mixes |
| **Mix flavors** | Pick-2 / pick-3 mixes with per-flavor pricing (e.g. pistachio premium) |
| **Per-unit cart additions** | Customize toppings/sauces/biscuit per line or per physical unit (`toggle` / `counter`) |
| **Shared addons API** | `GET /menu/addons` with optional per-product override |
| **Slug-based products** | Opaque `id` (PK) for cart/orders; URL-safe `slug` for `/menu/order/{type}` |
| **Cart & coupons** | Hydration-safe persisted cart, consolidation of identical lines, notes & coupons |
| **Checkout & payment** | Delivery/pickup, payment methods, local order snapshot + status tracking |
| **Account suite** | Profile, orders, wallet, security panels |
| **Favorites** | Persisted favorites + floating shortcut (hidden on order pages) |
| **Events & contact** | Paginated events, detail pages, contact form |
| **Swagger UI** | Interactive OpenAPI docs at `/swagger` |
| **RTL · mobile-first** | Arabic UI, bottom nav, responsive spacing above the nav |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router) · React 19 · TypeScript |
| **Styling** | Tailwind CSS 4 · shadcn / Radix · Lucide · Framer Motion · Swiper |
| **State** | Zustand (persisted: cart, orders, favorites, auth, wallet) |
| **Data fetching** | TanStack React Query · Axios (`guestApi` / `userApi`) |
| **Forms** | react-hook-form · zod |
| **API docs** | OpenAPI 3 (`docs/swagger.yaml`) · Swagger UI at `/swagger` |
| **Backend target** | Laravel API (`NEXT_PUBLIC_API_URL`) |

> **Note:** Next.js 16 has breaking changes vs. older docs. Read `AGENTS.md` and `node_modules/next/dist/docs/` before changing framework APIs.

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 3. Run the dev server
npm run dev
```

| URL | Purpose |
| --- | --- |
| [http://localhost:3000](http://localhost:3000) | Storefront |
| [http://localhost:3000/swagger](http://localhost:3000/swagger) | Interactive API docs |

| Environment | Backend URL |
| --- | --- |
| **Local** | `http://localhost:8000/api` |
| **Staging** | `https://staging-api.glace.com/api` |
| **Production** | `https://api.glace.com/api` |

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
```

---

## Project Structure

```
glace-next/
│
├── docs/
│   ├── swagger.yaml          # OpenAPI 3 spec
│   └── MENU_CATALOG.md       # Menu API contract for Laravel
│
├── public/images/            # Static assets (logo, icons, decorations)
│
├── src/
│   ├── app/                  # App Router pages & layouts
│   │   ├── (main)/           # Storefront shell (nav + bottom bar)
│   │   ├── api/openapi/      # Serves swagger.yaml
│   │   └── swagger/          # Swagger UI
│   │
│   ├── components/           # UI by domain (Cart, Menu, Order, Home, …)
│   ├── data/fake-data/       # Typed fallbacks when the API is down
│   ├── hooks/                # Fetch functions + React Query hooks
│   ├── lib/                  # axios, serializers, helpers
│   ├── store/                # Zustand stores
│   └── types/                # I-prefixed API types
│
├── AGENTS.md                 # Next.js 16 agent notes
└── README.md
```

---

## Pages

| # | Route | Page |
| --- | --- | --- |
| 1 | `/` | Home |
| 2 | `/menu` | Menu browse |
| 3 | `/menu/order/[type]` | Order builder / flat-list (by product **slug**) |
| 4 | `/cart` | Cart + per-unit additions |
| 5 | `/checkout` | Delivery / pickup |
| 6 | `/payment` | Payment methods |
| 7 | `/order-status/[id]` | Order tracking |
| 8 | `/my-orders` | Order history |
| 9 | `/my-account` | Account dashboard |
| 10 | `/my-wallet` | Wallet |
| 11 | `/favorites` | Favorites |
| 12 | `/events` · `/events/[id]` | Events list & detail |
| 13 | `/contact` | Contact form |
| 14 | `/offers` | Offers |
| 15 | `/auth/*` | Login · register · restore / new password |
| 16 | `/swagger` | OpenAPI UI |

---

## API Overview

All paths are under `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api`).

### Public

| Method | Path | Hook |
| --- | --- | --- |
| `GET` | `/home` | `useHomePage` |
| `GET` | `/events` · `/events/{id}` | `useEvents` · `useEvent` |
| `POST` | `/contact` | `useSendContactMessage` |
| `GET` | `/menu/categories` | `useMenuCategories` |
| `GET` | `/menu/products?category=` | `useMenuProducts` |
| `GET` | `/menu/products/{slug}` | `useMenuProduct` |
| `GET` | `/menu/addons` | `useMenuAddons` |

### Protected (auth token)

`POST /auth/login` · `POST /auth/register` · `POST /auth/logout` · `GET /auth/me` · `PUT /auth/profile` · `POST /auth/password`

### Identity rules (menu)

| Field | Role |
| --- | --- |
| `id` | Opaque PK — cart, favorites, future checkout |
| `slug` | URL & `GET /menu/products/{slug}` |
| `addons` | Optional product override of the shared catalog |
| `type` on addon | `"toggle"` (checkbox) or `"counter"` (+/− qty, e.g. biscuit) |

---

## Architecture

When wiring any domain to the real API, follow this pattern:

1. **Types** — `src/types/<domain>.types.ts` (`I` prefix)
2. **Fake data** — `src/data/fake-data/*` (fallback on failure)
3. **Fetch** — `src/hooks/<domain>/fetch*.ts` via `guestApi` / `userApi`
4. **Hook** — React Query (`useQuery` / `useMutation`)
5. **Swagger** — paths + schemas + examples in `docs/swagger.yaml`
6. **UI** — consume the hook; don’t hardcode once an API exists

```ts
// src/lib/axios.ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const guestApi = axios.create({ baseURL: BASE });
const userApi = axios.create({ baseURL: BASE }); // injects auth token
```

**Fallback:** network/validation errors → fake data. Malformed list rows are dropped individually.

**Cart persist:** never call `useCartStore.persist.*` during SSR — only inside client effects.

### State stores

| Store | Key | Holds |
| --- | --- | --- |
| Cart | `glace-cart` (v4) | Items, optional per-unit `units`, note, coupon |
| Order | `glace-orders` | Placed orders + status |
| Favorites | `glace-favorites` | Product ids |
| Auth | `glace-auth` | Token + user |
| Wallet | `glace-wallet` | Balance + transactions |

Local-only today — shape for a future backend sync.

---

## Documentation

| Resource | Purpose |
| --- | --- |
| [`docs/MENU_CATALOG.md`](docs/MENU_CATALOG.md) | Full menu contract for Laravel (categories, products, flavors, addons, checklist) |
| [`docs/swagger.yaml`](docs/swagger.yaml) | OpenAPI 3 — all documented endpoints & schemas |
| `/swagger` | Interactive Try-it-out UI |
| `GET /api/openapi` | Serves the YAML to Swagger UI |

**Share `MENU_CATALOG.md` + `swagger.yaml` with the backend team.**

When checkout goes live, each ordered unit should send selected addon ids + the product **PK** (`id`), so quantity N can carry up to N distinct addition sets.

---

## Team

جلاسيه الأمير (Glace El Ameer) — Next.js storefront

- **Mostafa Aljazar** — Frontend Developer · [@Mostafa-Aljazar](https://github.com/Mostafa-Aljazar) · [LinkedIn](https://www.linkedin.com/in/mostafa-aljazar/) · [WhatsApp](https://wa.me/972595796456)

---

<div align="center">Made with ❤️ by Mostafa Aljazar · Glace El Ameer · 2026</div>
