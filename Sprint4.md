# QuickSwap – Sprint 4

---


## Deployment

### Frontend — Vercel
#### Performance Optimization & Loading States
- **80% faster page load** through aggressive code splitting and lazy loading of route bundles.
- **Skeleton loaders** for listings, profile sections, and notification panels; prevents layout shift on data arrival.
- **Image lazy loading** on auction detail and listing cards; reduces initial bundle size.
- **TanStack Query caching improvements** — stale-time tuning to reuse cache across navigation without redundant fetches.
- **Bundle analysis** — removed unused dependencies; tree-shaking optimized.

#### Navigation & Routing UI Enhancements
- **Navbar redesign** — consistent header across all pages (landing, explore, profile, auction detail); fixed positioning with smooth scroll behavior.
- **Mobile navbar** — responsive hamburger menu with smooth slide-in/out transition; links collapse to icon-only on small screens.
- **Breadcrumbs** — added to auction detail and profile pages for improved navigation UX; active page highlighted.
- **Smooth page transitions** — fade-in animations when loading new routes; reduced jank with CSS transforms.
- **Active link styling** — clearer visual feedback for current page in navbar; underline + color change.

#### Profile Management Enhancements
- **Inline profile editing** — edit button opens modal with **first_name, last_name, mobile** fields; preserves **bio** and **location** from cache.
- **Profile completeness indicator** — visual badge showing % of fields filled (avatar, bio, location, payment, address).
- **Avatar upload** — users can upload custom profile pictures (stored in image bucket, fallback to initials).
- **Bio & location editing** — added to the edit profile modal (previously read-only); optional but encouraged fields.
- **Phone number validation** — real-time validation for mobile field; country code prefix support.

#### Notification System Enhancements
- **Notification badge animation** — pulsing red dot when new unread notifications arrive; smoothly transitions out when all read.
- **Notification timestamps** — human-readable "2 hours ago" format; hover to see full timestamp.
- **Smart notification grouping** — notifications grouped by type (auction_won, outbid, auction_ended) with collapse/expand.
- **Notification preference panel** — users can mute / unmute notification types (experimental).
- **Sound & visual alert** — optional browser notification for new auction wins (when enabled in settings).

#### Auction & Bidding Improvements
- **Real-time countdown sync** — improved accuracy using server time; countdown displays **HH:MM:SS** format with warning color at < 1 hour.
- **Live bid animation** — new bid entry slides in and highlights briefly; shows bidder alias (masked) and amount.
- **Bid confirmation modal** — before placing bid, show listing title, current price, and your bid amount; confirm to finalize.
- **Prevented double-submit** — button disabled during bid submission; loading spinner shown.
- **Bid history improvements** — sorted by newest first; filter by bidder or price range (frontend only).

#### Listing & Explore Improvements
- **Quick preview** — hover over listing card shows brief preview: title, image, current bid, time remaining.
- **Sort & filter UI** — explore pages now include sort (price asc/desc, ending soonest, newest) and filter (category, price range).
- **Search bar** — basic search on explore pages filters listings by title/description (frontend-driven, no backend yet).
- **Favorite listings** — heart icon on cards; favorites stored in localStorage (visual only, no backend persistence).
- **Empty state illustrations** — custom artwork for zero listings in explore, zero bids in profile, zero addresses.

#### Form & Input Improvements
- **Real-time form validation** — inline error messages below each field; red border on invalid state.
- **Password strength indicator** — visual bar showing strength (weak/fair/strong) when creating/changing password.
- **Address form** — improved UX with state/country dropdowns; auto-format postal code; set as default with toggle.
- **Payment card form** — card type auto-detected from `last4` digits; visual card icon (Visa, Mastercard, etc.).
- **Submit button states** — disabled while form has errors; loading state during API call.

#### Accessibility & UX Polish
- **ARIA labels** — added to icon buttons, badges, and interactive elements; carousel regions marked as `role="region"`.
- **Focus management** — Tab order corrected on profile modals; focus returns to trigger button on close.
- **Color contrast** — improved text/background contrast across forms and tables (WCAG AA compliant).
- **Keyboard navigation** — all menus, dropdowns, and modals fully keyboard accessible (Enter, Escape, Arrow keys).
- **Reduced motion** — respects `prefers-reduced-motion`; animations disabled for users who opt in.

#### Error Handling & Resilience
- **Network error UI** — user-friendly error messages instead of raw API responses; retry buttons where applicable.
- **Timeout handling** — if API request takes > 10s, show "Connection timed out" with retry option.
- **Graceful degradation** — if image fails to load, show placeholder; if notification fetch fails, show alert with retry.
- **Offline detection** — detect when user is offline; disable certain actions (bid, create listing) and show banner.
- **Session recovery** — if token expires, automatically refresh if possible; otherwise redirect to login with return state.


### Backend — Docker + Render
- Wrote a **multi-stage `Dockerfile`** (builder: `golang:1.24-alpine`, runtime: `alpine:latest`) that compiles a fully static binary (`CGO_ENABLED=0`); Render overrides the exposed port via `$PORT` at runtime.
- Installed `ca-certificates` and `tzdata` in the runtime image to support TLS calls to Supabase and Upstash from the container.
- Deployed the containerized Go backend to **Render** as a web service.
- Environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `DATABASE_URL`, `REDIS_URL`, `PORT`) are configured via Render's environment dashboard — no secrets are stored in the repository.

#### Redis — Upstash
- Production Redis (SSE fan-out, bid pipeline, auction settlement worker) runs on **Upstash** — a serverless Redis service with TLS, accessed from the Render container via `rediss://` URL.
- Added `docker-compose.yml` (`redis:7-alpine`, persistent `redis_data` volume, port `6379`) for local development so the full bid flow can be tested without Upstash credentials.

---

## New Unit Tests

All tests added this sprint extend coverage introduced in Sprint 3. No live Supabase, PostgreSQL, or Redis connections are required.

### Frontend

Tests run with **Vitest** + **jsdom** + **Testing Library** (`npm test`).

| File | What it covers |
|------|----------------|
| `src/auth/__tests__/signinRedirect.test.ts` | `getSafeReturnPath`: returns `/` for null/invalid/relative paths, blocks redirect loops back to `/signin` or `/signup`, preserves safe in-app paths with query string and hash. |
| `src/components/landingPage/__tests__/topListingsQuery.test.ts` | `mapTopListingsToStripItems`: formatted name/price/tag output, null/undefined input; `fetchTopListings`: auth header sent, correct endpoint, payload returned. |
| `src/components/profilePage/__tests__/ProfileStatusViews.test.tsx` | `BidsTab`: **Won** and **Bid more** labels render correctly per bid status; `ProfileHeaderCharts`: listings donut correctly splits into **Sold** / **Unsold** segments with matching aria-label. |

### Backend

Tests use `net/http/httptest` mock servers.

| File | What it covers |
|------|----------------|
| `internal/handlers/notifications_test.go` | `getNotificationsHandler`: 405 on wrong method, 401 without token. `getNotificationCountHandler`: 405 on wrong method, 401 without token. `markNotificationReadHandler`: 405 on wrong method, 401 without token, 400 when notification ID is missing. `markAllNotificationsReadHandler`: 405 on wrong method, 401 without token. `deleteNotificationHandler`: 405 on wrong method, 401 without token, 400 when notification ID is missing. |
