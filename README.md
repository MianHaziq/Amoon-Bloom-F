# Amoonis Boutique — Frontend

Storefront for the Amoonis Boutique e-commerce platform.

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** Redux Toolkit + react-redux
- **HTTP:** axios with typed `ApiError` interceptor
- **Forms:** react-hook-form + zod
- **Backend:** [`Amoonis-Boutique-B`](../Amoonis-Boutique-B) — Express + Prisma + PostgreSQL

## Getting started

```bash
cp .env.local.example .env.local   # configure backend API URL
npm install                        # already done by setup
npm run dev                        # http://localhost:3000
```

## Scripts

| Script        | Description                       |
| ------------- | --------------------------------- |
| `npm run dev`   | Start Turbopack dev server        |
| `npm run build` | Production build                  |
| `npm run start` | Run production build              |
| `npm run lint`  | Lint with ESLint flat config      |

## Project structure

```
src/
├── app/                       # Next.js App Router (routes only)
│   ├── (auth)/                # /login, /register — shared auth layout
│   ├── (marketing)/           # marketing pages (about, etc.)
│   ├── (shop)/                # /shop, /shop/[slug], /cart, /checkout
│   ├── layout.tsx             # root layout — wires StoreProvider, Header, Footer
│   ├── page.tsx               # landing page
│   └── globals.css            # Tailwind v4 entry + theme tokens
│
├── components/                # cross-feature UI
│   ├── ui/                    # design system primitives (Button, Container)
│   ├── layout/                # Header, Footer, Sidebar
│   └── common/                # generic widgets (Empty, Skeleton, …)
│
├── features/                  # feature-first modules (vertical slices)
│   ├── auth/
│   │   ├── api/               # auth.api.ts — axios calls
│   │   ├── components/        # LoginForm, RegisterForm
│   │   ├── hooks/             # useAuth — bridges API + redux + storage
│   │   ├── schemas.ts         # zod schemas for login/register
│   │   └── types.ts
│   ├── cart/
│   │   ├── components/
│   │   └── hooks/             # useCart — totals, add/update/remove
│   └── products/
│       ├── api/               # products.api.ts
│       ├── components/        # ProductCard, ProductGrid
│       ├── hooks/
│       └── types.ts
│
├── store/                     # Redux Toolkit
│   ├── slices/                # auth.slice, cart.slice, ui.slice
│   ├── providers/             # StoreProvider (client component)
│   ├── rootReducer.ts
│   └── index.ts               # makeStore + typed hooks (useAppDispatch, useAppSelector)
│
├── services/                  # external integrations
│   └── http.ts                # axios instance + ApiError + auth interceptor
│
├── lib/                       # framework-agnostic utilities
│   ├── cn.ts                  # tailwind-merge + clsx helper
│   ├── format.ts              # currency, date formatters
│   └── storage.ts             # safe localStorage wrapper
│
├── hooks/                     # cross-feature hooks
│   ├── useDebounce.ts
│   └── useMediaQuery.ts
│
├── config/
│   ├── env.ts                 # zod-validated client env vars
│   └── site.ts                # site metadata
│
├── constants/
│   ├── routes.ts              # ROUTES const map
│   └── storage-keys.ts
│
├── types/                     # shared TS types (api, money, image)
├── utils/                     # one-off helpers
└── styles/                    # extra global styles (if needed)
```

## Conventions

- **Feature-first.** Anything domain-specific lives under `features/<domain>/`. Cross-feature primitives live in `components/`, `hooks/`, or `lib/`.
- **Server by default.** Mark client-only files with `"use client"` (hooks, redux providers, anything using browser APIs).
- **Imports.** Use the `@/*` alias rooted at `src/`.
- **State.** Server data is fetched via the `services/http.ts` axios instance. Client UI / session / cart state lives in Redux Toolkit slices.
- **Validation.** All form inputs and env vars are validated with zod.

## Wiring to the backend

`NEXT_PUBLIC_API_URL` in `.env.local` should point to the running [`Amoonis-Boutique-B`](../Amoonis-Boutique-B) Express server (default `http://localhost:5000`). Auth tokens returned by `/auth/login` and `/auth/register` are persisted under `amoonis.auth.token` and attached to every request by the axios interceptor.
