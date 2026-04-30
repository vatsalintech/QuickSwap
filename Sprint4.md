# QuickSwap – Sprint 4

---


### Deployment

#### Frontend — Vercel
- Deployed the React app to **Vercel**.
- Added `frontend/vercel.json` with a catch-all rewrite (`/(.*) → /index.html`) so React Router handles all client-side routes without 404s on hard refresh or direct navigation.

#### Backend — Docker + Render
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
