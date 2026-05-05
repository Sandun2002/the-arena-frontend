<div align="center">

# 🏟️ The Arena — Frontend

**Production-grade sports venue booking platform for Sri Lanka**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)

*Discover and book premium sports courts — cricket grounds, futsal arenas, badminton courts, and more — all from one platform.*

**Live:** [thearena.lk](https://thearena.lk) · **API:** [api.thearena.lk](https://api.thearena.lk)

</div>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Feature Breakdown](#4-feature-breakdown)
   - [Authentication & Account Security](#41-authentication--account-security)
   - [Venue Discovery & Search](#42-venue-discovery--search)
   - [Booking Flow & Payments](#43-booking-flow--payments)
   - [Venue Owner Dashboard](#44-venue-owner-dashboard)
   - [Player Dashboard & Gamification](#45-player-dashboard--gamification)
   - [Real-Time Notifications](#46-real-time-notifications)
   - [PWA & Mobile Experience](#47-pwa--mobile-experience)
5. [Security & Infrastructure](#5-security--infrastructure)
   - [HTTP Security Headers](#51-http-security-headers)
   - [Authentication Security Architecture](#52-authentication-security-architecture)
   - [API Client Design](#53-api-client-design)
   - [Infrastructure & Deployment](#54-infrastructure--deployment)
6. [SEO & Performance](#6-seo--performance)
7. [Project Structure](#7-project-structure)
8. [API Reference (Frontend Services)](#8-api-reference-frontend-services)
9. [Gamification System](#9-gamification-system)
10. [Getting Started (Local Development)](#10-getting-started-local-development)
11. [Environment Variables](#11-environment-variables)
12. [Design Philosophy](#12-design-philosophy)

---

## 1. Project Overview

**The Arena** is a full-stack, production-deployed sports venue booking platform serving Sri Lanka. It connects players looking to book sports courts with venue owners and managers who want to monetise their facilities. The platform supports 10+ sports, real-time availability, online card and cash payments, and an XP-based gamification engine that rewards active players.

**Business roles supported:**
| Role | What they do |
|---|---|
| `customer` | Browse venues, book courts, earn XP, leave reviews |
| `venue_owner` | Full venue CRUD, analytics, revenue management |
| `venue_manager` | Operational access (bookings, schedules) delegated by owner |
| `admin` | Platform-wide moderation and curation (backend only) |

**Sports covered:** Badminton · Basketball · Cricket · Futsal · Pickleball · Pool · Squash · Swimming · Table Tennis · Tennis

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser / PWA)                        │
│                                                                      │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                  Next.js 16 App Router                     │    │
│   │                                                            │    │
│   │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│   │  │  Public Pages │  │  Player Pages│  │  Venue Dashboard│  │    │
│   │  │  /            │  │  /profile    │  │  /venue-dashboard│  │    │
│   │  │  /venues      │  │  /bookings   │  │  /analytics    │  │    │
│   │  │  /venues/[id] │  │  /challenges │  │  /booking-mgr  │  │    │
│   │  │  /search      │  │  /settings   │  │  /courts       │  │    │
│   │  └──────────────┘  └──────────────┘  └────────────────┘  │    │
│   │                                                            │    │
│   │  ┌──────────────────────────────────────────────────────┐ │    │
│   │  │                  Shared Contexts                      │ │    │
│   │  │  AuthContext · ThemeContext · NotificationContext     │ │    │
│   │  │  LocationContext · VenueContext · ToastContext        │ │    │
│   │  └──────────────────────────────────────────────────────┘ │    │
│   │                                                            │    │
│   │  ┌──────────────────────────────────────────────────────┐ │    │
│   │  │              Service Layer (Axios)                    │ │    │
│   │  │  authService · bookingService · venueApiService       │ │    │
│   │  │  centerService · playerService · notificationService  │ │    │
│   │  └──────────────────────────────────────────────────────┘ │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│   ┌─────────────────────────────────────────────┐                   │
│   │           Next.js API Route (BFF)            │                   │
│   │    /api/resolve-maps-link  (proxy only)      │                   │
│   └─────────────────────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────────────┘
                              │  HTTPS
                              │  Bearer JWT (in-memory)
                              │  httpOnly Refresh Cookie
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend  (api.thearena.lk)                 │
│                                                                      │
│   /auth  ·  /venues  ·  /search  ·  /bookings  ·  /pricing          │
│   /player  ·  /center  ·  /sports  ·  /reviews  ·  /payments        │
│   /notifications  ·  /cash-bookings                                  │
│                                                                      │
│   ┌──────────────┐  ┌─────────────────┐  ┌──────────────────────┐  │
│   │  PostgreSQL   │  │     S3/Object   │  │  PayHere Payment     │  │
│   │  (main DB)    │  │     Storage     │  │  Gateway             │  │
│   └──────────────┘  └─────────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

Third-Party Integrations (Client-Side):
  • Google OAuth 2.0 (accounts.google.com)
  • Google Maps embed (maps.google.com)
  • Google Analytics 4 (G-7B9Q46QJR5)
  • PayHere checkout (www.payhere.lk / sandbox.payhere.lk)
  • Web Push VAPID (browser → backend)
```

### Data Flow: Booking Creation

```
Player selects slot
      │
      ▼
BookingWidget  ──────►  GET /venues/{id}/slots?target_date=...
(CourtFinderPanel)        (real-time availability)
      │
      ▼
/checkout?venue_id=...   POST /pricing/calculate
      │                    (subtotal + platform fee)
      ▼
User confirms            POST /bookings/
      │                    → booking_id + payment_pending status
      ▼
/checkout/{id}           POST /payments/checkout-data/{id}
      │                    → PayHere payload (signed hash)
      ▼
PayHere redirect         User completes card payment
      │
      ▼
/bookings/{id}/success   GET /bookings/{id}  (polling / redirect)
```

---

## 3. Tech Stack

### Core Framework & Language

| Library | Version | Purpose |
|---|---|---|
| **Next.js** | 16 | App Router, SSR/SSG, Image Optimisation, API Routes |
| **React** | 19 | UI rendering, Server & Client components |
| **TypeScript** | 5 | Static typing across the entire codebase |

### Styling

| Library | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | 4 | Utility-first CSS, custom design tokens |
| **clsx + tailwind-merge** | latest | Conditional class composition without conflicts |
| **Plus Jakarta Sans** | Google Font | Body & UI text — modern, premium feel |
| **Syne** | Google Font | Display headings — sharp, geometric, branded |

### Animation & UX

| Library | Version | Purpose |
|---|---|---|
| **GSAP + @gsap/react** | 3.14 | Complex entrance animations, scroll-triggered effects |
| **Lenis** | 1.3 | Buttery-smooth momentum scrolling |
| **Swiper** | 12 | Hero carousel and touch-enabled sliders |
| **Lordicon / lottie-web** | latest | Animated SVG/Lottie micro-icons |

### Forms & Validation

| Library | Version | Purpose |
|---|---|---|
| **react-hook-form** | 7 | Performant, uncontrolled form state |
| **zod** | 4 | Schema-first runtime validation with TypeScript inference |
| **@hookform/resolvers** | 5 | Bridge between zod and react-hook-form |

### Networking & Auth

| Library | Version | Purpose |
|---|---|---|
| **axios** | 1.13 | HTTP client with request/response interceptors |
| **@react-oauth/google** | 0.13 | Google One Tap & OAuth button |
| **date-fns** | 4 | Date formatting, distance-to-now, parsing |

### Icons

| Library | Version | Purpose |
|---|---|---|
| **@phosphor-icons/react** | 2 | Primary icon set (fill, duotone, regular, bold) |

---

## 4. Feature Breakdown

### 4.1 Authentication & Account Security

The authentication system is built with a dual-token strategy designed to eliminate client-side token exposure.

**Login Flows:**
- **Email + Password:** Standard form login via `POST /auth/login`. Returns a short-lived JWT access token (in-memory only) and sets an httpOnly refresh token cookie on the backend.
- **Google OAuth:** One-tap / OAuth button via `@react-oauth/google`. The Google `id_token` is exchanged server-side via `POST /auth/google`, which validates it and issues the same dual-token pair.

**Session Persistence (Silent Refresh):**
- On every app load, the `AuthContext` calls `authService.silentRefresh()` which hits `POST /auth/cookie-refresh`.
- The browser automatically sends the httpOnly cookie — no JavaScript access to the refresh token.
- On success, a new access token is stored in-memory and the user is considered logged in.

**Two-Factor Authentication (TOTP):**
- Setup: `POST /auth/mfa/setup` returns a QR code (base64 PNG) and provisioning URI. User scans with any TOTP app (Google Authenticator, Authy).
- Confirm: `POST /auth/mfa/confirm` validates the 6-digit code and returns a set of one-time recovery codes.
- Disable: Password-confirmed via `POST /auth/mfa/disable` — also revokes all other active sessions.

**Session Management:**
- Users can view all active sessions (with device/browser info and creation time) via `GET /auth/sessions`.
- "Sign Out All Devices" revokes every refresh token server-side via `POST /auth/logout` with `{ all_devices: true }`.

**Email Verification & Password Reset:**
- Standard email-based verification flow on signup.
- Forgot-password → email link → `POST /auth/reset-password` with token.

---

### 4.2 Venue Discovery & Search

**Home Page Sections:**
1. **Hero Carousel** — Admin-curated featured venues (`GET /venues/featured/list`), full-screen Swiper slides with GSAP entrance animations.
2. **Sport Explorer** — Horizontally scrollable sport-type grid fetched from `GET /sports`. Clicking a sport pre-fills the search filter.
3. **Featured / Trending Venues** — Booking-activity-weighted trending list (`GET /venues/trending/list`) with a 14-day time-decay score computed by the backend.
4. **Reviews Teaser** — Featured 5-star reviews sampled from `GET /reviews/featured`.
5. **Gamification Teaser** — XP tier showcase to encourage player engagement.
6. **PWA Install Guide** — Contextual instructions for adding the app to home screen (iOS/Android/Desktop).

**Search Page (`/search`):**

Supports the following filter parameters mapped to `GET /search/courts`:

| Filter | Description |
|---|---|
| `sport` | Sport type slug (e.g. `futsal`, `cricket`) |
| `city` | City name (auto-complete via `GET /search/cities`) |
| `date` | ISO date for availability check |
| `start_time` / `end_time` | Time window |
| `lat` / `lng` / `radius_km` | Geolocation proximity filter |
| `sort_by` | `nearest` · `price_low` · `price_high` |
| `page` / `page_size` | Pagination |

**Venue Detail Page (`/venues/[id]`):**
- Gallery grid (up to 3 images — cover + 2 secondaries).
- Full court listings with sport type, indoor/outdoor, hourly rate, peak rate.
- Player reviews with XP tier avatars.
- Embedded Google Maps (`iframe` with `geo_lat` / `geo_lng`).
- Sticky `BookingWidget` for slot selection.
- `VenueSchema` JSON-LD for `SportsActivityLocation` rich results.

---

### 4.3 Booking Flow & Payments

```
/venues/[id]  →  BookingWidget  →  /checkout  →  /checkout/[id]  →  PayHere  →  /bookings/[id]/success
```

**BookingWidget (real-time slot picker):**
- Fetches slots for the selected date and sport via `GET /venues/{id}/slots?target_date=...`.
- Renders a time grid with colour-coded slot status: `available` (green) · `booked` (grey) · `maintenance` (amber) · `recurring` (blue).
- Peak-hour slots are visually distinguished with a different rate label.
- Multi-slot selection calculates duration and price in real time.

**Checkout (`/checkout`):**
- Loads venue and court details.
- Calls `POST /pricing/calculate` with the selected `court_id`, `date`, and `time_slots` to get a live breakdown: subtotal + platform fee + total.
- Creates the booking via `POST /bookings/` which returns a `payment_pending` booking.
- **Backend 500 recovery:** If the backend crashes during response serialisation (known upstream bug), the service waits 500 ms and then fetches recent bookings to recover the created record — ensuring no booking is silently lost.

**Payment (`/checkout/[id]`):**
- Calls `POST /payments/checkout-data/{id}` to get a signed PayHere payload.
- Redirects the user to PayHere's hosted checkout page.
- PayHere POSTs to the backend `notify_url` to confirm payment out-of-band.
- The frontend polls or receives a redirect to `/bookings/[id]/success` or `/bookings/[id]/cancelled`.

**Payment Methods:**
- `card` — PayHere hosted checkout (Visa, Mastercard, Amex, etc.)
- `cash` — Book now, pay on arrival. Subject to no-show tracking and configurable cooldown/blacklist rules.

**Cash Booking Policy:**
- Each user has a `can_book_cash` flag, `cash_no_show_count`, and optional `cash_cooldown_until` / `cash_blacklisted_at`.
- Venue owners can set `max_unpaid_cash_bookings` per venue.

---

### 4.4 Venue Owner Dashboard

The venue dashboard (`/venue-dashboard/*`) is a fully-featured business management console, role-gated via `RequireAuth` + `RoleGate` components.

**Multi-Venue Support:**
- `VenueSwitcher` lets owners with multiple venues switch context.
- `VenueContext` propagates the selected `currentVenue` to all dashboard pages.

**Booking Manager (`/venue-dashboard/booking-manager`):**
- Day-view calendar with per-court timeline.
- Shows confirmed bookings, payment-pending slots, recurring blocks, and closures.
- Create manual bookings (walk-ins, phone bookings) via `POST /center/bookings/manual`.
- Confirm, cancel, mark paid, or flag no-shows on any booking.

**Bookings List (`/venue-dashboard/bookings`):**
- Paginated, searchable, filterable list of all bookings.
- Filter by date, status, search term.

**Analytics Suite:**

| Report | Endpoint | Metrics |
|---|---|---|
| **Revenue** | `GET /center/analytics/revenue` | Total revenue, trend %, daily/weekly/monthly bar chart |
| **Utilization** | `GET /center/analytics/utilization` | Occupancy %, booked hours, confirmed vs pending breakdown |
| **Fees & Payouts** | `GET /center/analytics/fees` | Platform fees, venue commission, net payout, pending payout |
| **Cancellations** | `GET /center/analytics/cancellations` | Cancellation rate, no-show count, lost revenue, rejection count |

Analytics are scoped to the selected venue and support `daily` / `weekly` / `monthly` period switching. Revenue and fee reports are restricted to `venue_owner` — managers see utilisation and cancellations only.

**Court Management (`/venue-dashboard/courts`):**
- Add / edit / delete courts (name, sport type, indoor/outdoor, hourly rate, peak rate, cover image).
- Upload court cover images.

**Recurring Bookings (`/venue-dashboard/recurring`):**
- Create weekly recurring blocks (e.g., every Monday 10:00–11:00).
- Pause, resume, or delete recurring blocks.
- Recurring blocks appear in the booking manager calendar.

**Closure Scheduling (`/venue-dashboard/closures`):**
- Mark specific dates as closed (public holidays, maintenance).
- Closures block all new bookings for that date and appear in the slot grid.

**Gallery (`/venue-dashboard/gallery`):**
- Upload venue photos.
- Delete gallery images.

**Settings (`/venue-dashboard/settings`):**
- Edit operating hours per day of week (open time, close time, or mark as closed).
- Configure peak hours (start/end time, applicable days).

**Manager Invitations (`/venue-dashboard/managers`):**
- Invite a user by email to become a `venue_manager`.
- View invitation status (pending / accepted / declined / expired / cancelled).
- Remove managers.

**Cash Reconciliation:**
- View pending cash bookings (players who booked "pay on arrival").
- Mark as collected or flag as no-show (which decrements the player's cash booking allowance).

---

### 4.5 Player Dashboard & Gamification

**Profile (`/profile`):**
- Edit full name, phone number, bio.
- Upload avatar image.
- View XP level and current tier frame.

**Bookings (`/bookings`):**
- Full booking history with status indicators.
- Cancel upcoming bookings with a reason.
- Trigger a venue review after completing a booking.

**Reviews (`/reviews`):**
- View all reviews written.
- Delete a review.

**Challenges (`/challenges`):**
- View all available and completed challenges.
- Challenges are categorised and progress-tracked:

| Category | Example Challenges |
|---|---|
| `weekly` | Book N courts this week |
| `explorer` | Play at N different venues / sports / cities |
| `loyalty` | Return to the same venue N times |
| `streak` | Book N weeks in a row |
| `timing` | Book during peak hours / off-peak / early morning / late night |
| `milestone` | Reach N total bookings / total hours played |

**XP & Tier System (8 Tiers):**

| Tier | XP Required | Visual |
|---|---|---|
| 🟫 Rookie | 0 | Bronze ring, dot ornaments |
| ⬜ Contender | 500 | Silver ring, compass ornaments |
| 🟩 Athlete | 1,200 | Green glowing ring, diamond ornaments |
| 🟨 Champion | 2,500 | Gold ring, hexagon badge, diamond ornaments |
| 🔴 Elite | 4,500 | Animated red/orange ring, flame accent, glow pulse |
| 🟣 Legend | 7,500 | Animated purple/blue ring, swords accent, star ornaments |
| 🌟 Icon | 12,000 | Animated gold/white ring, crown accent, star ornaments |
| 💠 Titan | 25,000 | Animated sky-blue ring, trident accent, radiant white glow |

Tiers 5–8 (Elite → Titan) use CSS keyframe animations (conic-gradient rotation + pulsing glow) defined in `globals.css`. All tier frames are rendered via the `TierFrame` component, which appears on profile avatars and review cards.

**Security Settings:**
- `/settings/mfa` — Setup/disable TOTP 2FA (QR code + recovery codes).
- `/settings/sessions` — View/revoke all active login sessions.
- `/settings/notifications` — Per-notification-type preferences (push, email, in-app).
- `/profile/password` — Change password (current password required).

---

### 4.6 Real-Time Notifications

The notification system supports three delivery channels per notification type:

| Channel | Mechanism |
|---|---|
| **In-App** | Pulled via `GET /notifications` (paginated feed), polled or triggered |
| **Push** | Web Push API + VAPID keys. Browser subscription stored via `POST /notifications/push/subscribe` |
| **Email** | Sent by the backend; preferences managed via `PUT /notifications/preferences` |

**Notification Bell (`NotificationBell`):**
- Shows unread count badge.
- Opens `NotificationPanel` — a slide-in feed filtered by `role_context` (player vs. business).
- Mark individual or all as read.
- Delete individual notifications.

**Push Subscription Flow:**
1. `PushPromptBanner` asks for permission.
2. Frontend calls `Notification.requestPermission()`, then `ServiceWorkerRegistration.pushManager.subscribe()`.
3. Subscription object (endpoint + p256dh + auth keys) is sent to `POST /notifications/push/subscribe`.
4. Backend uses VAPID to push payloads directly to the browser.

**Role Contexts:** Notifications are tagged `player` (booking confirmations, XP rewards) or `business` (new bookings, cancellations, cash reconciliations).

---

### 4.7 PWA & Mobile Experience

The Arena ships as a full Progressive Web App installable on iOS, Android, and desktop.

**Web App Manifest (`/manifest.ts`):**
```json
{
  "name": "The Arena | Premium Sports Booking",
  "short_name": "The Arena",
  "display": "standalone",
  "orientation": "portrait",
  "shortcuts": [
    { "name": "Book a Court", "url": "/venues" },
    { "name": "My Bookings",  "url": "/bookings" }
  ]
}
```

**Service Worker (`/public/sw.js`):**
- Handles Web Push message display.
- Registered via `PWARegister` component on mount.

**Mobile Layout:**
- `MobileBottomNav` — 4-tab navigation bar (Home, Search, Bookings, Profile).
- `MobileTopBar` — Contextual top bar with back navigation and title.
- `MobileMainWrapper` — Adds appropriate bottom padding so content clears the nav bar.
- PWA install instructions contextualised per platform (iOS share sheet vs. Android install prompt).

**Responsive Design:**
- All pages are mobile-first, tested from 375 px (iPhone SE) to 1440 px+.
- Sticky `BookingWidget` collapses to full-width on mobile.
- Venue detail gallery adapts from 1-column (mobile) to 4-column masonry (desktop).

---

## 5. Security & Infrastructure

### 5.1 HTTP Security Headers

All HTTP responses include a hardened security header set, configured in `next.config.ts`:

```
X-Frame-Options:          DENY
X-Content-Type-Options:   nosniff
Referrer-Policy:          strict-origin-when-cross-origin
Permissions-Policy:       camera=(), microphone=(), geolocation=(self)
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Content Security Policy (CSP):**

| Directive | Allowed Sources |
|---|---|
| `default-src` | `'self'` |
| `script-src` | `'self'`, `'unsafe-inline'`, `'unsafe-eval'`, Google (accounts, analytics, gtm), PayHere |
| `style-src` | `'self'`, `'unsafe-inline'`, Google Fonts |
| `font-src` | `'self'`, Google Fonts CDN |
| `img-src` | `'self'`, `data:`, `blob:`, `https:` |
| `connect-src` | `'self'`, api.thearena.lk, localhost:8000, Google APIs, PayHere, Google Analytics |
| `frame-src` | Google accounts/maps, PayHere |
| `frame-ancestors` | `'none'` (equivalent to `X-Frame-Options: DENY`) |
| `worker-src` | `'self'` (service worker) |
| `form-action` | `'self'` |
| `base-uri` | `'self'` |

> **Note:** `'unsafe-inline'` and `'unsafe-eval'` in `script-src` are required by Next.js's inline hydration script and GSAP. The FOUC-prevention theme bootstrap script also runs inline. These are common trade-offs in Next.js applications.

---

### 5.2 Authentication Security Architecture

```
┌──────────────────┐        ┌─────────────────────────────────────────┐
│    Browser       │        │           Backend (FastAPI)              │
│                  │        │                                          │
│  In-Memory       │        │  ┌──────────────────────────────────┐   │
│  Access Token    │◄───────┤  │  POST /auth/login                │   │
│  (JS variable,   │        │  │  POST /auth/google               │   │
│   never stored   │        │  │  POST /auth/cookie-refresh       │   │
│   in localStorage│        │  └──────────────────────────────────┘   │
│   or cookies)    │        │                                          │
│                  │        │  ┌──────────────────────────────────┐   │
│  httpOnly Cookie │◄───────┤  │  Set-Cookie: refresh_token       │   │
│  (Refresh Token) │        │  │  HttpOnly; Secure; SameSite=Lax  │   │
│  NOT accessible  │───────►│  │  (sent automatically by browser  │   │
│  from JavaScript │        │  │   on cookie-refresh endpoint)    │   │
│                  │        │  └──────────────────────────────────┘   │
└──────────────────┘        └─────────────────────────────────────────┘
```

**Why in-memory access tokens?**
Storing JWTs in `localStorage` exposes them to any XSS payload. By keeping the access token in a module-level variable (`_accessToken`), it is automatically cleared on page navigation/reload, and XSS attacks cannot persist the token across sessions.

**Silent refresh with circuit breaker:**

The Axios response interceptor handles 401 errors automatically:

1. Detects a 401 on a non-auth endpoint.
2. Checks a **30-second circuit breaker** — if the last refresh attempt failed recently, it bails out immediately to prevent infinite refresh loops.
3. If `isRefreshing` is already true (another request triggered refresh first), queues the current request in `failedQueue` and waits for the refresh to complete.
4. On success: replays all queued requests with the new access token.
5. On failure: clears the token, empties the queue, and redirects to `/login?session=expired`.

**Endpoints skipped by the refresh interceptor:**
```
/auth/cookie-refresh  (the refresh endpoint itself)
/auth/login
/auth/signup
/auth/google
/notifications/push/subscribe
```

**Request tracing:**
Every outgoing API request includes an `X-Request-ID` header (using `crypto.randomUUID()` where available, with a Math.random fallback) for server-side request correlation and debugging.

---

### 5.3 API Client Design

The frontend uses a single Axios instance (`apiClient`) as the HTTP foundation for all services:

```
src/services/
├── apiClient.ts         ← Axios instance, auth interceptors, refresh logic
├── api.ts               ← Public API (venues, sports, search, reviews)
├── authService.ts       ← Auth (login, logout, MFA, sessions, Google)
├── bookingService.ts    ← Booking CRUD, pricing, PayHere checkout
├── centerService.ts     ← Venue dashboard (stats, analytics, bookings, courts, gallery…)
├── venueApiService.ts   ← Venue CRUD, court CRUD, manager management
├── playerService.ts     ← Player profile, bookings, reviews, challenges, stats
├── notificationService.ts ← Notification feed, preferences, push subscription
└── normalizers.ts       ← API response → TypeScript type adapters
```

**Normalizers** (`src/services/normalizers.ts`) adapt raw backend shapes to the strongly-typed interfaces in `src/types/index.ts`, insulating the UI from backend API changes.

---

### 5.4 Infrastructure & Deployment

| Layer | Technology | Notes |
|---|---|---|
| **Frontend Hosting** | Vercel | Static edge delivery; `force-static` on root layout |
| **Frontend Domain** | thearena.lk | HTTPS enforced, HSTS preload |
| **Backend Hosting** | Custom (FastAPI) | api.thearena.lk |
| **Database** | PostgreSQL | Managed by backend |
| **Media Storage** | Object Storage | Images served from api.thearena.lk/api/v1/media |
| **CDN** | Vercel Edge Network | Automatic for static assets and Next.js ISR |
| **Analytics** | Google Analytics 4 | G-7B9Q46QJR5 via gtag.js |
| **Payments** | PayHere | Sri Lankan payment gateway; sandbox + production |
| **Fonts** | Google Fonts | Self-hosted by Next.js font loader |
| **Image Format** | WebP only | AVIF disabled (5–10× CPU overhead on Vercel) |
| **Image Cache TTL** | 1 year (`31536000 s`) | Long-lived cache for optimised images |

**Next.js Image Optimisation Config:**
```ts
images: {
  formats: ['image/webp'],
  minimumCacheTTL: 31536000,      // 1 year
  deviceSizes: [640, 750, 828, 1080],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
  qualities: [70, 75],
  remotePatterns: [
    { hostname: 'images.unsplash.com' },
    { hostname: 'api.thearena.lk', pathname: '/api/v1/media*' },
    { hostname: 'localhost', port: '8000', pathname: '/api/v1/media*' },
  ],
}
```

---

## 6. SEO & Performance

**Metadata & Social Sharing:**
- Comprehensive `<Metadata>` object in `app/layout.tsx` covering `title`, `description`, `keywords`, `openGraph`, and `twitter:card`.
- `canonical` URL set to `https://thearena.lk`.
- `robots.txt` and `sitemap.ts` included.

**Structured Data (JSON-LD):**
| Schema Type | Where |
|---|---|
| `WebSite` (with `SearchAction`) | Root layout — enables Google Sitelinks Searchbox |
| `Organization` | Root layout |
| `SportsActivityLocation` | `VenueSchema` component on venue detail pages |

**Static Rendering:**
```ts
export const dynamic = "force-static";  // Root layout
```
The root layout (and all pages that don't opt into dynamic rendering) is statically pre-rendered, eliminating per-request Vercel function invocations for the HTML shell.

**FOUC Prevention:**
A tiny inline script runs as the very first child of `<head>` — before any CSS or JS — to read the user's theme preference from `localStorage` and apply the correct `light` or `dark` CSS class to `<html>` before the first paint. This eliminates the "flash of unstyled/wrong-theme content".

**Font Strategy:**
- `Plus Jakarta Sans` and `Syne` loaded via `next/font/google` with `display: swap`.
- CSS variables (`--font-jakarta`, `--font-syne`) applied to `<body>`.

**Performance Budget Decisions:**
- WebP only (AVIF skipped for CPU reasons on Vercel serverless).
- Static root layout to reduce cold-start latency.
- GSAP animations use `will-change: transform` implicitly via transform-based tweens.
- Lenis smooth scroll dispatched on RAF to stay off the main thread.

---

## 7. Project Structure

```
the-arena-frontend/
├── public/
│   ├── sports/              ← Sport type images (badminton, cricket, etc.)
│   ├── venues/              ← Venue category images
│   ├── logo*.png            ← Light & dark mode logo variants
│   ├── sw.js                ← Service worker (Web Push)
│   └── site.webmanifest     ← PWA manifest (static fallback)
│
├── src/
│   ├── app/                 ← Next.js App Router pages
│   │   ├── page.tsx                     ← Home page
│   │   ├── layout.tsx                   ← Root layout (fonts, meta, providers)
│   │   ├── venues/[id]/                 ← Venue detail + review pages
│   │   ├── search/                      ← Search results page
│   │   ├── book/[venueId]/              ← Direct booking entry
│   │   ├── checkout/                    ← Checkout flow
│   │   ├── bookings/[id]/               ← Booking detail + success/cancelled
│   │   ├── dashboard/                   ← Player dashboard
│   │   ├── profile/                     ← Profile + password + settings
│   │   ├── settings/                    ← MFA, sessions, notifications
│   │   ├── challenges/                  ← Gamification challenges
│   │   ├── venue-dashboard/             ← Venue owner/manager console
│   │   │   ├── analytics/               ← Revenue, utilization, fees, cancellations
│   │   │   ├── booking-manager/         ← Day-view calendar
│   │   │   ├── bookings/                ← Booking list
│   │   │   ├── courts/                  ← Court management
│   │   │   ├── recurring/               ← Recurring blocks
│   │   │   ├── closures/                ← Closure management
│   │   │   ├── gallery/                 ← Photo management
│   │   │   ├── managers/                ← Manager invitations
│   │   │   └── settings/                ← Operating hours + peak hours
│   │   ├── login/ signup/ forgot-password/ reset-password/
│   │   ├── verify-email/ check-email/
│   │   ├── about/ contact/ partner/ privacy/ security/ terms/
│   │   ├── api/resolve-maps-link/route.ts  ← BFF proxy
│   │   ├── manifest.ts                  ← PWA manifest (dynamic)
│   │   └── sitemap.ts                   ← XML sitemap
│   │
│   ├── components/
│   │   ├── auth/            ← RequireAuth, RoleGate
│   │   ├── bookings/        ← CancelBookingModal
│   │   ├── home/            ← Hero, HeroCarousel, SportExplorer, FeaturedVenues,
│   │   │                       ReviewsTeaser, GamificationTeaser, PWAInstallGuide
│   │   ├── layout/          ← Header, Footer, MobileBottomNav, MobileTopBar,
│   │   │                       MobileMainWrapper, SmoothScrolling, PWARegister
│   │   ├── notifications/   ← NotificationBell, NotificationPanel,
│   │   │                       NotificationPreferences, PushPromptBanner
│   │   ├── reviews/         ← ReviewFormModal
│   │   ├── seo/             ← VenueSchema
│   │   ├── ui/              ← Button, Modal, Toast, DatePicker, TimePicker,
│   │   │                       CityCombobox, TierFrame, ThemeToggle, MarqueeRow,
│   │   │                       HScrollArea, LordIcon, FullScreenSpinner
│   │   ├── venue/           ← DashboardLayout, VenueContext, VenueSwitcher,
│   │   │                       VenuePendingVerification, CourtFormModal,
│   │   │                       ClosureFormModal, RecurringFormModal
│   │   ├── venues/          ← BookingWidget, CourtFinderPanel, FilterBar
│   │   └── Providers.tsx    ← Global context provider tree
│   │
│   ├── contexts/
│   │   ├── ThemeContext.tsx         ← Light/dark/system theme (FOUC-safe)
│   │   ├── NotificationContext.tsx  ← Unread count, feed state
│   │   └── LocationContext.tsx      ← Geolocation permission + coords
│   │
│   ├── services/            ← All API communication (see §8)
│   ├── types/index.ts       ← Complete TypeScript type definitions
│   └── lib/
│       ├── tierUtils.ts     ← XP → Tier lookup + visual config
│       └── utils.ts         ← Shared utility functions
│
├── next.config.ts           ← Security headers, image optimisation
├── tsconfig.json            ← Strict TypeScript config
├── eslint.config.mjs        ← ESLint (Next.js recommended)
├── postcss.config.mjs       ← Tailwind CSS PostCSS plugin
└── package.json
```

---

## 8. API Reference (Frontend Services)

### Public API (`src/services/api.ts`)

| Method | Endpoint | Description |
|---|---|---|
| `getCities()` | `GET /search/cities` | All cities with listed venues |
| `getSports()` | `GET /sports` | All sport types |
| `getVenues()` | `GET /venues/` | All venues |
| `getTrendingVenues()` | `GET /venues/trending/list` | Activity-ranked trending venues |
| `getFeaturedVenues()` | `GET /venues/featured/list` | Admin-curated featured venues |
| `getVenueById(id)` | `GET /venues/{id}` | Single venue detail |
| `searchVenues(params)` | `GET /search/courts` | Filtered venue/court search |
| `getVenueSlots(id, date)` | `GET /venues/{id}/slots` | Real-time slot availability |
| `getVenueReviews(id)` | `GET /venues/{id}/reviews` | Venue reviews |
| `getVenueReviewStats(id)` | `GET /venues/{id}/reviews/stats` | Rating breakdown |
| `getFeaturedReviews()` | `GET /reviews/featured` | Platform-wide featured reviews |

### Auth Service (`src/services/authService.ts`)

| Method | Endpoint | Description |
|---|---|---|
| `login(email, pw)` | `POST /auth/login` | Credential login |
| `googleLogin(idToken)` | `POST /auth/google` | Google OAuth token exchange |
| `getMe()` | `GET /auth/me` | Current user profile |
| `signup(data)` | `POST /auth/signup` | New account registration |
| `logout()` | `POST /auth/logout` | Clear session |
| `silentRefresh()` | `POST /auth/cookie-refresh` | Refresh via httpOnly cookie |
| `requestPasswordReset(email)` | `POST /auth/forgot-password` | Send reset email |
| `resetPassword(token, pw)` | `POST /auth/reset-password` | Confirm new password |
| `setupMfa()` | `POST /auth/mfa/setup` | Get QR code + secret |
| `getMfaStatus()` | `GET /auth/mfa/status` | Is 2FA enabled? |
| `verifyMfa(code)` | `POST /auth/mfa/confirm` | Confirm TOTP code |
| `disableMfa(password)` | `POST /auth/mfa/disable` | Remove 2FA |
| `getSessions()` | `GET /auth/sessions` | Active login sessions |
| `logoutAllDevices()` | `POST /auth/logout` | Revoke all refresh tokens |

### Booking Service (`src/services/bookingService.ts`)

| Method | Endpoint | Description |
|---|---|---|
| `calculatePrice(courtId, date, slots)` | `POST /pricing/calculate` | Live price breakdown |
| `createBooking(data)` | `POST /bookings/` | Create a booking (payment_pending) |
| `getCheckoutData(bookingId)` | `POST /payments/checkout-data/{id}` | PayHere signed payload |
| `getMyBookings()` | `GET /bookings/me` | Player's booking list |
| `getBookingById(id)` | `GET /bookings/{id}` | Single booking detail |
| `cancelBooking(id, reason)` | `POST /bookings/{id}/cancel` | Cancel a booking |

---

## 9. Gamification System

The gamification engine awards XP for booking activity. XP accumulates against challenges and unlocks progressively more prestigious tier frames displayed on user avatars throughout the platform.

### XP Tier Thresholds

| # | Tier | XP | Badge Icon | Ring Style |
|---|---|---|---|---|
| 1 | **Rookie** | 0 | Medal (light) | Static bronze gradient |
| 2 | **Contender** | 500 | Medal (duotone) | Static silver gradient, compass ornaments |
| 3 | **Athlete** | 1,200 | Military Medal | Static green glow, diamond ornaments |
| 4 | **Champion** | 2,500 | Trophy | Static gold glow, hexagon badge |
| 5 | **Elite** | 4,500 | 🔥 Fire (fill) | **Animated** red/orange conic ring + pulsing glow |
| 6 | **Legend** | 7,500 | ⚔️ Sword (duotone) | **Animated** purple/blue conic ring + swords accent |
| 7 | **Icon** | 12,000 | 👑 Crown (fill) | **Animated** gold/white conic ring + crown accent |
| 8 | **Titan** | 25,000 | ⚡ Lightning (fill) | **Animated** sky-blue conic ring + trident, radiant white glow |

The `TierFrame` component wraps any avatar image with the appropriate ring, badge, ornaments, and top accent for the player's current tier. It is rendered on:
- Player profile page
- Review cards (venue detail + reviews page)
- Challenge completion screens

### Challenge Categories

```
weekly     → Book N courts in a single week
explorer   → Discover N venues / sports / cities
loyalty    → Return to the same venue N times
streak     → Consecutive weekly booking streaks
timing     → Peak / off-peak / early bird / night owl hours
milestone  → Cumulative total bookings or total hours played
```

---

## 10. Getting Started (Local Development)

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A running instance of the Arena backend (or point `NEXT_PUBLIC_API_URL` to the staging API)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/your-org/the-arena-frontend.git
cd the-arena-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script | Command | Description |
|---|---|---|
| **dev** | `npm run dev` | Next.js development server (hot reload) |
| **build** | `npm run build` | Production build |
| **start** | `npm run start` | Serve the production build locally |
| **lint** | `npm run lint` | ESLint with Next.js rules |

---

## 11. Environment Variables

Create a `.env.local` file at the project root:

```bash
# Required: Backend API base URL
NEXT_PUBLIC_API_URL=https://api.thearena.lk/api/v1

# Required: Google OAuth Client ID (from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

> **Security:** Never commit `.env.local`. All secrets that should not be exposed to the browser must be kept without the `NEXT_PUBLIC_` prefix and only used in API Routes (server-side).

---

## 12. Design Philosophy

**Dark-first, light-capable.** The default experience is a dark, premium aesthetic (`#050505` backgrounds, emerald-green accents) with a fully-implemented light mode. Theme is resolved FOUC-free via an inline blocking script before first paint and synced across tabs via the `StorageEvent` API.

**Premium sports feel.** Typography uses Syne for bold, geometric headings and Plus Jakarta Sans for readable UI text — both chosen for their modern, sporty character. Emerald green (`#10b981`) is the primary brand accent.

**Performance over chrome.** AVIF encoding is intentionally disabled to keep Vercel image-optimisation CPU costs low. Static rendering at the root layout level prevents unnecessary serverless function invocations on every page load.

**Security as a first-class concern.** The access token never touches persistent storage. CSP, HSTS with preload, clickjacking protection, and a circuit-breaker on token refresh are all production defaults, not afterthoughts.

**Role-aware UI.** Revenue and fee analytics are hidden from `venue_manager` roles — the UI adapts granularly based on the roles array returned by the API, not by page-level routing alone.

---

<div align="center">

**Built with ❤️ for Sri Lankan sports communities**

[thearena.lk](https://thearena.lk)

</div>
