# External Integrations

**Analysis Date:** 2026-04-29

## APIs & External Services

**Fortune Telling Backend:**
- `/saju-reading` endpoint - Basic fortune reading analysis
  - Location: `src/components/Loading.jsx`
  - Auth: None (public endpoint)
  - Request: FormData with name, birthdate, gender, photo (base64), anonymous_key
  - Response: Fortune text and generated image

- `/deep-reading/start` and `/deep-reading-match/start` endpoints - Advanced deep reading
  - Location: `src/components/DeepReadingLoading.jsx`
  - Auth: `VITE_SAJU_AI_API_KEY` header (`X-API-Key`)
  - Request: JSON with user data, fortune type, anonymous_key
  - Response: Streaming text (Server-Sent Events or chunked response)
  - Timeout: 3 minutes (180000ms)

**Google AdMob:**
- Service: In-app rewarded advertising
- Integration: `@apps-in-toss/web-framework` module
- Location: `src/components/Loading.jsx`, `src/components/DeepReadingLoading.jsx`, `src/components/DeepReadingResult.jsx`
- Configuration:
  - Ad Group ID: `VITE_AD_GROUP_ID` (production) or test ID from `src/config/ads.js`
  - Test Mode: Whitelist anonymous users via `TEST_ANONYMOUS_IDS` in `src/config/ads.js`
  - Methods: `loadAppsInTossAdMob()`, `showAppsInTossAdMob()`
  - Events: "loaded", "show", "userEarnedReward", "dismissed", "failedToShow"

**Toss Analytics:**
- Service: User behavior tracking via Analytics module
- Integration: `@apps-in-toss/web-framework`
- Location: `src/components/FortuneTypeSelect.jsx`, `src/components/DeepReadingResult.jsx`
- Usage: Track navigation, fortune type selection, deep reading results

## Data Storage

**Databases:**
- **Supabase (PostgreSQL)**
  - Client: `@supabase/supabase-js` 2.86.0
  - Connection: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  - Initialization: `src/lib/supabase.js`
  - Tables:
    - `debug_logs` - Fire-and-forget diagnostic logging (stage, order_id, data)
    - `app_config` - Feature flags and configuration (amulet_daily_order_limit, amulet_low_stock_threshold)
    - `amulet_orders` - Amulet purchase orders with timestamps
  - Storage Buckets:
    - `menu_images` - Fortune type and menu images
    - `amulet-menu` - Amulet theme images and intro graphics
  - Helper Functions:
    - `getMenuImageUrl(imagePath)` - Retrieve public URLs for menu images
    - `getAmuletStyleImageUrl(themeType)` - Get amulet style images
    - `getOgImageUrl()` - Open Graph image for sharing
    - `getAmuletConfig()` - Fetch daily order limits (defaults: 50 limit, 10 low-stock threshold)
    - `getTodayOrderCount()` - Count daily amulet orders using Korea time (UTC+9)

**File Storage:**
- Supabase Storage (accessed via `supabase.storage.from().getPublicUrl()`)
- No local filesystem storage for user data

**Caching:**
- None detected (all data fetched fresh on request)

## Authentication & Identity

**User Identification:**
- Anonymous Key System
  - Hook: `src/hooks/useAnonymousKey.jsx`
  - Purpose: Identify users without login (GDPR compliant)
  - Usage: Passed to all API requests in `user_anonymous_id` field
  - Test Whitelisting: Users in `TEST_ANONYMOUS_IDS` (defined in `src/config/ads.js`)

**Toss Login:**
- Component: `src/components/TossLogin.jsx`
- Purpose: OAuth login via Toss platform
- Implementation: Apps-in-Toss native bridge (details in component)

**Auth Provider:**
- Firebase Authentication (configured but not currently used for user login)
  - Setup in `src/lib/firebase.js` with `VITE_FIREBASE_*` config variables

## Monitoring & Observability

**Error Tracking:**
- **Sentry** 10.33.0
  - Initialization: `src/main.jsx`
  - DSN: `VITE_SENTRY_DSN` (optional, only initialized if present)
  - Configuration:
    - Environment: Set to build mode (dev/prod)
    - Integration: Browser tracing enabled
    - Trace Sample Rate: 10% of sessions
  - Usage:
    - Wraps components in `<Sentry.ErrorBoundary>`
    - Manual error capture in catch blocks with `Sentry.captureException()`
    - Performance monitoring of API calls

**Analytics:**
- **Firebase Analytics**
  - Client: `firebase` 12.8.0
  - Initialization: `src/lib/firebase.js` with `VITE_FIREBASE_*` config
  - Methods:
    - `logEvent(eventName, eventParams)` - Log custom events
    - `setUserId(userId)` - Set user ID for tracking
    - `setUserProperties(props)` - Set user attributes
  - Safe Initialization: Gracefully handles analytics unavailability

**Logs:**
- Console logging: Standard `console.log()` and `console.error()` (removed in production build)
- Supabase Debug Logs: Fire-and-forget logging to `debug_logs` table via `logDebug(stage, orderId, data)` in `src/lib/supabase.js`

## CI/CD & Deployment

**Hosting:**
- Apps-in-Toss Platform (Toss in-app web view)
- Production URL: App served as in-app browser component

**Build Pipeline:**
- Build Command: `npm run build` → `ait build` (Granite CLI)
- Output: `dist/` directory containing static files
- Deployment: `ait deploy` command (Granite CLI)
- Artifact: `fortune-cat.ait` file (Apps-in-Toss package)

**CI/CD:**
- Not detected (no GitHub Actions, GitLab CI, or other pipeline configuration visible)

## Environment Configuration

**Required env vars (all prefixed with VITE_ for Vite exposure):**
- `VITE_API_BASE_URL` - Backend service endpoint
- `VITE_SUPABASE_URL` - Database and storage
- `VITE_SUPABASE_ANON_KEY` - Anonymous database access
- `VITE_FIREBASE_*` (6 vars) - Analytics and crash reporting
- `VITE_SENTRY_DSN` - Optional error tracking
- `VITE_AD_GROUP_ID` - Ad network identifier
- `VITE_SAJU_AI_API_KEY` - External AI service authentication
- `VITE_AMULET_PRODUCT_SKU` - In-app purchase identifier

**Secrets location:**
- `.env` (not tracked in git)
- `.env.development` - Development overrides
- `.env.production` - Production overrides
- All secrets stored in environment variable files (not in code)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- Supabase debug logs (fire-and-forget, not true webhooks)
- Firebase Analytics events (async event tracking)

## API Integration Patterns

**Base URL Configuration:**
```javascript
const endpoint = `${import.meta.env.VITE_API_BASE_URL}/saju-reading`;
```

**Request Methods:**
- FormData (multipart) for file uploads with metadata
- JSON for structured data
- Streaming responses (deep reading endpoints)

**Error Handling:**
- 3-minute timeout with AbortController
- Sentry error capture with context
- User-friendly error messages in UI

**Response Processing:**
- Image results stored as base64 in state
- Text results parsed and rendered with Markdown
- Streaming deep reading text displayed incrementally

---

*Integration audit: 2026-04-29*
