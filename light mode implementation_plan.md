# Light Theme — Full Implementation Plan (v2)

After deep-diving into **every component and page** in the codebase, here is the battle-tested plan.

---

## Configuration Decisions (Confirmed)

| Decision | Answer |
|----------|--------|
| **Logo** | Dark logo variants exist — will swap conditionally |
| **Default theme** | OS preference (`prefers-color-scheme`) |
| **Toggle desktop** | Header nav, next to auth buttons |
| **Toggle mobile** | MobileTopBar |

---

## Deep Analysis — Corner Cases & Edge Cases Found

> [!CAUTION]
> These 14 corner cases were found during deep analysis and **must** be handled correctly to avoid visual bugs.

### 1. `text-black` on Emerald Buttons — DO NOT CHANGE
~50+ instances of `text-black` paired with `bg-emerald-500` (primary CTA buttons). These use **black text on green** for contrast. This is correct in **both themes** — the brand green button always needs dark text for readability. **These must NOT be converted to semantic tokens.**

### 2. Image Gradient Overlays — Theme-Adaptive
**8 files** use `from-black` / `via-black` gradients on top of images (hero cards, sport cards, venue gallery, profile cover). In dark theme these fade to the black background. In light theme they need to fade differently:
- **Strategy**: Keep `from-black` overlays on images — they provide text readability over photos. These are universally needed for contrast regardless of theme. **No change needed** for most image overlays.
- **Exception**: Profile page cover gradient (`from-black via-black/40 to-transparent`) — needs `from-surface-base` variant since it merges with the page background.

### 3. Challenges Page — Heavy Inline Styles
`challenges/page.tsx` (655 lines) uses **extensive inline `style={{}}` objects** with hardcoded dark RGBA colors for:
- Card backgrounds: `rgba(12,12,14,0.97)`
- Category gradients: `gradientFrom: "#030720"` 
- Border colors: `rgba(59,130,246,0.35)`
- Rarity system glows and bars
- Tier ladder backgrounds: `rgba(15,15,18,0.xx)`

**Strategy**: The challenge cards are a self-contained gamification system with dynamic color theming already (via category + rarity configs). We need to:
- Replace `rgba(12,12,14,0.97)` card background with a CSS variable
- Replace dark gradient backgrounds in CATEGORIES config with theme-aware values
- Replace tier card dark backgrounds with CSS variables
- Keep all accent/brand colors (emerald, blue, purple, amber, etc.) unchanged

### 4. CourtFinderPanel — Inline `boxShadow` with Dark Colors
```tsx
boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 80px -20px rgba(80, 200, 120, 0.12)'
```
**Strategy**: Use CSS variable for shadow intensity (reduce the black shadow opacity in light mode, increase the emerald glow).

### 5. BookingWidget Time Slot Grid — Complex Conditional Colors
The slot grid has 6+ visual states (available, booked, recurring, maintenance, closed, peak, selected, past). Each uses carefully crafted color combinations. **These status colors work universally** (red=booked, emerald=selected, amber=peak, indigo=recurring). Only the **neutral "available" state** needs theming:
- `bg-zinc-800 border-zinc-700 text-zinc-300` → semantic tokens

### 6. `shadow-inner shadow-black/20` — CourtFinderPanel
3 instances wrap date/time pickers with inset shadows. In light mode, `shadow-black/20` will be too dark.
**Strategy**: Replace with `shadow-inner shadow-surface-base/20` (adapts to theme).

### 7. `shadow-2xl shadow-black/80` — Dropdown Portals
DatePicker, TimePicker, CityCombobox all portal their dropdowns with `shadow-2xl shadow-black/80`. Light mode needs softer shadows.
**Strategy**: Use `shadow-2xl shadow-surface-base/50` — dark shadow in dark mode, subtle in light.

### 8. PWA Manifest — Hardcoded `#000000`
`manifest.ts` has `background_color: "#000000"` and `theme_color: "#000000"`. 
**Strategy**: The manifest is static (generated at build time). We'll keep it dark since PWA splash screens should match the base brand. This is acceptable — most premium apps use a dark splash even with light UI.

### 9. `<meta name="theme-color">` — Missing
No theme-color meta tag exists in `layout.tsx`. 
**Strategy**: Add a dynamic theme-color meta that updates on theme switch (dark: `#050505`, light: `#ffffff`).

### 10. Maintenance Page — Standalone Fullscreen
The maintenance page is a standalone fullscreen layout (`fixed inset-0 z-[9999] bg-black`). It should maintain its dramatic dark aesthetic.
**Strategy**: Leave maintenance page as-is — it's a special-purpose page that should always be dark for dramatic effect.

### 11. `select option` Dropdown Colors in globals.css
```css
select option {
  background-color: #18181b; /* zinc-900 */
  color: #ededed;
}
```
**Strategy**: Wrap in `.dark` / `.light` selectors using CSS variables.

### 12. Scrollbar Colors in globals.css
Hardcoded dark scrollbar track (`#0a0a0a`) and thumb (`#27272a`).
**Strategy**: Use CSS variables for scrollbar colors.

### 13. Swiper Pagination Bullet Colors in globals.css
```css
.hero-carousel .swiper-pagination-bullet {
  background: rgba(255, 255, 255, 0.3);
}
```
**Strategy**: In light mode, bullets should be `rgba(0, 0, 0, 0.3)`. Wrap with theme selectors.

### 14. FOUC (Flash of Unstyled Content) Prevention
Since we use OS preference as default, the page could flash white/dark before JS hydrates.
**Strategy**: Add a tiny inline `<script>` in `layout.tsx` (before React hydration) that reads `localStorage` + `prefers-color-scheme` and sets the `dark`/`light` class on `<html>` **synchronously**. This prevents any flash.

---

## Architecture — Token System

### Semantic Tokens (CSS Custom Properties)

These are defined in `globals.css` and referenced via Tailwind utility classes.

| Token Name | CSS Variable | Dark Value | Light Value | Tailwind Class |
|---|---|---|---|---|
| **Surfaces** | | | | |
| Base background | `--color-surface-base` | `#050505` | `#ffffff` | `bg-surface-base` |
| Raised surface | `--color-surface-raised` | `#18181b` (zinc-900) | `#f4f4f5` (zinc-100) | `bg-surface-raised` |
| Overlay surface | `--color-surface-overlay` | `#27272a` (zinc-800) | `#e4e4e7` (zinc-200) | `bg-surface-overlay` |
| Sunken surface | `--color-surface-sunken` | `#09090b` (zinc-950) | `#fafafa` (zinc-50) | `bg-surface-sunken` |
| Inset surface | `--color-surface-inset` | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.03)` | `bg-surface-inset` |
| **Text** | | | | |
| Primary text | `--color-text-primary` | `#ffffff` | `#18181b` | `text-primary` |
| Secondary text | `--color-text-secondary` | `#a1a1aa` (zinc-400) | `#52525b` (zinc-600) | `text-secondary` |
| Muted text | `--color-text-muted` | `#71717a` (zinc-500) | `#71717a` (zinc-500) | `text-muted` |
| Faint text | `--color-text-faint` | `#52525b` (zinc-600) | `#a1a1aa` (zinc-400) | `text-faint` |
| Inverted text | `--color-text-inverted` | `#000000` | `#ffffff` | `text-inverted` |
| **Borders** | | | | |
| Default border | `--color-border-default` | `#27272a` (zinc-800) | `#e4e4e7` (zinc-200) | `border-default` |
| Subtle border | `--color-border-subtle` | `#3f3f46` (zinc-700) | `#d4d4d8` (zinc-300) | `border-subtle` |
| Faint border | `--color-border-faint` | `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.06)` | `border-faint` |
| **Glass (Frosted Panels)** | | | | |
| Glass background | `--color-glass-bg` | `rgba(0,0,0,0.50)` | `rgba(255,255,255,0.80)` | `bg-glass-bg` |
| Glass border | `--color-glass-border` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.08)` | `border-glass-border` |
| **Shadows** | | | | |
| Elevation shadow | `--shadow-elevation` | `rgba(0,0,0,0.8)` | `rgba(0,0,0,0.12)` | — (via CSS) |
| **Scrollbar** | | | | |
| Track | `--scrollbar-track` | `#0a0a0a` | `#f4f4f5` | — (CSS) |
| Thumb | `--scrollbar-thumb` | `#27272a` | `#d4d4d8` | — (CSS) |
| **Swiper** | | | | |
| Bullet inactive | `--swiper-bullet` | `rgba(255,255,255,0.3)` | `rgba(0,0,0,0.25)` | — (CSS) |
| Nav button bg | `--swiper-nav-bg` | `rgba(9,9,11,0.7)` | `rgba(255,255,255,0.85)` | — (CSS) |

### Brand Colors — UNCHANGED
The following colors stay identical across themes:
- Emerald palette (400-700) — primary brand
- Status colors (red, yellow, amber, blue, indigo, purple, orange)
- Tier frame colors (all gradient/glow values)
- Category accent colors in Challenges page

---

## Proposed Changes (Phase by Phase)

### Phase 0: Infrastructure (Zero Visual Change)

Safe to deploy independently. Dark theme users see zero difference.

---

#### [NEW] [ThemeContext.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/contexts/ThemeContext.tsx)

React context providing:
- `theme: "light" | "dark" | "system"`
- `resolvedTheme: "light" | "dark"` (actual applied theme)
- `setTheme(theme)` — persists to `localStorage`
- `toggleTheme()` — convenience toggle

Implementation details:
- Reads from `localStorage("arena-theme")` → fallback to `prefers-color-scheme`
- Sets `.dark` / `.light` class on `<html>`
- Updates `<meta name="theme-color">` dynamically
- Uses `useEffect` to avoid SSR hydration mismatch
- Listens for `prefers-color-scheme` media query changes (live OS toggle support)

#### [MODIFY] [layout.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/app/layout.tsx)

- Add inline `<script>` for FOUC prevention (sync theme detection before paint)
- Add `suppressHydrationWarning` to `<html>` (already present)
- Add initial `className="dark"` to `<html>` as SSR fallback
- Add `<meta name="theme-color" content="#050505" />`

#### [MODIFY] [Providers.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/Providers.tsx)

- Wrap children with `<ThemeProvider>` (outermost wrapper)

#### [MODIFY] [globals.css](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/app/globals.css)

Major changes:
1. **Expand `@theme` block** — register all semantic token custom properties
2. **Add `html.dark` block** — all dark token values (current design = dark values)
3. **Add `html.light` block** — all light token values
4. **Move `:root` variables** under `.dark` (or default them)
5. **Update `body`** to use `background: var(--color-surface-base)`
6. **Scrollbar** — convert from hardcoded hex to variables
7. **`select option`** — convert from hardcoded to variables
8. **Swiper bullets/nav** — convert from hardcoded to variables
9. **`.shimmer`** — adjust shimmer white overlay for light mode (reduce from 0.1 to 0.05)
10. **Hero carousel nav buttons** — convert rgba background to variable
11. **Sport card filter** — `grayscale(80%) brightness(0.7)` stays same (works on both themes)

#### [NEW] [ThemeToggle.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/ThemeToggle.tsx)

Animated Sun/Moon toggle button:
- Smooth icon morph animation (Sun ↔ Moon)
- Subtle rotation on toggle
- Accessible: `aria-label`, keyboard support
- Compact size (32x32px) to fit navigation
- Uses `useTheme()` hook from context

---

### Phase 1: Layout Shell (4 files)

After this phase, the entire page frame (header, footer, mobile nav) respects the theme. This gives instant visual coverage on every page.

---

#### [MODIFY] [Header.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/layout/Header.tsx)

| Current Class | → Semantic Token |
|---|---|
| `bg-black/50` | `bg-glass-bg` |
| `border-white/5` | `border-glass-border` |
| `text-white` (nav links) | `text-primary` |
| `text-zinc-400` (secondary) | `text-secondary` |
| `bg-zinc-900` (mobile menu bg) | `bg-surface-raised` |
| `border-zinc-800` | `border-default` |
| `hover:bg-white/5` | `hover:bg-surface-overlay/30` |
| `bg-white text-black` (Sign Up) | **Leave as-is** — white button is intentionally high-contrast |
| `hover:bg-zinc-200` | Keep — works for white button |

Additional changes:
- Add `<ThemeToggle />` in desktop nav (after auth buttons)
- Add `<ThemeToggle />` in mobile menu
- Logo swap: `src={resolvedTheme === 'dark' ? '/logo-nav.png' : '/logo-nav-dark.png'}`

#### [MODIFY] [Footer.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/layout/Footer.tsx)

| Current | → Token |
|---|---|
| `bg-black` | `bg-surface-base` |
| `border-zinc-800` | `border-default` |
| `text-white` | `text-primary` |
| `text-zinc-400` | `text-secondary` |

#### [MODIFY] [MobileTopBar.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/layout/MobileTopBar.tsx)

| Current | → Token |
|---|---|
| `bg-zinc-950/95` | `bg-glass-bg` |
| `border-white/[0.07]` | `border-glass-border` |
| `bg-zinc-800/60` | `bg-surface-overlay/60` |
| `border-zinc-700/40` | `border-subtle/40` |
| `text-zinc-400` | `text-secondary` |
| `text-zinc-200` | `text-primary` |

Additional: Add `<ThemeToggle />` to the bar.

#### [MODIFY] [MobileBottomNav.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/layout/MobileBottomNav.tsx)

| Current | → Token |
|---|---|
| `bg-zinc-950/95` | `bg-glass-bg` |
| `border-white/[0.07]` | `border-glass-border` |
| `text-zinc-500` | `text-muted` |
| `text-zinc-600` | `text-faint` |

---

### Phase 2: Shared UI Components (12 files)

These are used across 30+ pages, so converting them multiplies our coverage.

---

#### [MODIFY] [Button.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/Button.tsx)
- `primary`: `bg-emerald-500 text-black` → **No change** (brand button stays)
- `outline`: `border-zinc-700 text-white hover:bg-white/5` → `border-default text-primary hover:bg-surface-overlay/30`
- `ghost`: `text-zinc-400 hover:text-white hover:bg-white/5` → `text-secondary hover:text-primary hover:bg-surface-overlay/30`
- `danger`: Red stays consistent across themes
- `disabled` state: Opacity-based, theme-independent ✓

#### [MODIFY] [Modal.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/Modal.tsx)
- `bg-zinc-900` → `bg-surface-raised`
- `border-zinc-800` → `border-default`
- `bg-black/80` backdrop → Keep same opacity but in light mode reduce to `bg-black/40` via CSS variable

#### [MODIFY] [Toast.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/Toast.tsx)
- Success/Error/Warning backgrounds use brand colors at low opacity — these work in both themes ✓
- `text-white` → `text-primary`
- `text-zinc-400` → `text-secondary`

#### [MODIFY] [VenueCard.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/VenueCard.tsx)
- `bg-zinc-900` → `bg-surface-raised`
- `border-zinc-800` → `border-default`
- `text-white` → `text-primary`
- `text-zinc-400` → `text-secondary`
- Image gradient overlay: Keep `from-black` — ensures text readability over photos in both themes

#### [MODIFY] [DatePicker.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/DatePicker.tsx)
- Trigger button: `bg-black/50 border-zinc-700` → `bg-surface-inset border-subtle`
- Dropdown portal: `bg-zinc-900 border-zinc-700 shadow-black/80` → `bg-surface-raised border-subtle shadow-elevation`
- `hover:bg-zinc-800` → `hover:bg-surface-overlay`
- `text-zinc-300` (day) → `text-secondary`
- `text-zinc-700` (disabled day) → `text-faint`
- `text-zinc-600` (day header) → `text-faint`
- `text-zinc-500` → `text-muted`

#### [MODIFY] [TimePicker.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/TimePicker.tsx)
- Same pattern as DatePicker — identical token mapping

#### [MODIFY] [CityCombobox.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/CityCombobox.tsx)
- Wrapper: `bg-black/50 border-zinc-700` → `bg-surface-inset border-subtle`
- Dropdown portal: `bg-zinc-900 border-zinc-700 shadow-black/80` → `bg-surface-raised border-subtle shadow-elevation`
- List items: `bg-zinc-800`, `text-zinc-300` → `bg-surface-overlay`, `text-secondary`
- Input: `text-white` → `text-primary`, `placeholder:text-zinc-500` → `placeholder:text-muted`

#### [MODIFY] [CancelBookingModal.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/CancelBookingModal.tsx)
- Uses Modal as base — inherits its theme changes
- Internal text/borders → semantic tokens

#### [MODIFY] [FullScreenSpinner.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/FullScreenSpinner.tsx)
- `bg-black` → `bg-surface-base`

#### [MODIFY] [TierFrame.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/TierFrame.tsx)
- All tier ring/glow animations → **No change** (theme-independent brand colors)
- Fallback avatar `bg-zinc-900` → `bg-surface-raised`

#### [MODIFY] [HScrollArea.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/ui/HScrollArea.tsx)
- No dark colors used — cursor styles only. **No changes needed.** ✅

#### [MODIFY] [ReviewFormModal.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/reviews/ReviewFormModal.tsx)
- Modal form inputs: `bg-black/40 border-zinc-700` → `bg-surface-inset border-subtle`
- Labels, text → semantic tokens

---

### Phase 3: Homepage Components (11 files)

---

#### [MODIFY] [page.tsx (Home)](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/app/page.tsx)
- `bg-black` → `bg-surface-base`
- All section backgrounds, text, borders → semantic tokens
- "How it Works" cards → `bg-surface-raised/20 border-default/50`

#### [MODIFY] [Hero.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/home/Hero.tsx)
- Background gradient adjustments for light mode
- Emerald glow orbs: Reduce opacity in light mode via `opacity-[0.06]` → `dark:opacity-[0.06] light:opacity-[0.03]`
- CTA button: `text-black bg-emerald` — **No change** ✅

#### [MODIFY] [HeroCarousel.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/home/HeroCarousel.tsx)
- Swiper navigation handled in globals.css (Phase 0)
- Container borders → semantic tokens

#### [MODIFY] [HeroVenueCard.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/home/HeroVenueCard.tsx)
- Card surface: `bg-zinc-900/80 border-zinc-800` → `bg-surface-raised/80 border-default`
- `text-white` → `text-primary`
- `from-black via-black/30` image gradient — **Keep** (text readability over photo)

#### [MODIFY] [SportExplorer.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/home/SportExplorer.tsx)
- Section text/headings → semantic tokens

#### [MODIFY] [SportCard.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/home/SportCard.tsx)
- `from-black via-black/50` gradient — **Keep** (image overlay for text readability)
- Sport card hover filter in globals.css — stays unchanged (works on both)

#### [MODIFY] [FeaturedVenues.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/home/FeaturedVenues.tsx)
- Headings/text → semantic tokens
- Uses VenueCard — inherits Phase 2 changes

#### [MODIFY] [ReviewsTeaser.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/home/ReviewsTeaser.tsx)
- Review cards: `bg-zinc-900/80 border-zinc-800` → semantic tokens
- CTA button: `text-black bg-emerald` — **No change** ✅

#### [MODIFY] [GamificationTeaser.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/home/GamificationTeaser.tsx)
- Section: `via-black to-black` → `via-surface-base to-surface-base`
- Card inline styles with dark rgba → CSS variable
- `boxShadow: rgba(0,0,0,0.35)` → theme-aware shadow variable

#### [MODIFY] [PWAInstallGuide.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/home/PWAInstallGuide.tsx)
- Surface/text/borders → semantic tokens

#### [MODIFY] [PartnerCTA.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/home/PartnerCTA.tsx)
- Surface/text/borders → semantic tokens
- CTA: `text-black bg-emerald` — **No change** ✅

---

### Phase 4: Public Pages (28 files)

All player-facing pages follow a **repeatable pattern**:

| Current | → Token |
|---|---|
| `bg-black` / `bg-zinc-950` | `bg-surface-base` |
| `bg-zinc-900/50` (cards) | `bg-surface-raised/50` |
| `bg-zinc-900/40` (cards) | `bg-surface-raised/40` |
| `bg-zinc-900` (solid cards) | `bg-surface-raised` |
| `border-zinc-800` | `border-default` |
| `border-zinc-700` | `border-subtle` |
| `text-white` (headings) | `text-primary` |
| `text-zinc-400` (body) | `text-secondary` |
| `text-zinc-500` (meta) | `text-muted` |
| `text-zinc-600` (faint) | `text-faint` |
| `text-zinc-300` (light text) | `text-primary` or `text-secondary` |
| `bg-black/40` (input bg) | `bg-surface-inset` |
| `hover:bg-zinc-800` | `hover:bg-surface-overlay` |
| `bg-zinc-800` (tags/pills) | `bg-surface-overlay` |
| `placeholder:text-zinc-600` | `placeholder:text-muted` |

**Files:**

| # | File | Special Notes |
|---|---|---|
| 1 | `login/page.tsx` | Background gradient needs light variant |
| 2 | `signup/page.tsx` | Standard auth page |
| 3 | `signup/player/page.tsx` | Standard auth page |
| 4 | `signup/venue/page.tsx` | Standard auth page |
| 5 | `forgot-password/page.tsx` | Standard auth page |
| 6 | `reset-password/page.tsx` | Standard auth page |
| 7 | `check-email/page.tsx` | Standard auth page |
| 8 | `verify-email/page.tsx` | Standard auth page |
| 9 | `venues/page.tsx` | Already uses `bg-background` ✓, but skeleton cards need tokens |
| 10 | `venues/[id]/page.tsx` | Venue detail — image gallery, map embed, reviews |
| 11 | `venues/[id]/review/page.tsx` | Review submission |
| 12 | `book/[venueId]/page.tsx` | Booking flow |
| 13 | `checkout/[id]/page.tsx` | Payment page — countdown timer |
| 14 | `bookings/page.tsx` | Bookings list |
| 15 | `bookings/[id]/page.tsx` | Booking detail |
| 16 | `bookings/[id]/success/page.tsx` | Success page |
| 17 | `bookings/[id]/confirm/page.tsx` | Confirm page |
| 18 | `bookings/[id]/cancelled/page.tsx` | Cancelled page |
| 19 | `profile/page.tsx` | Profile cover gradient, stats cards, menu |
| 20 | `profile/settings/page.tsx` | Settings form |
| 21 | `profile/password/page.tsx` | Password change |
| 22 | `challenges/page.tsx` | **Complex** — see Corner Case #3 |
| 23 | `about/page.tsx` | Static page |
| 24 | `contact/page.tsx` | Static page |
| 25 | `partner/page.tsx` | Partner landing |
| 26 | `reviews/page.tsx` | Reviews list |
| 27 | `settings/sessions/page.tsx` | Sessions management |
| 28 | `settings/mfa/page.tsx` | MFA settings |
| | `search/page.tsx` | Search page |
| | `not-found.tsx` | 404 page |
| | `loading.tsx` | Loading screen |

---

### Phase 5: Venue Dashboard (20 files)

The dashboard has its own layout wrapper (`DashboardLayout.tsx`) which provides the sidebar and top bar. Converting it first cascades to all dashboard pages.

---

#### [MODIFY] [DashboardLayout.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/venue/DashboardLayout.tsx)
Largest single conversion:
- Sidebar: `bg-zinc-900/60` → `bg-surface-raised/60`
- Mobile header: `bg-zinc-900/95` → `bg-glass-bg`
- Menu items: `text-zinc-400`, `hover:bg-white/5` → `text-secondary`, `hover:bg-surface-overlay/30`
- Active item: Keep emerald accent — theme-independent
- Main area: `bg-black` → `bg-surface-base`
- Ambient blobs: Reduce opacity in light mode

#### [MODIFY] [VenueSwitcher.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/venue/VenueSwitcher.tsx)
- Dropdown: `bg-zinc-900 border-zinc-800 shadow-black/50` → `bg-surface-raised border-default shadow-elevation`

#### [MODIFY] [VenuePendingVerification.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/venue/VenuePendingVerification.tsx)
- Standard surface/text/border → semantic tokens

#### [MODIFY] [CourtFormModal.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/venue/CourtFormModal.tsx)
- Form inputs/surfaces → semantic tokens

#### [MODIFY] [ClosureFormModal.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/venue/ClosureFormModal.tsx)
- Form inputs/surfaces → semantic tokens

#### [MODIFY] [RecurringFormModal.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/venue/RecurringFormModal.tsx)
- Form inputs/surfaces → semantic tokens

**Dashboard Pages (14):**

| # | File | Special Notes |
|---|---|---|
| 1 | `venue-dashboard/page.tsx` | Stat cards, quick action cards |
| 2 | `venue-dashboard/booking-manager/page.tsx` | **Complex** — time grid, slot cards, walk-in modal |
| 3 | `venue-dashboard/bookings/page.tsx` | Table layout |
| 4 | `venue-dashboard/courts/page.tsx` | Court cards w/ status badges |
| 5 | `venue-dashboard/recurring/page.tsx` | Recurring slots list |
| 6 | `venue-dashboard/closures/page.tsx` | Closures list |
| 7 | `venue-dashboard/gallery/page.tsx` | Image grid |
| 8 | `venue-dashboard/settings/page.tsx` | Large settings form |
| 9 | `venue-dashboard/managers/page.tsx` | Manager invites |
| 10 | `venue-dashboard/create/page.tsx` | Multi-step venue creation |
| 11 | `venue-dashboard/edit/page.tsx` | Venue edit form |
| 12 | `venue-dashboard/analytics/*` | 3 analytics pages |

---

### Phase 6: Search & Misc Components (8 files)

---

#### [MODIFY] [FilterBar.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/venues/FilterBar.tsx)
- `bg-black/80` → `bg-glass-bg`
- `bg-zinc-900` → `bg-surface-raised`
- Input: `bg-zinc-900 border-zinc-800` → `bg-surface-inset border-default`

#### [MODIFY] [BookingWidget.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/venues/BookingWidget.tsx)
- Panel: `bg-zinc-900/80 border-zinc-800` → `bg-surface-raised/80 border-default`
- Court tabs: `bg-zinc-950 border-zinc-800` → `bg-surface-sunken border-default`
- Available slot: `bg-zinc-800 border-zinc-700` → `bg-surface-overlay border-subtle`
- Status colors (booked/closed/peak/selected) → **No change** ✅
- Login prompt: surface/text tokens
- Success overlay: surface/text tokens

#### [MODIFY] [CourtFinderPanel.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/venues/CourtFinderPanel.tsx)
- Panel: `bg-zinc-900/80 border-zinc-700/30` → `bg-surface-raised/80 border-default/30`
- `shadow-inner shadow-black/20` → light mode: reduced shadow
- Inline `boxShadow` with rgba(0,0,0) → CSS variable approach
- Button states: `bg-zinc-800/60 border-zinc-700/40` → semantic tokens
- Sport card image overlays: **Keep** `from-black` (image text readability)

#### [MODIFY] [RequireAuth.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/auth/RequireAuth.tsx)
- `bg-black` → `bg-surface-base`

#### [MODIFY] [RoleGate.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/auth/RoleGate.tsx)
- Text colors → semantic tokens

#### [MODIFY] [CancelBookingModal (bookings)](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/components/bookings/CancelBookingModal.tsx)
- Standard modal pattern

#### [SKIP] [maintenance/page.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/app/maintenance/page.tsx)
- **Intentionally left as dark-only** — dramatic standalone page ✅

#### [SKIP] [template.tsx](file:///c:/Users/sandu/OneDrive/Documents/The%20Arena/the-arena-frontend/src/app/template.tsx)
- No dark colors — just GSAP transition wrapper ✅

---

## Light Theme Color Palette — Design Philosophy

> [!TIP]
> The light theme will use **warm, sophisticated off-whites** — not pure `#ffffff`. This maintains The Arena's premium brand feel.

| Surface | Color | Hex | Rationale |
|---------|-------|-----|-----------|
| Base | Pure white | `#ffffff` | Clean, modern base |
| Raised (cards) | Zinc 100 | `#f4f4f5` | Subtle card elevation |
| Overlay (hover) | Zinc 200 | `#e4e4e7` | Interactive feedback |
| Sunken (inputs) | Zinc 50 | `#fafafa` | Recessed inputs |
| Inset (deep) | black/3% | `rgba(0,0,0,0.03)` | Subtle depth |

| Text | Color | Hex | Rationale |
|------|-------|-----|-----------|
| Primary | Zinc 900 | `#18181b` | Strong, readable headings |
| Secondary | Zinc 600 | `#52525b` | Body text, descriptions |
| Muted | Zinc 500 | `#71717a` | Meta info, timestamps |
| Faint | Zinc 400 | `#a1a1aa` | Disabled, decorative |

---

## Verification Plan

### Build & Lint
After **each phase**:
```bash
npm run build    # → no compile errors
npm run lint     # → no new warnings
```

### Visual Regression (Browser Tool)
After each phase:
1. **Dark mode verification** — Load site, confirm zero visual changes
2. **Light mode toggle** — Toggle via button, verify each updated component
3. **Mobile viewport (375px)** — Check both themes
4. **Desktop viewport (1440px)** — Check both themes

### Critical Test Scenarios
| Scenario | What to Verify |
|----------|---------------|
| First visit (no localStorage) | Follows OS preference |
| Toggle theme | Instant switch, no flash |
| Refresh after toggle | Remembered from localStorage |
| OS preference change during session | Updates if set to "system" |
| Booking widget slot states | All 6 states visible in both themes |
| Modal over page | Correct backdrop + surface colors |
| Dropdown portals (DatePicker, TimePicker, CityCombobox) | Float above page with correct theme |
| Challenges page gamification | Cards, tier ladder, XP bars all themed |
| Profile page cover gradient | Merges with page background |
| Emoji/icons on light bg | Still readable |
| Image overlays (venue cards, gallery) | Text remains readable |
| Login/Signup gradient background | Premium look in light mode |

### Production Safety
- **Phase-by-phase commits**: Each phase can be deployed independently
- **Dark mode = current behavior**: Zero change for existing users until toggle is used
- **No database changes**: All changes are frontend CSS/component only
- **FOUC prevention**: Inline script prevents flash on page load
- **Rollback**: Single `git revert` per phase if needed

---

## Execution Summary

| Phase | Scope | Files | Risk | Effort |
|-------|-------|-------|------|--------|
| 0 | Infrastructure (zero visual change) | 4 new/modified | **None** | Low |
| 1 | Layout shell (Header, Footer, Nav) | 4 files | **Low** | Low |
| 2 | Shared UI components | 12 files | **Low** | Medium |
| 3 | Homepage components | 11 files | **Medium** | Medium |
| 4 | Public pages | ~28 files | **Medium** | High (volume) |
| 5 | Venue Dashboard | ~20 files | **Medium** | High (complexity) |
| 6 | Search & Misc | ~8 files | **Low** | Low |
| **Total** | | **~87 files** | | **Multi-session** |

---

> [!IMPORTANT]
> **Please review and approve this plan before I begin execution.** Once approved, I'll start with Phase 0 (infrastructure) and work through each phase sequentially with build verification between each.
