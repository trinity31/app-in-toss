# Architecture

**Analysis Date:** 2026-04-29

## Pattern Overview

**Overall:** Multi-page SPA (Single Page Application) with route-based state management

**Key Characteristics:**
- Client-side routing with React Router for page navigation
- Context-based global state providers (Theme, Toast, Session, AnonymousKey)
- Multi-step form flows with local component state
- External API integration for fortune readings
- Real-time sync with Supabase for content and config

## Layers

**Presentation (Pages & Components):**
- Purpose: User interface and interaction handling
- Location: `src/pages/`, `src/components/`
- Contains: Page components (`HomePage.jsx`, `SajuPage.jsx`, `NewYearPage.jsx`, `AmuletPage.jsx`), UI components for forms and displays
- Depends on: Hooks, Router, Utils
- Used by: Main app routing

**State Management (Hooks & Context):**
- Purpose: Global and local state management using React Context API
- Location: `src/hooks/`
- Contains: `useSession` (reading session IDs), `useAnonymousKey` (user identification), `useToast` (notifications), `useUserInfoStorage` (persistent user data), `usePendingOrderStorage` (incomplete orders)
- Depends on: Firebase, Storage from web-framework
- Used by: All pages and components

**External Services (Lib):**
- Purpose: Initialize and configure external integrations
- Location: `src/lib/`
- Contains: `firebase.js` (analytics), `supabase.js` (database, storage, config)
- Depends on: Firebase SDK, Supabase JS SDK
- Used by: Components, Hooks

**Utilities:**
- Purpose: Data transformation and helper functions
- Location: `src/utils/`
- Contains: `dataTransform.js` (birthdate/gender/image formatting), `markdown.jsx` (markdown rendering)
- Depends on: None
- Used by: Components, Loading/Result screens

**Configuration:**
- Purpose: App-wide settings and constants
- Location: `src/config/`
- Contains: `ads.js` (ad group ID resolution based on user)
- Depends on: Environment variables
- Used by: Loading components

**Assets:**
- Purpose: Static resources
- Location: `src/assets/`
- Contains: Images, GIFs used in components
- Depends on: None
- Used by: Components

## Data Flow

**Fortune Reading Flow (Saju/NewYear):**

1. User lands on `HomePage` - Supabase fetches all available fortune types
2. User clicks fortune type → navigated to `SajuPage` or `NewYearPage` with selected type
3. Page loads from `useUserInfoStorage` (persisted data) and merges with selected type
4. User enters information via `UserInfoInput` → `handleNext()` saves to storage
5. For image-based fortunes: `PhotoUpload` component collects image
6. `Loading` component plays ad, tracks session, calls backend API (`/saju-reading` or deep reading)
7. Backend returns AI-generated fortune text + image as base64
8. `Result` or `DeepReadingResult` renders fortune and allows sharing/restart

**Amulet Purchase Flow:**

1. User selects amulet type from `HomePage` → `AmuletPage` loads
2. App checks for pending/incomplete orders via `usePendingOrderStorage`
3. If pending orders exist, display recovery banner
4. User fills `UserInfoInput` → `TossLogin` (Toss OAuth) → `ContactInput` (email/phone) → `AmuletPayment` (IAP)
5. On payment success: backend receives order via `grantProduct()`, stores in `amulet_orders` table
6. `AmuletResult` displays purchased amulet image
7. If payment interrupted: data saved to localStorage for recovery

**State Management Initialization:**

1. App boots → `main.jsx` initializes providers in order:
   - `BrowserRouter` (routing)
   - `ThemeProvider` (TDS mobile design system)
   - `ToastProvider` (notifications)
   - `AnonymousKeyProvider` (user ID from Toss)
   - `SessionProvider` (reading session IDs)
2. Providers set up context before App mounts
3. Child components access state via hooks

## Key Abstractions

**User Information Object:**
- Purpose: Unified data structure for user input across all flows
- Examples: `userData` in `SajuPage.jsx`, `NewYearPage.jsx`, `AmuletPage.jsx`
- Pattern: Local state managed via `setUserData()`, persisted via `useUserInfoStorage`
- Structure:
  ```javascript
  {
    name,
    birthdate: { year, month, day, hour12, period, minuteRange, isLeapMonth, birthdayType },
    gender,
    // Fortune-specific
    fortuneType, themeType, readingType, fortuneTypeTitle,
    // Amulet-specific
    amuletType, amuletTypeTitle,
    // Photo (for image-based fortunes)
    photo: { dataUri },
    // Contact (for amulet)
    email, phone,
    // Toss login
    tossUserInfo: { userKey, name },
    // Results
    fortuneResult, orderId
  }
  ```

**Page State Machine:**
- Purpose: Control flow through multi-step forms
- Pattern: Each page maintains `currentPage` state, `handleNext()` transitions between steps
- Example: `SajuPage` flow: `userInfo` → `photoUpload` → `loading` → `result`
- Example: `AmuletPage` flow: `userInfo` → `tossLogin` → `contactInput` → `payment` → `result`

**Fortune Types (Supabase Tables):**
- `ai_saju_types`: AI-based detailed fortune readings (with deep reading capability)
- `new_year_fortune_types`: Zodiac year fortunes and compatibility readings
- `saju_reading_types`: Image-based fortune readings with photos
- `amulet_types`: Purchasable amulet designs with SKU mapping

**Session ID:**
- Purpose: Track multi-message conversations (deep reading follow-ups)
- Generated: Via `startNewSession()` in `useSession`
- Stored: In `sessionStorage` (survives page refresh, clears on tab close)
- Used in: `DeepReadingLoading` to pass `session_id` for chat endpoints

**Anonymous Key:**
- Purpose: Unique user identifier for analytics and ad targeting
- Source: Toss SDK `getAnonymousKey()` function
- Cached: In Toss Storage (persists across sessions)
- Used in: Firebase analytics, ad group resolution, backend API calls

## Entry Points

**Application Root:**
- Location: `src/main.jsx`
- Triggers: Page load in browser/webview
- Responsibilities: Initialize providers, setup Sentry, render App component

**Router Entry:**
- Location: `src/App.jsx`
- Triggers: Route navigation
- Responsibilities: Route requests to HomePage, SajuPage, NewYearPage, AmuletPage

**HomePage:**
- Location: `src/pages/HomePage.jsx`
- Triggers: Navigation to `/` or app launch
- Responsibilities: Fetch all menu types from Supabase, display fortune/amulet options, handle quick menu

**SajuPage:**
- Location: `src/pages/SajuPage.jsx`
- Triggers: Navigation from HomePage with `selectedType` state
- Responsibilities: Orchestrate user info → photo upload → AI fortune reading flow

**NewYearPage:**
- Location: `src/pages/NewYearPage.jsx`
- Triggers: Navigation from HomePage with `selectedType` state
- Responsibilities: Orchestrate user info → deep reading (with chat capability) flow

**AmuletPage:**
- Location: `src/pages/AmuletPage.jsx`
- Triggers: Navigation from HomePage with `selectedType` state
- Responsibilities: Orchestrate user info → Toss login → payment → order grant flow, handle pending order recovery

## Error Handling

**Strategy:** Graceful degradation with user-friendly error messages and retry mechanisms

**Patterns:**

**API Failures (Loading components):**
```javascript
// Timeout handling
abortControllerRef.current = new AbortController()
setTimeout(() => abortControllerRef.current?.abort(), 180000)

// Error capture
try { await fetch(...) } catch (error) {
  Sentry.captureException(error)
  setApiError("사주 풀이를 생성하는데 실패했습니다. 다시 시도해 주세요.")
  // Retry button available
}
```

**Supabase Query Failures (HomePage):**
```javascript
// All Promise.all queries wrapped
Promise.all([...]).catch(err => {
  setHasError(true)
  openToast({ message: "메뉴를 불러오지 못했습니다" })
  // Retry button shown
})
```

**Data Validation (UserInfoStorage):**
```javascript
function isValidUserInfo(userInfo) {
  if (!birthdate.year || !birthdate.month || !birthdate.day) return false
  if (!['male', 'female'].includes(gender)) return false
  // Invalid data deleted from storage
}
```

**Ad Loading Failures (Loading component):**
- Unsupported environment → skip to API
- Load error → proceed without ad
- Show error → still proceed
- Result: Fortune never blocked by ad failures

## Cross-Cutting Concerns

**Logging:**
- Tool: Sentry (production), console (development)
- Init: `src/main.jsx` with `VITE_SENTRY_DSN`
- Usage: Error capture in `Loading.jsx`, `DeepReadingLoading.jsx` via `Sentry.captureException()`
- Event tracking: Firebase analytics via `logEvent()` in `src/lib/firebase.js`

**Analytics:**
- Tool: Firebase Analytics
- Init: `src/lib/firebase.js` - initializes app, sets user ID and properties
- Events logged: `logEvent(eventName, params)` throughout pages
  - `quick_menu_click`: Quick menu taps on home
  - `menu_click`: Fortune/amulet type selections
  - `share_click`: Share button interactions
- User ID: Set via `useAnonymousKey` context

**Validation:**
- Input validation: Inline in components (`name.trim()`, date range checks)
- Storage validation: `isValidUserInfo()` before saving to Storage
- API validation: Response status checks, JSON parsing with try/catch
- Birthdate format: Conversion via `formatBirthdate()` (validates year/month/day exist)
- Gender format: Conversion via `formatGender()` ('male' → 'M', 'female' → 'F')

**Authentication:**
- Toss Login: OAuth via `@apps-in-toss/web-framework` (TossLogin component)
- Anonymous ID: Retrieved from Toss SDK, no user account needed
- Session persistence: User info stored locally, survives app restart
- No backend user table: All data identified by `userKey` (Toss) or `anonymousKey` (Toss)

**Error Recovery:**
- Amulet purchases: Pending orders cached in localStorage, auto-restore on next launch
- Fortune readings: User can retry from error screen
- Ad failures: Never block fortune generation
- Storage corruption: Detected and cleared, user prompted to re-enter
- Network timeouts: 3-minute timeout on fortune API, user can retry

---

*Architecture analysis: 2026-04-29*
