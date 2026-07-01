# Motion System — Amoon Bloom Storefront

A cohesive, performant animation layer built on **[`motion`](https://motion.dev)** (the
successor to `framer-motion`; imported from `motion/react`). Subtle and
purposeful — never decorative.

> **Status:** Phase 1 (storefront) and Phase 2 (admin panel) complete.

---

## Where everything lives

| File | Purpose |
| --- | --- |
| [`src/lib/motion.ts`](../src/lib/motion.ts) | **Single source of truth** — easing, durations, transition presets, and all reusable variants. Import from here; never hardcode timing in a component. |
| [`src/components/motion/MotionProvider.tsx`](../src/components/motion/MotionProvider.tsx) | App-wide `LazyMotion` + `MotionConfig`. Mounted once in the root layout. |
| [`src/components/motion/primitives.tsx`](../src/components/motion/primitives.tsx) | `Reveal`, `StaggerGroup`, `StaggerItem`, `HoverCard` — client wrappers that let **server components** animate their children. |
| [`src/app/(storefront)/template.tsx`](../src/app/(storefront)/template.tsx) | Storefront route transition (enter fade + slide, RTL-aware). |
| [`src/app/admin/template.tsx`](../src/app/admin/template.tsx) | Admin route transition (plain quick fade — lighter). |
| [`src/app/globals.css`](../src/app/globals.css) | `prefers-reduced-motion` CSS fallback (bottom of file). |

---

## Core rules (enforced by the presets)

- **Only `transform` + `opacity`.** Every variant animates x/y/scale/opacity —
  nothing that triggers layout or paint. Holds 60fps.
- **Easing** is always `[0.22, 1, 0.36, 1]` (`EASE_OUT`) — the same
  `--ease-out-soft` curve already in `globals.css`, so CSS and JS motion match.
- **Durations:** micro `0.22s` · base `0.32s` · reveal `0.5s`.
- **LazyMotion `strict`** is on ⇒ always use the lightweight **`m.*`** component,
  never `motion.*` (strict mode throws on `motion.*`). Only `domAnimation` features
  are bundled (no layout/drag) to keep JS small.
- **Reduced motion** is global: `MotionConfig reducedMotion="user"` neutralises
  JS motion for opted-out users, and the CSS media query covers the keyframe
  animations. No per-component branching needed.
- **RTL:** direction-aware slides flip via helpers that take `dir` from
  `useT()` (`slideVariants`, `pageVariants`, `drawerPanel`). Prefer vertical
  (`y`) motion where direction is irrelevant — it's RTL-safe by default.

---

## The presets & where they're used

### Scroll reveals — `Reveal`
Fade + gentle rise, fires once when ~20% enters the viewport
(`whileInView` + `viewport={{ once: true }}`).
- Section headers on the home page: **CategoryShowcase**, **FeaturedProducts**,
  **HomeSections**, and the product-detail "Related" heading.

```tsx
<Reveal><SectionHeader … /></Reveal>
```

### Lists & grids — `StaggerGroup` + `StaggerItem`
Container reveals children in sequence (`staggerChildren`).
- **`ProductGrid`** (shared by home, featured, curated sections, category page,
  and shop listing) — every product card staggers in.
- **TrustStrip** icons, **CategoryShowcase** cards, and the **product-detail
  info column** (title → price → description → CTA → perks, `trigger="mount"`).

```tsx
<StaggerGroup className="grid …">
  {items.map(x => <StaggerItem key={x.id}><Card …/></StaggerItem>)}
</StaggerGroup>
```

### Route transitions — `pageVariants(dir)`
Wired in `(storefront)/template.tsx`, which remounts per navigation. **Enter-only**
(fade + small directional slide) — App Router unmounts the old page before the new
one mounts, so cross-route exit isn't reliable. RTL flips the slide.

### Filter/sort crossfade — `baseTransition` + `AnimatePresence`
**ShopPLP** wraps the results in `AnimatePresence mode="wait"`, keyed by the active
filter signature. Changing category/sort/search crossfades the panel and the fresh
`ProductGrid` replays its stagger.

### Gallery crossfade — product detail
**ProductGallery** swaps the active image via `AnimatePresence` (fade + subtle
zoom, frames overlap so there's no empty flash). Thumbnails get CSS tap feedback.

### List presence — `listItem` + `AnimatePresence`
Enter/exit for items that appear/disappear in place (opacity + x-slide + scale,
no height animation → compositor-only).
- **Cart line items** in both `CartDrawer` and the cart page animate on add/remove.

### Price updates
Keyed `m.*` elements crossfade the number when it changes (opacity + small `y`):
- **CartLineItem** line total, **CartDrawer** subtotal, **CartSummary** subtotal & total.

### Step transitions — checkout
**CheckoutClient** wraps the active step in `AnimatePresence mode="wait"`, keyed by
`step` (fade + vertical slide, RTL-safe). The **ConfirmationStep** check mark and
the **OrderReceipt** success header use a spring "pop" + staggered text reveal.

### Micro-interactions
- `hoverLift` / `tapScale` / `popFeedback` presets in `lib/motion.ts` for JS gestures.
- **Trivial hovers stay in CSS** (per the perf rule): product card lift, quick-add
  button press, quantity `±` buttons, gallery thumbnails — all `transition-transform`
  / `active:scale-*`. Motion is reserved for orchestration (stagger, presence,
  scroll, route, price/step transitions).

---

## How to reuse

1. **A block that should fade in on scroll?** Wrap it in `<Reveal>`.
2. **A grid/list?** `<StaggerGroup>` + one `<StaggerItem>` per cell.
3. **A server component?** Use the wrappers above — they take server children as
   props, so the subtree stays server-rendered. Don't add `"use client"` just to animate.
4. **Already a client component?** Import `m` from `motion/react` and a preset
   (`baseTransition`, `fadeInUp`, `listItem`, …) from `@/lib/motion`. Use `m.*`, not `motion.*`.
5. **Need a new timing?** Add it to `lib/motion.ts` — don't inline a duration/easing.

---

## Phase 2 — Admin panel (lighter touch)

Reuses the same presets, tuned down for dense/utilitarian screens.

- **Shared overlays upgraded to `AnimatePresence` (enter *and* exit)** — this
  also benefits the storefront cart/filter drawers and toasts:
  - **`Modal`** → `overlayBackdrop` + `dialogPanel` (fade/scale in & out). Powers `ConfirmDialog`.
  - **`Drawer`** → `overlayBackdrop` + `drawerPanel(side, dir)` — RTL-safe slide, animates closed.
  - **`Toast`** → rise + fade in, fade out on dismiss.
- **`DataTable`** — real rows cascade in once via `staggerContainer(0.03)` +
  `subtleRise` (keyed by row count so a page/filter change replays it). Skeleton,
  error and empty states are untouched.
- **`AdminDashboard`** — KPI cards stagger in (`subtleRise`); the "Latest orders"
  panel reveals with `fadeInUp`.
- **Admin route transition** — plain quick fade (no slide) via `admin/template.tsx`.

`subtleRise` lives in `lib/motion.ts` — the admin-tuned variant (short travel,
micro timing). Use it for any new admin card/row cascades.

## Deliberate non-changes

- **Hero carousel** keeps its bespoke WAAPI Ken-Burns/crossfade — it already
  reveals and honours `prefers-reduced-motion`.
- **`Input`** keeps its CSS `focus-within` ring — a trivial focus state that
  shouldn't pull the component into the client bundle.
- **`layout` animations are avoided everywhere** — they require `domMax`; we ship
  `domAnimation` for a smaller bundle. Presence-based fade/slide is used instead,
  so on removal, siblings reflow after the exit rather than sliding.
