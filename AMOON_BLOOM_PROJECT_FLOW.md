# Amoon Bloom — Complete Project Flow Document

> **Purpose:** This document is the definitive reference for developers joining the Amoon Bloom project. It covers the business concept, design language, every user-facing and admin-facing workflow, the technical architecture, and web-app requirements — in enough detail that no additional verbal explanation should be needed.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Brand Theme & Design Direction](#2-brand-theme--design-direction)
3. [Complete User-Side Flow](#3-complete-user-side-flow)
4. [Complete Admin Panel Flow](#4-complete-admin-panel-flow)
5. [Technical Architecture](#5-technical-architecture)
6. [Web App Requirements](#6-web-app-requirements)
7. [Screen-by-Screen Breakdown](#7-screen-by-screen-breakdown)
8. [User Roles & Permissions](#8-user-roles--permissions)
9. [End-to-End Journey Examples](#9-end-to-end-journey-examples)
10. [Development Notes](#10-development-notes)

---

## 1. Project Overview

### 1.1 What Is Amoon Bloom?

**Amoon Bloom** is a premium luxury gifting e-commerce platform targeted at the Gulf Cooperation Council (GCC) market — specifically the **United Arab Emirates** and **Saudi Arabia**. The app allows customers to discover, browse, and order high-quality curated gift boxes, floral arrangements, and boutique products for personal use or as gifts for special occasions.

The brand identity sits at the intersection of *luxury aesthetics*, *emotional gifting*, and *regional cultural relevance* (Ramadan collections, newborn gifts, Arabic-language support, SAR/AED currencies).

### 1.2 Purpose and Vision

The platform aims to be the go-to luxury gifting destination in the GCC region. The vision is to:

- Make premium gifting accessible, beautiful, and effortless
- Serve both individual customers and businesses (corporate gifting, brand collaborations)
- Blend modern e-commerce experiences with Gulf cultural sensibilities
- Support the Arabic language natively alongside English
- Eventually expand across the wider MENA region

### 1.3 Target Audience

| Segment | Profile |
|---|---|
| **Primary** | Women aged 20–45 in UAE and Saudi Arabia shopping for personal or gift purchases |
| **Secondary** | Corporate buyers sourcing branded/customized gift boxes |
| **Tertiary** | International visitors/residents looking for premium GCC-specific gifts |

### 1.4 Business Model

- **Direct e-commerce**: Customers place orders and pay online for curated product boxes
- **Brand collaborations**: Premium brands (e.g., Netflix, Maserati, Gucci) partner with Amoon Bloom for co-branded gift packaging — displayed as a "Collaborations" section on the home screen
- **Seasonal collections**: Time-limited product drops tied to cultural events (Ramadan, Eid, National Day)
- **Corporate gifting**: Bulk orders with custom messaging (order message field on cart)
- **Promotional campaigns**: Promo codes with percentage or fixed discounts, per-user limits, and product/category targeting

### 1.5 Core Features and Services

**Customer-facing:**
- Location-based onboarding (country → city determines currency and delivery scope)
- Product catalogue organized by curated categories
- Product detail with image gallery, variant selection, and quantity control
- Local shopping bag (works without login) + server-synced cart (after login)
- Promo code validation with real-time discount calculation
- Multi-step checkout with saved delivery addresses
- Order history and order detail tracking
- Wishlist management
- User profile with photo, phone, preferred language, and address
- Bilingual (EN/AR) interface with seamless toggle
- Push notifications for order status and promotions

**Admin-facing:**
- Full product and category CRUD
- Banner and homepage section management with drag-and-drop reordering
- Order management with status updates
- User management with role assignment and permission control
- Promo code CRUD with business rule configuration
- KPI analytics dashboard (total revenue, sales trends, category performance)
- Collaboration partner management

### 1.6 Overall UX Goals

- **Zero friction onboarding**: Location selection (2 taps) → browse immediately, no forced login
- **Visual-first browsing**: Products are image-led; minimal text on cards
- **Instant feedback**: Cart updates are immediate (local BagCubit); server sync happens silently
- **Graceful bilingual switching**: Language toggle animates smoothly without losing context
- **Mobile-first, premium feel**: Generous white space, subtle shadows, refined typography

---

## 2. Brand Theme & Design Direction

### 2.1 Aesthetic and Mood

Amoon Bloom's visual identity is **understated luxury** — not flashy or maximalist, but quietly premium. Think high-end boutique editorial rather than loud retail. The mood board draws from:

- Luxury floral boutiques (soft pastels, natural light)
- Gulf premium lifestyle brands (gold accents replaced with soft coral/peach)
- Modern minimalist Arabic design (geometric precision meets warmth)

The result is an app that feels **expensive without trying**, warm without being casual, and Arabic-friendly without sacrificing global appeal.

### 2.2 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#111111` | Text, buttons, navbars, borders |
| `accent` | `#EFA790` | Active states, focus rings, highlights, secondary buttons |
| `accentLight` | `#F5C3B3` | Hover/pressed states, soft accents |
| `accentDark` | `#D98770` | Darker accent interactions |
| `background` | `#FFFFFF` | App background |
| `surface` | `#FFFFFF` | Card surfaces |
| `surfaceVariant` | `#F5F5F5` | Icon containers, list backgrounds, input fills |
| `textPrimary` | `#111111` | Main body text |
| `textSecondary` | `#999999` | Subtitles, meta information |
| `textHint` | `#BBBBBB` | Input placeholders |
| `divider` | `#E5E5E5` | Horizontal rules, borders |
| `error` | `#E53935` | Validation errors |
| `success` | `#43A047` | Order confirmation, success states |
| `splashBackground` | `#000000` | Native splash screen background |
| `bannerWarm` | — | Banner placeholder (warm tone) |
| `bannerRose` | — | Banner placeholder (rose tone) |
| `bannerBlue` | — | Banner placeholder (blue tone) |

**The accent color `#EFA790` (soft coral/peach) is the brand signature.** It appears on focused inputs, active navigation items, price highlights, CTA secondary buttons, and anywhere the design needs warmth without aggression.

### 2.3 Typography

Three font families via Google Fonts:

| Font | Weight/Style | Usage |
|---|---|---|
| **Poppins** | Regular/Medium/SemiBold | All body text, UI labels, form fields, product names, navigation |
| **Montserrat** | Bold, wide letter-spacing | Brand logo, "AMOON BLOOM" wordmark |
| **Dancing Script** | Cursive | Brand tagline / script overlay on hero banners |

**Text style scale** (all Poppins unless noted):

| Style | Size | Weight | Usage |
|---|---|---|---|
| `displayLarge` | 28px | SemiBold | Hero headlines on banners |
| `displayMedium` | 24px | SemiBold | Page titles |
| `headingLarge` | 20px | SemiBold | Section headers |
| `headingMedium` | 18px | Medium | Card titles, dialog titles |
| `headingSmall` | 16px | Medium | Sub-section headers |
| `bodyLarge` | 15px | Regular | Product descriptions |
| `bodyMedium` | 14px | Regular | Body copy, list items |
| `bodySmall` | 12px | Regular | Captions, meta |
| `button` | 15px | SemiBold | All button labels |
| `buttonSmall` | 13px | Medium | Small action buttons |
| `navLabel` | 10px | Medium | Bottom nav labels |
| `brandLogo` | 22px | Bold, Montserrat | App bar brand name |
| `brandScript` | 18px | Dancing Script | Hero taglines |
| `link` | 14px | Medium, accent color | Inline links |

### 2.4 UI/UX Style Principles

1. **Cards over lists**: Products are shown as cards with images, not text rows
2. **Pill shapes**: Buttons, chips, text fields, and nav bars use `borderRadius: 100` (fully rounded)
3. **Soft shadows**: Cards use `AppColors.shadowLight` (8% black); FABs use `AppColors.shadow` (20% black) — never hard borders
4. **Minimal chrome**: App bars are borderless with white backgrounds; bottom nav floats on white
5. **Bottom sheets over dialogs**: Filtering, location, promo codes, and language selection use modal bottom sheets
6. **Arabic RTL support**: The entire layout mirrors for Arabic, including icons, navigation, and text alignment — all via Flutter's built-in directionality
7. **Smooth transitions**: Page pushes use `FadeSlideRoute` (fade + slide up) or `ScaleFadeRoute` (scale + fade); language switch uses a full-screen dark overlay animation
8. **No loading skeletons (yet)**: Loading states use `AppLoading` (centered spinner); shimmer skeletons are a planned enhancement

### 2.5 Buttons

Four variants, all pill-shaped (borderRadius 100):

| Variant | Background | Text color | Use case |
|---|---|---|---|
| `primary` | `#111111` dark | White | Main CTA (Add to Cart, Checkout, Sign In) |
| `secondary` | `#EFA790` accent | `textOnAccent` | Secondary CTA, wishlist, social sign-in |
| `outline` | Transparent + dark border | `#111111` | Cancel, back, secondary actions |
| `ghost` | Transparent | `#EFA790` accent | Tertiary inline actions, "View All" links |

### 2.6 Mobile-First Design and Web Alignment

The mobile app is the design reference. The web app must:
- Use the same color tokens, typography scale, and component patterns
- Maintain visual consistency so a user who switches between web and mobile feels no disorientation
- On desktop, use a 2-column layout (navigation sidebar + content area) for admin; standard responsive grid for customer-facing pages
- On mobile web, replicate the mobile app layout 1:1 including bottom navigation

---

## 3. Complete User-Side Flow

### 3.1 App Launch — Splash Screen

**What happens:**
1. The device displays the **native splash screen** — a black background with the Amoon Bloom logo centered. Production splash is full-screen; development/staging has a smaller inset logo.
2. Flutter initializes: Firebase connects, SharedPreferences loads, session service checks for a persisted user token.
3. Once the first frame renders, the native splash is removed (`FlutterNativeSplash.remove()`).
4. The app evaluates the startup state and routes accordingly (see §3.2).

**Duration:** Typically < 1 second. No artificial delays are added.

**Error edge case:** If Firebase fails to initialize (network error), the app still launches — Firebase Messaging simply won't register until connectivity is restored.

---

### 3.2 Initial Routing (Decision Tree)

On every cold start, the app checks three conditions in order:

```
Is there a persisted session with role ADMIN or MANAGER?
    YES → Go directly to Admin Dashboard
    NO  ↓
Is a delivery city already stored in LocationService?
    YES → Go directly to Home Page (4-tab shell)
    NO  ↓
    → Go to Country Selection Page (onboarding)
```

This means:
- **Returning admin**: Goes straight to admin panel, no friction
- **Returning customer**: Lands directly on the home feed
- **New user / after install**: Must complete the 2-step location onboarding before seeing products

---

### 3.3 Onboarding Flow — Location Selection

**Purpose:** The app is region-specific. Delivery availability, currency, and product relevance depend on the user's city. This is captured once, before any browsing.

#### 3.3.1 Country Selection Page

**UI:**
- No app bar; full-page hero layout
- Brand logo + tagline at top
- Headline: "Hello there 👋" / "أهلاً بك" (localized)
- Subtitle: "Choose your delivery country"
- Two country cards, each showing: flag emoji + country name
  - 🇦🇪 United Arab Emirates
  - 🇸🇦 Saudi Arabia
- Language toggle button (EN/AR) at top-right
- "Continue" button (disabled until a country is selected)

**User actions:**
1. Tap a country card → card gets a pink border + inner dot (`AppColors.accent`)
2. Tap language toggle → instant EN/AR switch (no navigator reset at this stage)
3. Tap Continue → navigates to City Selection

**Backend logic:** No API call. Data is static (`CountryEntity.all`). The selection is stored in `LocationCubit` (in-memory) and written to `LocationService` (SharedPreferences) on completion of the full flow.

**Validation:** Continue button is disabled if no country is selected.

---

#### 3.3.2 City Selection Page

**UI:**
- App bar with back button and page title "Select City" / "اختر مدينة"
- List of cities for the selected country, each row showing: city name + radio indicator
  - UAE cities: Dubai, Abu Dhabi, Sharjah
  - Saudi Arabia cities: Riyadh, Jeddah, Dammam
- Horizontal dividers between city rows
- "Continue" button pinned at bottom (disabled until city selected)

**User actions:**
1. Tap a city row → radio indicator fills with `AppColors.accent`
2. Tap Continue → city is committed to `LocationCubit` + `LocationService`, then navigates to `HomePage`

**Backend logic:** No API call. Navigation to `HomePage` uses `Navigator.pushReplacement` so the user cannot back-navigate to onboarding once the city is selected.

**Currency binding:** Selecting UAE locks currency to `AED`; Saudi Arabia locks to `SAR`. This affects all product prices and cart totals displayed throughout the app.

**Persistence:** City and country are saved to `SharedPreferences` via `LocationService`. On subsequent launches, onboarding is skipped.

---

### 3.4 Home Page — 4-Tab Shell

The `HomePage` is the root of the customer experience. It is an `IndexedStack` with **4 tabs**, each having its own nested `Navigator` so tab navigation state is preserved when switching.

```
Tab 0: Home (house icon)
Tab 1: Shop (grid icon)
Tab 2: Bag (cart icon — shows item count badge)
Tab 3: Profile (person icon)
```

**Back-button behavior:**
- If the current tab's nested navigator has pages to pop → pop that tab's stack
- If no pages to pop and not on Tab 0 → reset to Tab 0
- If on Tab 0 with empty stack → exit app

**Tab bar:** Floating pill-shaped bottom nav on a white background. Active tab item uses `AppColors.accent`. Bag tab shows an item count badge when `BagCubit.itemCount > 0`.

---

### 3.5 Home Tab (Tab 0) — Discovery Feed

**Purpose:** The primary product discovery surface. Curated editorial content drives impulse browsing.

**Layout (scrollable, SliverAppBar-based):**

1. **Sticky App Bar** (collapses on scroll):
   - Brand name "Amoon Bloom" in Montserrat bold
   - "Deliver To: [City]" widget on the right → tapping opens `DeliveryLocationSheet`
   - Notification bell icon (navigates to notifications or opens notification sheet)

2. **Banner Carousel:**
   - Full-width auto-scrolling `PageView` with 3+ banners
   - Each banner: background image (or placeholder color if no image), headline + subtitle in bold white/dark typography
   - Dot-indicator row below the carousel showing current position
   - Banners are loaded from the backend via `AdminCubit.loadBanners()` at startup

3. **Category Section:**
   - Horizontal scrollable row of category name chips
   - Tapping a category chip scrolls to that category's product section further down the page

4. **Product Sections:**
   - Multiple vertically-stacked sections, one per category
   - Each section: section title + "View All" link + horizontal scrollable row of product cards
   - Sections and their product assignments are loaded from `AdminCubit.loadSections()` and `AdminCubit.loadProducts()`

5. **Collaboration Section:**
   - Full-width section titled "Our Collaborations"
   - Horizontal scrollable row of brand partner logos/cards
   - Partners: Netflix, Maserati, Gucci (currently mock data)

**Product card (in horizontal sections):**
- Product image (full-bleed, fixed aspect ratio)
- Product name (1 line truncated)
- Price display: if discounted, shows `discountedPrice` in accent color + original `price` with strikethrough
- Currency from `LocationCubit` (AED or SAR)
- Tap → `ProductDetailPage`

**DeliveryLocationSheet:**
- Modal bottom sheet matching the city selection flow
- Shows current country + city + option to change
- Changing city updates `LocationCubit` + `LocationService` and refreshes currency across the app

**Data loading sequence on startup (`_AppShell.initState`):**
1. `AdminCubit.loadCategories()` — fetches product categories from API
2. `AdminCubit.loadProducts()` — fetches all products
3. `AdminCubit.loadBanners()` — fetches promotional banners
4. `AdminCubit.loadSections()` — fetches homepage sections configuration

All four run sequentially to avoid race conditions. Until they complete, the home tab shows a loading indicator in each section.

---

### 3.6 Product Detail Page

**Navigation:** Push onto the current tab's nested navigator. Accessible from Home tab sections, Shop tab grid, and Wishlist.

**Layout:**

1. **Image Gallery:**
   - `PageView` of product images (horizontal swipe)
   - Dot indicators below gallery
   - "Back" button overlaid top-left
   - Wishlist heart icon overlaid top-right

2. **Product Info Block:**
   - Product name (large heading)
   - Arabic name below if `nameAr` is present and locale is Arabic
   - Price display (discounted vs regular, with currency)
   - Subtitle / short description

3. **Product Descriptions:**
   - If `product.descriptions` list is non-empty: renders each `ProductDescriptionEntity` block (title + body) as an accordion or flat section
   - Falls back to the flat `description` string if `descriptions` is empty

4. **Product Options:**
   - If `product.productOptions` list is non-empty: renders each `ProductOptionEntity` as a selector (e.g., Size chips: S / M / L; Color swatches)
   - Selected option value is stored locally for inclusion in the cart item

5. **Quantity Selector:**
   - Decrement / increment buttons with a count display (minimum 1, maximum `stock` if set)

6. **Add to Bag Button:**
   - Primary `AppButton` pinned at bottom
   - On tap: adds the item to `BagCubit` with the selected quantity and options
   - Triggers an animated bottom sheet: "Added to Bag ✓" with a "Go to Bag" action button
   - "Go to Bag" calls the `onGoToBag` callback to switch the root `IndexedStack` to Tab 2

**Stock edge case:** If `product.stock == 0`, the "Add to Bag" button is disabled and shows "Out of Stock".

**Wishlist:**
- Tapping the heart icon toggles the product in `WishlistCubit`
- Heart fills with `AppColors.accent` when wishlisted
- No auth required for wishlist in current implementation (wishlist is local/in-memory)

---

### 3.7 Shop Tab (Tab 1)

**Purpose:** Full product catalogue with search and filtering.

**Layout:**

1. **Search Bar** at top — text input triggers real-time filtering of the product grid
2. **Category Filter Chips** — horizontal scrollable row below search
   - "All" chip (default selected) + one chip per category
   - Active chip has `AppColors.accent` fill
3. **Product Grid** — 2-column `GridView` of product cards
   - Same product card style as Home tab sections
   - Filtered by search text AND selected category chip (both applied simultaneously)

**Search behavior:**
- Filters by product `name` and `nameAr` (case-insensitive, locale-aware)
- Empty state: "No products found" illustration + message

**Data source:** `AdminCubit.allProducts` (computed getter flattening all category product lists). The Shop tab reads from the same `AdminCubit` state as the home tab — no separate API call.

**Navigation:** Tapping a product card pushes `ProductDetailPage` onto the Shop tab's nested navigator. The `onGoToBag` callback switches to Tab 2 (Bag).

---

### 3.8 Authentication — Sign In / Sign Up

Authentication is optional for browsing and adding to the local bag, but **required for checkout**. Auth pages are pushed from:
- Profile tab "Sign In" link
- Bag tab "Proceed to Checkout" button (if not logged in)

#### 3.8.1 Login Page

**UI:**
- No scaffold; full-page white background with brand logo at top
- Email field (`AuthFormField` — pill-shaped, no label, just hint text)
- Password field (with built-in show/hide toggle)
- "Forgot password?" link → `ForgotPasswordPage`
- "Sign In" primary `AppButton`
- Divider with "or"
- Google Sign-In secondary button (Google logo + "Sign in with Google")
- Apple Sign-In secondary button (Apple logo + "Sign in with Apple") — iOS only
- "Don't have an account? Sign Up" link at bottom → `SignupPage`

**User actions:**
1. Fill email + password → tap "Sign In"
2. Or tap Google / Apple sign-in buttons

**Backend flow (email/password):**
- `AuthBloc` receives `AuthLoginRequested(email, password)` event
- Emits `AuthLoading`
- `LoginUseCase.call(email, password)` → `AuthRemoteDataSource.login()` → `POST /auth/login`
- API response: `{ "success": true, "data": { "user": {...}, "token": "..." } }`
- `UserModel.fromApiJson()` parses the response
- Repository returns `Right(UserModel)`
- Bloc emits `AuthLoginSuccess(user)`
- `_AppShell` listener: if `user.isAdmin || user.isManager` → navigate to `AdminDashboardPage`; else → `HomePage` with cart sync

**Backend flow (Google):**
- `AuthBloc` receives `AuthGoogleSignInRequested`
- `GoogleSignInUseCase` calls Google Sign-In SDK → gets `idToken` + `accessToken`
- `POST /auth/google-signin` with the tokens
- Same parse + emit pattern as email login

**Backend flow (Apple):**
- `AuthBloc` receives `AuthAppleSignInRequested` (iOS only)
- `AppleSignInUseCase` calls Sign In with Apple SDK → gets `identityToken` + `authorizationCode`
- `POST /auth/apple-signin` with the tokens

**Session persistence:**
- On any successful auth, `SessionService` stores 18 user fields in `SharedPreferences`
- On next cold start, the session is restored automatically via `AuthSessionRestoreRequested` event in `AuthBloc.initState`
- JWT token is stored securely via `flutter_secure_storage`

**Push token registration:**
- On successful login, `RegisterPushTokenUseCase` is called with the current FCM token from Firebase Messaging
- This registers the device for push notifications tied to the user's account

**Validation:**
- Email: must be valid email format
- Password: minimum length enforced client-side before API call
- Both fields: non-empty check

**Error handling:**
- `AuthFailureState(message)` is emitted on API error, social SDK cancellation, or network error
- Error message is shown as a `SnackBar` or inline form error
- `CancelledFailure` is shown as a neutral "Sign-in cancelled" message, not an error

---

#### 3.8.2 Signup Page

**UI:**
- Full name field
- Email field
- Password field
- Confirm password field
- "Create Account" primary `AppButton`
- "Already have an account? Sign In" link

**Backend flow:**
- `AuthBloc` receives `AuthSignupRequested(fullName, email, password)`
- `SignupUseCase.call()` → `POST /auth/signup`
- On success → emits `AuthSignupSuccess(user)`, same navigation logic as login

**Validation:**
- Full name: non-empty
- Email: valid format
- Password: minimum length
- Confirm password: must match password

---

#### 3.8.3 Forgot Password Page

**UI:**
- Email field
- "Send Reset Link" primary button
- On success: shows confirmation message "Check your email for a reset link"

**Backend flow:**
- `ForgotPasswordUseCase` → `POST /auth/forgot-password`
- Emits `AuthForgotPasswordSuccess`

---

### 3.9 Profile Tab (Tab 3)

**Purpose:** Account management, settings, and app preferences.

**Layout (logged-out state):**
- "Sign In" link and "Create Account" link prominently displayed
- Language toggle (EN/AR)
- Currency display (AED/SAR from location)
- "Deliver To" button → `DeliveryLocationSheet`
- Social follow links
- App version at bottom

**Layout (logged-in state):**
- User avatar (circular, tapable → `EditProfilePage`) + full name + email
- "Edit Profile" → `EditProfilePage`
- "Personal Details" → `PersonalDetailsPage`
- "My Orders" → `OrderHistoryPage`
- "My Wishlist" → `WishlistPage`
- Language toggle
- Currency display
- "Deliver To" button
- Notification preferences → opens notification preferences screen
- Policies (Privacy Policy, Terms of Service, Refund Policy)
- "Contact Us" (WhatsApp deep link or support email)
- "Follow Us" social links
- "Sign Out" button
- App version

---

### 3.10 Edit Profile Page

**Fields:** Avatar (image picker), full name, email (read-only), phone number

**Backend flow:**
- `UpdateProfileUseCase` → `PUT /profile` with updated fields
- `UploadDatasource` handles avatar image upload separately before profile update
- On success: emits `AuthLoginSuccess` with updated `UserEntity` (so session reflects new data)

**Phone update:** `UpdatePhoneUseCase` → separate `PUT /profile/phone` endpoint

**Language preference:** `UpdatePreferredLanguageUseCase` → `PUT /profile/preferred-language` — syncs the user's UI language preference to the backend (used for notification language)

---

### 3.11 Personal Details Page

Shows and allows editing of: full name, email, phone, address country, address city.

Related to `AddressesCubit` for the address management aspect.

---

### 3.12 Bag Tab (Tab 2) — Cart

**Purpose:** Review and manage the shopping cart, apply promo codes, and initiate checkout.

**Two-layer cart architecture:**

| Layer | Cubit | Storage | Auth required |
|---|---|---|---|
| Local bag | `BagCubit` | In-memory (`List<BagItemEntity>`) | No |
| Server cart | `CartCubit` | Backend via Dio | Yes |

When the user logs in, `BagCubit` items are synced to the server cart via `CartCubit`. The `BagCubit` is always the authoritative UI source; `CartCubit` handles persistence.

**UI (non-empty state):**
1. **Cart item list:**
   - Product image (thumbnail) + product name + price
   - Quantity selector: `−` / `[count]` / `+` buttons
   - Individual item custom message field (for personalization — `UpdateCartItemMessageUseCase`)
   - Remove button (swipe or trash icon)
2. **Order message field:**
   - A single text field for a global message on the entire order (e.g., "Happy Birthday!")
   - Synced via `UpdateOrderMessageUseCase`
3. **Promo Code:**
   - "Have a promo code?" link → tapping opens `PromoCodesSheet` modal bottom sheet
4. **Order Summary:**
   - Subtotal (sum of all items at `displayPrice`)
   - Delivery: "Free delivery" or delivery fee
   - Discount (shown if promo code applied) in accent color
   - **Total** in bold
5. **"Proceed to Checkout" button** (full-width primary AppButton)
   - If not logged in → pushes `LoginPage` via rootNavigator
   - If logged in → pushes `CheckoutPage`

**Empty state:** Illustration + "Your bag is empty" + "Continue Shopping" ghost button that switches to Tab 1 (Shop).

**Cart item quantities:**
- `BagCubit.increment(index)` / `BagCubit.decrement(index)` (minimum 1)
- Decrement to 0 → item is removed via `BagCubit.remove(index)`

**Product suggestions:**
- `CartSuggestionsCubit` (`GetCartSuggestionsUseCase`) fetches products to display in a "You might also like" section at the bottom of the Bag tab
- Only shown to logged-in users with non-empty cart

---

### 3.13 Promo Codes Sheet

**Modal bottom sheet UI:**
1. Text input at top for manually entering a code
2. "Apply" button (primary)
3. List of available codes (fetched by `GetAvailablePromoCodesUseCase`) showing: code name, discount type (% or fixed), validity date
4. Tapping a listed code auto-fills the text input

**Validation flow:**
- `PromoCodesCubit.validateCode(code, cartTotal, cartItems)` → `ValidatePromoCodeUseCase` → `POST /promo-codes/validate`
- The backend authoritatively computes: `cartSubtotal`, `eligibleSubtotal`, `discountAmount`, `total`
- The app must use the backend's `discountAmount` verbatim — never re-derive it from product prices
- On success: sheet closes, Bag tab shows discount line in order summary
- On failure: inline error message below the input (invalid code, expired, minimum not met, etc.)

**Business rules for promo codes:**
- `discountType`: `PERCENTAGE` or `FIXED`
- `appliesTo`: `ALL_PRODUCTS`, `SELECTED_PRODUCTS`, or `CATEGORY`
- `minOrderAmount`: minimum cart subtotal required
- `maxDiscount`: cap on the discount amount (for percentage codes)
- `validFrom` / `validUntil`: date range
- `usageLimit`: total redemptions allowed
- `usageLimitPerUser`: per-user cap

---

### 3.14 Checkout Page

**Purpose:** Multi-step flow to complete an order.

**Stepper structure (4 steps shown by `CheckoutStepper`):**

#### Step 1 — Delivery Address
- Lists user's saved addresses from `AddressesCubit`
- Default address pre-selected
- "Add new address" → form to create a new `AddressEntity` (label, full name, phone, street, apartment, city, state, postal code, country) via `AddAddressUseCase`
- "Continue" → Step 2

**Address fields:**
- Label (optional — e.g., "Home", "Office")
- Full name (recipient)
- Phone (recipient)
- Street address
- Apartment / unit number (optional)
- City
- State / region (optional)
- Postal code (optional)
- Country

#### Step 2 — Payment
- Currently: Cash on Delivery option (or integration with a payment gateway — see §5.8)
- Order message field (if not already entered in Bag tab)
- Applied promo code display (if any)
- "Continue" → Step 3

#### Step 3 — Order Summary
- Full recap: items, quantities, prices, delivery address, total, discount, promo code applied
- Final "Place Order" primary button

#### Step 4 — Confirmation
- Order placed successfully
- Order ID displayed
- "Continue Shopping" button → returns to Tab 0

**Backend flow:**
- `OrderCubit.checkout(token, items, addressId, promoCode?)` → `CheckoutUseCase` → `POST /orders`
- On success: emits `OrderSuccess(order)`, navigates to confirmation step
- Cart is cleared (`CartCubit.clearCart()` + `BagCubit.clear()`) on successful checkout

---

### 3.15 Order History Page

**Accessed from:** Profile tab → "My Orders"

**Layout:**
- List of past orders, each showing: order ID, date, status badge, total amount
- Status badges: Pending (yellow), Confirmed (blue), Processing (orange), Shipped (purple), Delivered (green), Cancelled (red)
- Tap → `CustomerOrderDetailPage`

**CustomerOrderDetailPage:**
- Order header: ID, date, status
- Item list with images, names, quantities, prices
- Delivery address
- Order message (if any)
- Promo code applied (if any)
- Order total breakdown

---

### 3.16 Wishlist Page

**Accessed from:** Profile tab → "My Wishlist" OR heart icon on product cards

**Layout:** 2-column grid of wishlisted products (same card style as Shop tab)

**Actions:**
- Tap product → `ProductDetailPage`
- Tap filled heart → removes from wishlist
- "Add to Bag" shortcut on each card

**Storage:** `WishlistCubit` — currently in-memory (not persisted to server)

---

### 3.17 Notifications

**Push notification categories (user can toggle in Profile → Notification Preferences):**

| Category | Description |
|---|---|
| `orderStatus` | Order confirmation, shipped, delivered, cancelled |
| `promotions` | New promo codes, seasonal offers, sales |
| `announcements` | New collections, platform announcements |

**Preference management:**
- `NotificationPreferencesCubit` manages the toggle state
- `GetNotificationPreferencesUseCase` → `GET /profile/notification-preferences`
- `UpdateNotificationPreferencesUseCase` → `PUT /profile/notification-preferences`

**Push delivery:** Firebase Cloud Messaging (FCM). Token registered/unregistered on login/logout via `RegisterPushTokenUseCase` / `UnregisterPushTokenUseCase`.

**In-app handling:**
- `NotificationHandler` routes tapped notifications to the relevant page (e.g., order status notification → `CustomerOrderDetailPage` for that order)
- `PushTokenManager` handles FCM token refresh and re-registers the new token with the backend

---

### 3.18 Language Switching

**Trigger:** Language toggle button (available in Country Selection, Profile tab, and within settings)

**Behavior:**
1. `LocaleCubit.toggle()` is called
2. A full-screen dark overlay animation fades in over the entire app
3. The `MaterialApp` locale updates to the new `Locale('ar')` or `Locale('en')`
4. The navigator stack resets (pops all pages back to the initial route)
5. The dark overlay fades out revealing the re-rendered app in the new language
6. If the user is logged in, `UpdatePreferredLanguageUseCase` is also called to persist the preference to the backend

**RTL support:** Flutter's built-in directionality handles RTL layout for Arabic. All widgets are direction-aware.

---

### 3.19 Logout

**Trigger:** Profile tab → "Sign Out" button (+ confirmation dialog)

**Flow:**
1. `AuthBloc` receives `AuthLogoutRequested` event
2. `UnregisterPushTokenUseCase` is called to de-register the FCM token from the backend
3. Session is cleared from `SharedPreferences` via `SessionService.clear()`
4. JWT token is deleted from `flutter_secure_storage`
5. `BagCubit.clear()` and `CartCubit` state cleared
6. `AuthBloc` emits `AuthLoggedOut`
7. `_AppShell` listener calls `_onAuthSignedOut()` → animates and resets navigator to `_buildInitialPage()` (which shows `CountrySelectionPage` if no city saved, or `HomePage` if city was previously selected)

---

## 4. Complete Admin Panel Flow

The admin panel is a separate navigation tree within the same Flutter app. Admins and managers are routed to `AdminDashboardPage` instead of `HomePage` after authentication.

### 4.1 Admin Authentication

Admins log in through the same `LoginPage` as regular users. The backend returns `role: "ADMIN"` or `role: "MANAGER"` in the user object. The `_AppShell` detects `user.isAdmin || user.isManager` and replaces the navigator stack with `AdminDashboardPage`.

**Manager permissions** (`managerPermissions: List<String>`) are a list of permission keywords granted by an admin. A manager's access to admin pages is gated by `user.hasPermission(keyword)`. Admins always have all permissions.

**Example permission keywords:** `manage_banners`, `manage_products`, `manage_categories`, `manage_orders`, `manage_users`, `manage_sections`, `manage_promo_codes`, `view_analytics`

---

### 4.2 Admin Dashboard Page

**Purpose:** Top-level overview screen showing business health at a glance.

**Layout:**
- Welcome header: "Hello, [Admin Name]"
- **KPI cards row** (from `GetKPIAnalyticsUseCase`):
  - Total Revenue (currency-formatted)
  - Total Orders
  - Total Users
  - Active Products
- **Quick navigation tiles** — links to all admin sections
- **Recent orders** — last 5 orders with status badges
- **Daily sales chart** — from `GetDailySalesUseCase` (line chart, last 30 days)

**Data source:** `AnalyticsCubit` → `GetKPIAnalyticsUseCase` + `GetDailySalesUseCase`

---

### 4.3 Analytics Page

**Accessed from:** Dashboard → Analytics

**Sections:**

1. **KPI Summary:** Revenue, orders, users, average order value
2. **Daily Sales Chart:** Line chart of sales by day (date range picker)
3. **Category Revenue Chart:** Pie or bar chart of revenue contribution per category (`GetCategoryRevenueUseCase`)

**Permissions:** `view_analytics`

**Data:** `AnalyticsCubit` — API calls to analytics endpoints on the backend.

---

### 4.4 Products Management Page

**Purpose:** CRUD for all products in the catalogue.

**List view:**
- Searchable list of all products
- Each row: thumbnail image + product name + category + price + stock count + active/inactive badge
- "Add Product" floating action button

**Add/Edit Product form:**
- Product name (EN + AR)
- Category (dropdown, populated from `AdminCubit.categories`)
- Price (number input)
- Discounted price (optional number input)
- Currency (AED or SAR)
- Description (EN + AR)
- Subtitle (EN + AR)
- Stock quantity
- Product images (multi-image upload via `UploadDatasource`)
- Product descriptions (list of blocks, each: title EN + title AR + body EN + body AR)
- Product options (list of option groups: option name EN + AR + list of values)

**Backend flow:**
- Create: `CreateProductUseCase` → `POST /admin/products`
- Update: `UpdateProductUseCase` → `PUT /admin/products/:id`
- Delete: `DeleteProductUseCase` → `DELETE /admin/products/:id` (soft delete or hard delete)
- List: `GetProductsUseCase` → `GET /admin/products`

**After any mutation:** `AdminCubit` state is updated so the home tab's product sections reflect the change immediately.

**Permissions:** `manage_products`

---

### 4.5 Categories Management Page

**Purpose:** CRUD for product categories.

**List view:** Category name (EN + AR) + product count + action buttons (edit / delete)

**Add/Edit Category form:**
- Category name EN
- Category name AR
- Description EN (optional)
- Description AR (optional)

**Backend flow:**
- Create: `CreateCategoryUseCase` → `POST /admin/categories`
- Update: `UpdateCategoryUseCase` → `PUT /admin/categories/:id`
- Delete: `DeleteCategoryUseCase` → `DELETE /admin/categories/:id`
- List: `GetCategoriesUseCase` → `GET /admin/categories`

**Constraint:** Deleting a category with active products requires confirmation and handling of orphaned products.

**Permissions:** `manage_categories`

---

### 4.6 Banners Management Page

**Purpose:** Manage the promotional banners shown in the home tab carousel.

**List view:** Banner image thumbnail + title + subtitle + order index + edit/delete actions

**Reordering:** Drag-and-drop list reorder → `ReorderBannersUseCase` → `PUT /admin/banners/reorder`

**Add/Edit Banner form:**
- Banner title (shown as overlay text on the banner image)
- Subtitle
- Background image upload
- Placeholder color (fallback when no image — options: warm/rose/blue)

**Backend flow:**
- Create: `CreateBannerUseCase` → `POST /admin/banners`
- Update: `UpdateBannerUseCase` → `PUT /admin/banners/:id`
- Delete: `DeleteBannerUseCase` → `DELETE /admin/banners/:id`
- Reorder: `ReorderBannersUseCase` → `PUT /admin/banners/reorder`
- List: `GetBannersUseCase` → `GET /admin/banners`

**Permissions:** `manage_banners`

---

### 4.7 Sections Management Page

**Purpose:** Manage the homepage product sections — each section is a titled row of products in the home tab.

**List view:** Section title + display order + product count + active/inactive

**Reordering:** Drag-and-drop → `ReorderSectionsUseCase`

**Section Detail Page (`AdminSectionDetailPage`):**
- Section title (EN + AR)
- Display order
- List of assigned products (with add/remove controls)
- Toggle active/inactive

**Backend flow:**
- Create: `CreateSectionUseCase`
- Update: `UpdateSectionUseCase`
- Delete: `DeleteSectionUseCase`
- Reorder: `ReorderSectionsUseCase`
- List: `GetSectionsUseCase`
- Detail: `GetSectionByIdUseCase`

**Permissions:** `manage_sections`

---

### 4.8 Orders Management Page

**Purpose:** View and manage all customer orders.

**List view:**
- Filterable by status (all / pending / confirmed / processing / shipped / delivered / cancelled)
- Each row: order ID + customer name + date + total + status badge
- Tap → `AdminOrderDetailPage`

**Order Detail Page:**
- Order header: ID, customer info, date, total
- Item list with product names, quantities, prices
- Delivery address
- Order message
- Promo code (if applied) + discount amount
- **Status update dropdown** — admin can transition the order status
- Status transition rules:
  - Pending → Confirmed → Processing → Shipped → Delivered
  - Any status → Cancelled (with optional reason)

**Backend flow:**
- List: `GetAdminOrdersUseCase` → `GET /admin/orders`
- Detail: `GetAdminOrderDetailUseCase` → `GET /admin/orders/:id`
- Status update: `UpdateOrderStatusUseCase` → `PUT /admin/orders/:id/status`

**Permissions:** `manage_orders`

---

### 4.9 Users Management Page

**Purpose:** View, create, edit, and manage all registered users.

**List view:**
- Search by name or email
- Filter by role (all / user / manager / admin) and status (active / suspended / banned)
- Each row: avatar + name + email + role badge + status badge + action buttons
- `GetUserStatsUseCase` shows aggregate stats: total users, new this month, active today

**User Detail Page (`AdminUserDetailPage`):**
- Full user profile (read-only)
- Role assignment: `UpdateUserRoleUseCase` → set to `user`, `manager`, or `admin`
- Status update: `UpdateUserStatusUseCase` → set to `active`, `suspended`, or `banned`
- Manager permissions: `GetManagerPermissionsUseCase` → shows available permissions; checkbox list to grant/revoke

**Create User:** `CreateUserUseCase` → admin can create accounts (useful for staff/manager onboarding)

**Delete User:** `DeleteUserUseCase` → hard delete (with confirmation dialog)

**Edit User:** `UpdateUserUseCase` → edit name, email, phone

**Permissions:** `manage_users`

---

### 4.10 Promo Codes Management Page

**Purpose:** CRUD for discount codes.

**List view:** Code string + discount value + type + active status + expiry date + usage count

**Add/Edit Promo Code form:**
- Code string (unique, e.g. "RAMADAN10")
- Name EN + AR
- Description EN + AR (shown to customers in the promo sheet)
- Discount type: Percentage or Fixed Amount
- Discount value (number)
- Applies to: All Products / Selected Products / Category
- Product IDs or Category IDs (multi-select, shown when `appliesTo` is not ALL)
- Minimum order amount
- Maximum discount cap (for percentage codes)
- Valid from date
- Valid until date
- Usage limit (total)
- Usage limit per user
- Active toggle

**Backend flow:** `AdminPromoCodesCubit` + `admin_promo_codes_usecases.dart`

**Permissions:** `manage_promo_codes`

---

### 4.11 Collaborations Management Page

**Purpose:** Manage brand collaboration entries shown in the home tab.

**Current state:** Data is mock (`CollaborationEntity.mock` — Netflix, Maserati, Gucci). The admin page exists (`AdminCollaborationsPage`) for future API integration.

**Fields (for future):** Brand name, brand logo image, collaboration category, link/action

---

### 4.12 Analytics Page (Detail)

Three distinct data views:

**KPI Dashboard:**
- Revenue (total, this month, last month)
- Order count
- Average order value
- New users this period
- Source: `GetKPIAnalyticsUseCase`

**Daily Sales:**
- Line chart, date range selectable (last 7 / 30 / 90 days, or custom range)
- Y-axis: revenue amount; X-axis: date
- Source: `GetDailySalesUseCase`

**Category Revenue:**
- Bar or pie chart showing revenue breakdown per category
- Useful for understanding which product categories drive the most sales
- Source: `GetCategoryRevenueUseCase`

---

## 5. Technical Architecture

### 5.1 Frontend Structure (Flutter)

```
lib/
├── main.dart                  → Re-exports main_development.dart
├── main_development.dart      → Firebase init + AppConfig(dev) + runApp
├── main_staging.dart          → Firebase init + AppConfig(staging) + runApp
├── main_production.dart       → Firebase init + AppConfig(prod) + runApp
├── app.dart                   → Root widget, MultiBlocProvider, MaterialApp, _AppShell
├── core/                      → Config, theme, constants, errors, services, utils
├── features/                  → One folder per feature (Clean Architecture)
│   ├── auth/
│   ├── location_selection/
│   ├── home/
│   ├── cart/
│   ├── orders/
│   ├── promo_codes/
│   ├── addresses/
│   ├── admin/
│   └── splash/                (stub)
├── shared/
│   └── widgets/               → AppButton, AppTextField, AppLoading, ProductImage, etc.
└── l10n/                      → ARB files + generated AppLocalizations
```

**Clean Architecture layers per feature:**
```
feature/
├── data/
│   ├── datasources/           → Dio HTTP calls, SecureStorage reads
│   ├── models/                → Extend entities, add JSON parsing
│   └── repositories/          → Implement domain interfaces, wrap in Either
├── domain/
│   ├── entities/              → Pure Dart, no framework deps
│   ├── repositories/          → Abstract interfaces
│   └── usecases/              → Single public method, return Either<Failure, T>
└── presentation/
    ├── bloc/ or cubit/        → State management
    ├── pages/
    └── widgets/               → Feature-specific reusable widgets
```

**State management:**
- `AuthBloc`: full BLoC (sealed events dispatched → sealed states emitted)
- All other features: `Cubit` (emit directly, no event classes)
- All states use Dart 3 sealed classes

**DI:** Currently manual inline construction in `app.dart`. GetIt + Injectable are declared in pubspec but not wired yet. All cubits and blocs receive their dependencies via constructor parameters in `MultiBlocProvider`.

**Navigation:** All navigation is `Navigator.push` / `Navigator.pushReplacement` / `Navigator.of(context, rootNavigator: true)`. GoRouter is declared but not yet implemented.

---

### 5.2 Backend API

**Base URL:** `https://amoonbloom-backend-production.up.railway.app/api/v1`

**All three flavors** (development, staging, production) currently point to the same backend. The same Railway-hosted backend serves all environments.

**Authentication header:** All authenticated endpoints require: `Authorization: Bearer <JWT_TOKEN>`

**Standard response envelope:**
```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

**Error response:**
```json
{
  "success": false,
  "message": "Human-readable error string"
}
```

**Key API endpoint groups:**

| Prefix | Purpose |
|---|---|
| `/auth/*` | Login, signup, social auth, password management |
| `/profile` | Get + update profile, phone, language, address, notification prefs |
| `/cart` | Cart CRUD, suggestions |
| `/orders` | Checkout, order history, order by ID |
| `/promo-codes` | Available codes, validate code |
| `/admin/products` | Admin product CRUD |
| `/admin/categories` | Admin category CRUD |
| `/admin/banners` | Admin banner CRUD + reorder |
| `/admin/sections` | Admin section CRUD + reorder |
| `/admin/orders` | Admin order list + detail + status update |
| `/admin/users` | Admin user CRUD + role + status |
| `/admin/analytics` | KPI, daily sales, category revenue |
| `/admin/promo-codes` | Admin promo code CRUD |
| `/notifications/push-token` | Register / unregister FCM token |

---

### 5.3 Authentication System

**JWT-based custom auth** with social auth as additional login methods:

1. **Email/password**: Standard username/password → server issues JWT
2. **Google**: Client gets Google `idToken` → `POST /auth/google-signin` → server verifies with Google and issues its own JWT
3. **Apple**: Client gets Apple `identityToken` → `POST /auth/apple-signin` → server verifies and issues JWT

**Token storage:**
- JWT token: `flutter_secure_storage` (encrypted on device)
- User profile fields: `SharedPreferences` via `SessionService` (18 fields for session restore on cold start)

**Session restore:** On cold start, `AuthBloc` reads from `SessionService`. If a user ID and token exist, it emits `AuthSessionRestored(user)` without making a network call. A fresh `GetProfileUseCase` call can optionally refresh the profile.

**Token refresh:** Not yet implemented. If the JWT expires, the next API call will receive a 401, which the repository catches and converts to `Left(AuthFailure())`, causing the BLoC to emit a failure state and the UI to prompt re-login.

---

### 5.4 Database Relationships (Conceptual)

```
User
 ├── has many Orders
 ├── has many Addresses
 ├── has many PushTokens
 └── has one NotificationPreferences

Order
 ├── belongs to User
 ├── belongs to Address (delivery)
 ├── has many OrderItems
 │    └── each belongs to Product
 └── may reference PromoCode

Cart
 ├── belongs to User
 ├── has many CartItems
 │    └── each belongs to Product
 └── has orderMessage

Product
 ├── belongs to Category
 ├── has many ProductImages
 ├── has many ProductDescriptions
 └── has many ProductOptions

Category
 └── has many Products

Banner
 (standalone, display order managed by backend)

Section
 ├── has display order
 └── has many Products (many-to-many through SectionProduct)

PromoCode
 ├── may target selected Products (many-to-many)
 └── may target selected Categories (many-to-many)

CollaborationEntity
 (standalone brand partner record)
```

---

### 5.5 Third-Party Integrations

| Integration | Package | Purpose |
|---|---|---|
| Firebase Core | `firebase_core` | App initialization |
| Firebase Auth | `firebase_auth` | Used internally by AuthRemoteDataSource alongside JWT |
| Firebase Messaging | `firebase_messaging` | Push notifications (FCM) |
| Google Sign-In | `google_sign_in` | Social auth for Android + Web |
| Sign In with Apple | `sign_in_with_apple` | Social auth for iOS |
| Dio | `dio` | HTTP client for all API calls |
| flutter_secure_storage | `flutter_secure_storage` | Encrypted JWT token storage |
| shared_preferences | `shared_preferences` | Session fields, location, settings |
| cached_network_image | `cached_network_image` | Product image caching + loading |
| image_picker | `image_picker` | Profile avatar and product image uploads |
| google_fonts | `google_fonts` | Poppins, Montserrat, Dancing Script |

---

### 5.6 Notification System

**Flow:**
1. On app start, Firebase Messaging is initialized with a background message handler
2. On user login, FCM token is fetched and `POST /notifications/push-token` (via `RegisterPushTokenUseCase`)
3. On logout, `DELETE /notifications/push-token` (via `UnregisterPushTokenUseCase`)
4. `PushTokenManager` listens for FCM token refresh events and re-registers automatically
5. `NotificationHandler` processes `onMessage` (foreground) and `onMessageOpenedApp` (background tap) events and routes to the appropriate screen

**Notification categories:**
- `orderStatus` — triggered by backend on order status changes
- `promotions` — triggered by admin-initiated campaigns
- `announcements` — triggered by admin announcements

**User control:** Users can toggle each category in Profile → Notification Preferences

---

### 5.7 Cloud Storage

Images (product photos, banner images, user avatars) are uploaded via `UploadDatasource` using Dio multipart form requests to the backend. The backend handles storage to its cloud provider (Railway / external object storage). URLs returned by the backend are stored in the product/banner/user records and fetched via `cached_network_image` on the client.

---

### 5.8 Payment Gateway

**Current state:** The checkout flow has the infrastructure (multi-step `CheckoutPage`, `CheckoutUseCase`) but specific payment gateway integration is TBD. The order endpoint accepts payment details as part of the checkout payload.

**Planned integration:** A payment gateway appropriate for GCC (e.g., Tap Payments, HyperPay, or Stripe with GCC support) would be integrated at the payment step of `CheckoutPage`.

---

### 5.9 Security Considerations

- All API calls use HTTPS
- JWT tokens stored in `flutter_secure_storage` (not SharedPreferences)
- Sensitive operations (delete account, change password) require re-authentication confirmation
- Admin routes are protected by role check on the backend — even if the client navigates to an admin page, API calls will fail without the admin role
- `managerPermissions` are enforced both in the UI (page access gating) and on the backend (API authorization)
- Firebase tokens are unregistered on logout to prevent ghost push notifications

---

## 6. Web App Requirements

### 6.1 Overview

A web application companion to the mobile app is being designed and developed. It must serve two purposes:

1. **Customer-facing web storefront** — fully functional e-commerce site mirroring the mobile app experience
2. **Admin panel** — either the same web app with role-based routing, or a dedicated admin subdomain

### 6.2 Technology Recommendations

The web app should use a modern React.js framework (Next.js recommended for SSR/SEO) with:
- Tailwind CSS for styling with the same token values as the mobile app
- React Query or SWR for API state management
- The same backend API (`/api/v1`) — no new backend needed

### 6.3 Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile (< 768px) | Single column, bottom navigation (mirrors app) |
| Tablet (768–1024px) | 2-column grid, sidebar or top navigation |
| Desktop (> 1024px) | 3-column grid for products, full navigation bar, sidebar for admin |

### 6.4 Customer-Facing Pages

| Page | Route | Description |
|---|---|---|
| Home | `/` | Hero banner carousel + category sections + collaboration section |
| Shop | `/shop` | Filterable product grid with search |
| Product Detail | `/products/:id` | Full product page with gallery, options, add to cart |
| Cart | `/cart` | Cart review + promo code + order summary |
| Checkout | `/checkout` | Multi-step: address → payment → confirm |
| Order Confirmation | `/orders/:id/confirmation` | Post-checkout thank-you screen |
| Order History | `/account/orders` | Logged-in user's order list |
| Order Detail | `/account/orders/:id` | Order status + items + tracking |
| Wishlist | `/account/wishlist` | Saved products |
| Profile | `/account/profile` | Edit profile, change password, addresses |
| Addresses | `/account/addresses` | Manage saved addresses |
| Login | `/login` | Login form + social sign-in |
| Signup | `/signup` | Registration form |
| Forgot Password | `/forgot-password` | Email reset form |

### 6.5 Admin Panel Pages (Web)

| Page | Route | Description |
|---|---|---|
| Admin Dashboard | `/admin` | KPI cards + quick links + recent orders |
| Analytics | `/admin/analytics` | Charts: daily sales, category revenue |
| Products | `/admin/products` | Product list + CRUD |
| Categories | `/admin/categories` | Category list + CRUD |
| Banners | `/admin/banners` | Banner list + reorder + CRUD |
| Sections | `/admin/sections` | Section list + reorder + CRUD |
| Orders | `/admin/orders` | Order list + status management |
| Order Detail | `/admin/orders/:id` | Full order detail + status update |
| Users | `/admin/users` | User list + role/status management |
| User Detail | `/admin/users/:id` | User profile + permissions |
| Promo Codes | `/admin/promo-codes` | Promo code CRUD |
| Collaborations | `/admin/collaborations` | Collaboration partner management |

### 6.6 Navigation Structure (Web Customer)

**Desktop header:**
- Logo (left)
- Nav links: Home | Shop | [category names]
- Search icon
- Language toggle (EN/AR)
- Location display "Deliver To: [City]" with change option
- Wishlist icon (heart) with count
- Cart icon with count
- Profile icon / "Sign In" link

**Mobile web header:**
- Logo (center)
- Hamburger menu (left)
- Cart icon with count (right)

**Footer:**
- Brand logo + tagline
- Links: About, Contact, Privacy Policy, Terms, Refund Policy
- Social follow links
- Currency/language selector
- © Amoon Bloom

### 6.7 SEO Considerations

- Product pages: server-side rendered with product `name`, `description`, and `primaryImage` in meta tags
- Category pages: crawlable product grid
- OpenGraph tags for social sharing (product name, image, price)
- sitemap.xml auto-generated from product and category data
- Arabic content: use `hreflang="ar"` alternate tags
- URL slugs: `/products/12-roses-bouquet` (human-readable, based on product name)

### 6.8 Authentication (Web)

- JWT stored in an httpOnly cookie (more secure than localStorage for web)
- Google Sign-In via `@react-oauth/google` or Firebase Auth JS SDK
- Apple Sign-In via Firebase Auth JS SDK
- Same `/api/v1/auth/*` endpoints as the mobile app

### 6.9 Cart Behavior (Web)

- Guest cart: stored in `localStorage` as a JSON array
- On login: guest cart merged with server cart via `POST /cart` for each item
- Same promo code validation flow via `POST /promo-codes/validate`

### 6.10 Performance Requirements

- Lighthouse Performance score: ≥ 80 on mobile
- Product images: served in WebP format, lazy-loaded below the fold
- Initial page load: < 3 seconds on a 4G connection
- API calls: SWR caching to avoid redundant fetches

---

## 7. Screen-by-Screen Breakdown

### Screen 1: Native Splash Screen

| Attribute | Detail |
|---|---|
| **Purpose** | Brand impression during cold start initialization |
| **UI** | Black background, centered Amoon Bloom logo |
| **Duration** | Until Flutter first frame renders |
| **Backend** | None |
| **States** | Single static state |
| **Edge cases** | Slow Firebase init: splash holds; max ~3s |

---

### Screen 2: Country Selection Page

| Attribute | Detail |
|---|---|
| **Purpose** | Capture delivery country for currency and delivery scope |
| **UI components** | Brand logo, headline, 2 country cards, language toggle, Continue button |
| **User actions** | Tap country card, tap language toggle, tap Continue |
| **Validation** | Continue disabled until selection made |
| **Backend** | None (static data) |
| **On success** | Navigate to City Selection |
| **States** | `initial`, `countrySelected` (local UI state) |

---

### Screen 3: City Selection Page

| Attribute | Detail |
|---|---|
| **Purpose** | Capture delivery city |
| **UI components** | App bar, city list with radio indicators, Continue button |
| **User actions** | Tap city row, tap Continue |
| **Validation** | Continue disabled until selection made |
| **Backend** | `LocationService.saveLocation()` on completion |
| **On success** | `Navigator.pushReplacement → HomePage` |
| **States** | `initial`, `citySelected` (local UI state) |

---

### Screen 4: Home Page (4-tab shell)

| Attribute | Detail |
|---|---|
| **Purpose** | Root of customer experience |
| **UI components** | `IndexedStack`, bottom nav bar, 4 nested navigators |
| **Shared state** | `BagCubit`, `AdminCubit`, `WishlistCubit`, `AuthBloc` |
| **Loading states** | Each tab section shows `AppLoading` while `AdminCubit` loads |
| **Error states** | Silent retry on API failure; mock data shown if API unreachable |

---

### Screen 5: Product Detail Page

| Attribute | Detail |
|---|---|
| **Purpose** | Full product information + add to bag |
| **UI components** | `PageView` gallery, dots, product info, option selectors, quantity picker, Add to Bag button |
| **Required data** | `ProductEntity` (passed as constructor arg) |
| **Actions** | Swipe gallery, select option, change quantity, add to bag, wishlist toggle |
| **On "Add to Bag"** | `BagCubit.addToBag(product, quantity)` → animated confirmation sheet |
| **Edge cases** | stock = 0 → button disabled; stock = null → no limit enforced |
| **Backend** | None on this page (product data already in AdminCubit) |

---

### Screen 6: Login Page

| Attribute | Detail |
|---|---|
| **Purpose** | Authenticate user |
| **UI components** | Logo, AuthFormField (email), AuthFormField (password), Sign In button, Forgot Password link, Google/Apple buttons, Sign Up link |
| **Validation** | Email format, password non-empty |
| **Loading state** | `AuthLoading` → buttons disabled, spinner on Sign In button |
| **Success state** | `AuthLoginSuccess` → navigator replaces to Home or Admin |
| **Error state** | `AuthFailureState` → SnackBar with error message |
| **Cancelled** | `CancelledFailure` → neutral "Sign-in cancelled" |

---

### Screen 7: Signup Page

| Attribute | Detail |
|---|---|
| **Purpose** | Create new account |
| **UI components** | Full name, email, password, confirm password fields, Create Account button, Sign In link |
| **Validation** | All fields non-empty; email format valid; confirm password matches |
| **Loading** | `AuthLoading` |
| **Success** | `AuthSignupSuccess` → same routing as login |
| **Error** | `AuthFailureState` (email taken, server error) |

---

### Screen 8: Forgot Password Page

| Attribute | Detail |
|---|---|
| **Purpose** | Trigger password reset email |
| **UI components** | Email field, Send button |
| **Success state** | Confirmation message shown inline |
| **Error state** | Email not found, network error |
| **Backend** | `POST /auth/forgot-password` |

---

### Screen 9: Bag Page (Cart Tab)

| Attribute | Detail |
|---|---|
| **Purpose** | Review cart, apply promo, proceed to checkout |
| **UI components** | Cart item rows (image + name + quantity controls + item message), order message field, promo code link, order summary, Checkout button |
| **Empty state** | Illustration + "Your bag is empty" + Continue Shopping ghost button |
| **Auth gate** | Checkout button prompts login if not authenticated |
| **Promo code** | Opens `PromoCodesSheet`; discount shown in summary once applied |
| **Required state** | `BagCubit.state` (List<BagItemEntity>) |
| **Sync trigger** | `CartCubit.getCart()` called on login to sync local bag with server |

---

### Screen 10: Checkout Page

| Attribute | Detail |
|---|---|
| **Purpose** | Capture delivery address, confirm order |
| **Steps** | Address selection → Payment → Summary → Confirmation |
| **Step 1 state** | `AddressesCubit.state` (list of saved addresses) |
| **Step 3 backend** | `CheckoutUseCase` → `POST /orders` |
| **Success** | `OrderSuccess(order)` → confirmation step |
| **Error** | `OrderError(message)` → error message at summary step |
| **Post-success** | `BagCubit.clear()`, `CartCubit` state cleared |

---

### Screen 11: Order History Page

| Attribute | Detail |
|---|---|
| **Purpose** | Browse past orders |
| **Backend** | `GetOrderHistoryUseCase` → `GET /orders` |
| **States** | Loading, list (non-empty), empty state |
| **Item tap** | Navigate to `CustomerOrderDetailPage` |

---

### Screen 12: Admin Dashboard Page

| Attribute | Detail |
|---|---|
| **Purpose** | Business health overview |
| **Backend** | `GetKPIAnalyticsUseCase`, `GetDailySalesUseCase`, `GetAdminOrdersUseCase` |
| **Auth requirement** | `user.isAdmin || user.isManager` |
| **Components** | KPI cards, sales chart, recent orders list, quick nav tiles |

---

## 8. User Roles & Permissions

### 8.1 Role Definitions

| Role | Set by | Access level |
|---|---|---|
| **Guest** | Default (no auth) | Browse products, add to local bag, view home |
| **Customer** | Self-registration or admin creation | All guest access + checkout, order history, wishlist, profile, saved addresses |
| **Manager** | Assigned by Admin | Admin panel access gated by `managerPermissions` list |
| **Admin** | Assigned by Super Admin or set in backend | Full admin panel access |

### 8.2 Guest Access

- Country/city selection
- Browse home feed, shop, product details
- Add to local `BagCubit` (not synced to server)
- View static pages (policies, contact, social)
- **Cannot:** checkout, view order history, save addresses, access wishlist (server-side), access admin

### 8.3 Customer Access

Everything a guest can do, plus:
- Checkout (server cart + orders)
- Order history and detail
- Wishlist (currently local/in-memory)
- Profile management (name, photo, phone, language)
- Saved addresses (CRUD)
- Notification preferences
- Change password
- Delete account

### 8.4 Manager Access

Managers are staff members given a subset of admin capabilities. Their access is controlled by `managerPermissions` (a list of permission keywords stored in the user record).

**Available permission keywords:**

| Keyword | Grants access to |
|---|---|
| `manage_products` | AdminProductsPage (full CRUD) |
| `manage_categories` | AdminCategoriesPage (full CRUD) |
| `manage_banners` | AdminBannersPage (full CRUD + reorder) |
| `manage_sections` | AdminSectionsPage (full CRUD + reorder) |
| `manage_orders` | AdminOrdersPage, AdminOrderDetailPage, status updates |
| `manage_users` | AdminUsersPage, AdminUserDetailPage (view + edit) |
| `manage_promo_codes` | AdminPromoCodesPage (full CRUD) |
| `view_analytics` | AdminAnalyticsPage (read-only) |

`user.hasPermission(keyword)` checks if the keyword appears anywhere in the `managerPermissions` list (case-insensitive substring match).

**Admin panel menu:** Only shows menu items the manager has permission for. If a manager has no permissions, they see only the Dashboard overview.

### 8.5 Admin Access

Full access to all admin pages and all API endpoints. `user.isAdmin` returns true, `user.hasPermission()` always returns true for all keywords.

### 8.6 Access Enforcement

- **Client-side:** `AdminDashboard` only shows nav items where `user.hasPermission(keyword)` is true
- **Server-side:** Backend validates the JWT role on every admin endpoint — client-side gating is a UX convenience, not a security boundary

---

## 9. End-to-End Journey Examples

### Journey 1: New Customer First Purchase

```
1. Opens app for first time
   → Sees native splash (black + logo)

2. Lands on Country Selection
   → Taps "United Arab Emirates 🇦🇪"
   → Taps "Continue"

3. City Selection
   → Taps "Dubai"
   → Taps "Continue"
   → Lands on HomePage (Home tab)

4. Browses Home tab
   → Sees banner carousel (Ramadan Collection, New Arrivals, Luxury Gifts)
   → Sees product sections: Flowers, Newborn Gifts, Makeup & Care
   → Taps a "12 Roses Bouquet" card in the Flowers section

5. Product Detail Page
   → Swipes through 2 product images
   → Reads description
   → Selects quantity: 2
   → Taps "Add to Bag"
   → Sees animated bottom sheet: "Added to Bag ✓"
   → Taps "Go to Bag" in the sheet → switches to Bag tab

6. Bag Tab
   → Sees: 12 Roses Bouquet ×2 = AED X
   → Sees: Order Summary (subtotal + Free delivery + Total)
   → Types "Happy Birthday my love!" in Order Message field
   → Taps "Proceed to Checkout"
   → Prompted to log in (not authenticated)

7. Login Page
   → Taps "Don't have an account? Sign Up"

8. Signup Page
   → Fills: Full Name = "Sarah Al Mansouri", email, password
   → Taps "Create Account"
   → Account created → AuthSignupSuccess → back to Home tab
   → Cart synced with server (BagCubit items added to server CartCubit)

9. Bag Tab (now logged in)
   → Bag still shows the 2 roses (synced from BagCubit)
   → Taps "Proceed to Checkout"

10. Checkout — Step 1 (Address)
    → No saved addresses yet
    → Taps "Add new address"
    → Fills: Full Name: Sarah, Phone: +971xxxxxxx, Street: Sheikh Zayed Rd, City: Dubai, Country: UAE
    → Saves address → pre-selected
    → Taps "Continue"

11. Checkout — Step 2 (Payment)
    → Selects "Cash on Delivery"
    → Taps "Continue"

12. Checkout — Step 3 (Summary)
    → Reviews: 2× Roses, delivery address, AED total, message
    → Taps "Place Order"

13. Order Confirmation
    → "Order Placed! 🎉" Order ID: #ORD-00142
    → Taps "Continue Shopping" → returns to Home tab

14. Later: receives push notification "Your order has been confirmed"
    → Taps notification → opens CustomerOrderDetailPage for #ORD-00142
```

---

### Journey 2: Returning Customer with Promo Code

```
1. Opens app → persisted session → lands directly on HomePage

2. Browses Shop tab → searches "acrylic box" → finds "Acrylic Box for Girls"

3. Product Detail → adds 1 to bag

4. Goes to Bag tab
   → Sees item + AED total
   → Taps "Have a promo code?" 

5. Promo Codes Sheet
   → Sees available code: "WELCOME20 — 20% off"
   → Taps it → auto-filled in the input field
   → Taps "Apply"
   → Backend validates: 20% discount applied, maximum AED 50 cap
   → Sheet closes, bag shows:
       Subtotal:   AED 180
       Discount:  -AED 36 (WELCOME20)
       Total:      AED 144

6. Proceeds to checkout → uses saved Dubai address
   → Places order → receives confirmation
```

---

### Journey 3: Admin Adds New Seasonal Product

```
1. Admin opens app → persisted admin session → AdminDashboardPage

2. Taps "Products" from dashboard tiles → AdminProductsPage

3. Taps "+" FAB → Add Product form

4. Fills:
   - Name EN: "Eid Gift Box 2026"
   - Name AR: "صندوق هدايا العيد 2026"
   - Category: Distributions
   - Price: 299 SAR
   - Discounted price: 249 SAR
   - Description EN: "A luxurious assortment of Eid gifts..."
   - Description AR: "..."
   - Stock: 50
   - Uploads 3 product images
   
5. Taps "Save" → CreateProductUseCase → POST /admin/products
   → AdminCubit state updates with new product
   
6. Goes to Sections → selects "Featured This Week" section
   → Adds the new Eid Gift Box to the section
   
7. Goes to Banners → creates a new banner:
   - Title: "EID COLLECTION 2026"
   - Subtitle: "Shop Our Limited Edition Gifts"
   - Uploads a banner image
   
8. Opens the app as a regular user (or asks a tester)
   → Home tab shows the new Eid banner in the carousel
   → Featured This Week section shows the new Eid Gift Box
```

---

### Journey 4: Admin Updates Order Status

```
1. Admin at AdminDashboardPage → sees "Recent Orders" widget
   → Spots Order #ORD-00150 with status "Pending"

2. Taps order → AdminOrderDetailPage for #ORD-00150
   → Sees: 1× Baby Playtime Box, Dubai delivery, AED 350, message "For my nephew!"

3. Changes status dropdown from "Pending" to "Confirmed"
   → UpdateOrderStatusUseCase → PUT /admin/orders/ORD-00150/status
   → Backend sends push notification to customer: "Your order has been confirmed"
   → Status badge on the page updates to blue "Confirmed"

4. Next day: order is shipped
   → Returns to order detail → changes to "Shipped"
   → Customer receives "Your order is on its way" push notification
```

---

## 10. Development Notes

### 10.1 Critical Business Rules

1. **Currency is set by location, not user preference.** UAE → AED, Saudi Arabia → SAR. If `LocationCubit` state changes, all price displays must update. Use `context.currency` extension.

2. **The backend computes promo discounts — never recalculate on the client.** Use `PromoValidationEntity.discountAmount` and `PromoValidationEntity.total` verbatim from the API response.

3. **AdminCubit is the single source of truth for home data.** Never create a separate product list or category list for the home tab. All mutations must go through `AdminCubit`.

4. **BagCubit (local) is always the UI truth; CartCubit (server) is persistence.** On login, sync from BagCubit to server via CartCubit. After sync, CartCubit state is reflected back into BagCubit via `loadFromCart()`.

5. **Admin/Manager routing is determined at login, not on each navigation.** The initial routing decision (`_buildInitialPage`) is made once on cold start. Re-routing after login is handled by the `_AppShell` `AuthBloc` listener.

6. **`managerPermissions` are checked client-side for UX only.** The backend must enforce authorization on every admin API endpoint independently.

7. **Language switching resets the navigator stack.** Design all flows to be resumable from the start — do not rely on page state surviving a language switch.

---

### 10.2 Priority Modules for Web Development

Build in this order:

1. **Authentication** (login, signup, session management) — everything depends on this
2. **Product browsing** (home, shop, product detail) — highest traffic, SEO-critical
3. **Cart + Promo codes** — core conversion funnel
4. **Checkout + Addresses** — completes the purchase flow
5. **Admin Panel** — internal tool, can be phased
6. **Order history + Profile** — post-purchase experience
7. **Wishlist + Notifications** — nice-to-have, lower urgency

---

### 10.3 Features That Must Match Mobile App Experience

| Feature | Requirement |
|---|---|
| Banner carousel | Auto-scrolling with dot indicators; same content from API |
| Language toggle | Seamless EN↔AR switch; full RTL layout in Arabic |
| Product cards | Image-first; price with discount strikethrough when `hasDiscount` is true |
| Promo code flow | Backend validates, never re-derive discounts client-side |
| Add to cart | Immediate optimistic update; server sync happens in background |
| Checkout stepper | Visualize the 4 steps with a `CheckoutStepper`-equivalent component |
| Order status badges | Same color coding (pending/confirmed/processing/shipped/delivered/cancelled) |
| Admin permission gates | Hide inaccessible admin menu items for managers |

---

### 10.4 Important UI/UX Expectations

- **No raw hex color values** in any component — always use design tokens from the palette defined in §2.2
- **All user-facing strings must be translated** — English and Arabic must be maintained in parallel
- **Product images must always have aspect-ratio preservation** — use object-fit: cover inside fixed containers; never stretch
- **Loading states must be visible** — never show an empty container while fetching; show a spinner or skeleton
- **Empty states must be meaningful** — every list/grid has a designed empty state (illustration + message + optional action)
- **Errors must be human-friendly** — show the `message` from the API response, not raw status codes
- **RTL layout is non-negotiable for Arabic** — all flex direction, text alignment, icons, and padding must invert

---

### 10.5 Future Scalability Notes

- **GetIt + Injectable DI** is declared but not wired. Future refactor should implement `lib/core/di/injection.dart` to clean up the manual `MultiBlocProvider` construction in `app.dart`
- **GoRouter** is declared. Future navigation refactor should replace all `Navigator.push` calls with declarative GoRouter routes, enabling deep linking and web URL routing
- **Wishlist persistence** is currently in-memory. Future work: sync wishlist to a backend endpoint (e.g., `POST /wishlist/items`)
- **Splash feature** (`lib/features/splash/`) is a stub. Future: add a proper animated splash with branding transitions before onboarding
- **Payment gateway** integration is pending. The `CheckoutPage` step 2 UI placeholder must be replaced with a gateway SDK (Tap Payments or equivalent) when chosen
- **Reviews/ratings** are not yet implemented but are a natural next feature — the `ProductEntity` has no review count yet; this would require new API endpoints and a reviews feature module

---

*This document reflects the project state as of May 2026. Update it when significant features are added, APIs change, or business rules are revised.*
