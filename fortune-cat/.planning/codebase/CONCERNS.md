# Codebase Concerns

**Analysis Date:** 2026-04-29

## Tech Debt

**Disabled Active Filter in AI Saju Types Query:**
- Issue: Line 96 in `src/pages/HomePage.jsx` has `.eq("is_active", true)` commented out with TODO
- Files: `src/pages/HomePage.jsx`
- Impact: Inactive AI Saju types are being displayed to users even though other fortune type sections properly filter by `is_active`. Creates inconsistency in UI behavior and may show incomplete/unpublished content
- Fix approach: Uncomment the filter after comprehensive testing. Add feature flag if testing needs to remain controlled

**Console Logging in Production Code:**
- Issue: 104 instances of `console.log()`, `console.warn()`, and `console.error()` scattered throughout source files
- Files: `src/components/PhotoUpload.jsx`, `src/components/Loading.jsx`, `src/components/DeepReadingLoading.jsx`, `src/lib/firebase.js`, `src/hooks/useSession.jsx`, and others
- Impact: Browser console fills with debug logs in production, making it harder to identify real issues. Logs may expose sensitive data or implementation details
- Fix approach: Remove debug console logs or use conditional logging (e.g., `if (process.env.NODE_ENV === 'development')`) for legitimate diagnostic logs. Consider using Sentry for production logging instead

**No Test Coverage:**
- Issue: Zero test files found in codebase (no `.test.*` or `.spec.*` files)
- Files: Entire `src/` directory
- Impact: No way to validate business logic, regressions go undetected, deployment confidence is low. Particularly concerning for fortune calculation flows and payment processing
- Fix approach: Set up Jest or Vitest, add test coverage incrementally starting with critical paths: birthdate conversion logic, payment flow, API error handling

## Known Bugs

**API Error Handling in Amulet Payment Missing Response Body Logging:**
- Symptoms: API returns non-200 status but error details are not captured in logs
- Files: `src/components/AmuletPayment.jsx` lines 65-68
- Trigger: Backend API call fails and returns error response
- Details: Response status is logged but `response.text()` or `response.json()` is never called to capture error details
- Workaround: Check server logs separately to diagnose payment API failures

**Hour Conversion Logic for Birth Time (off-by-one edge case):**
- Symptoms: Birth times near noon/midnight may be converted incorrectly
- Files: `src/components/UserInfoInput.jsx` lines 92-98, `src/components/BirthdateInput.jsx` lines 93-99
- Trigger: When user selects 12 PM or 12 AM and submits
- Details: Logic relies on string comparison (`if (period === 'AM')`) after user selects from dropdown, but hour12 format handling with "12" as string may cause timezone confusion
- Workaround: Testing confirms current logic works, but should be formalized with unit tests

**Keyboard Height Not Properly Cleared on Cleanup:**
- Symptoms: `keyboardHeight` state remains even after component unmounts or navigation
- Files: `src/components/UserInfoInput.jsx` lines 62-83, `src/components/BirthdateInput.jsx` lines 64-85
- Trigger: User opens keyboard and navigates away before it closes
- Details: `window.visualViewport` event listeners are removed on cleanup but final `setKeyboardHeight(0)` is not called
- Workaround: Not critical but may cause UI jump on subsequent page with similar keyboard handling

## Security Considerations

**Firebase Anonymous User ID Tracking:**
- Risk: User tracking via Firebase anonymousKey without explicit consent mechanism visible in code
- Files: `src/lib/firebase.js`, `src/hooks/useAnonymousKey.jsx`, `src/components/DeepReadingLoading.jsx`
- Current mitigation: Uses Firebase Analytics which requires consent (handled by Apps in Toss framework)
- Recommendations: Document consent flow in PRIVACY.md, ensure GDPR compliance, verify Firebase config doesn't track IP without consent

**Supabase Client Exposed in Frontend:**
- Risk: Supabase client initialized with public anon key in browser JavaScript
- Files: `src/lib/supabase.js` lines 1-6
- Current mitigation: Uses Row Level Security (RLS) policies on Supabase (assumed)
- Recommendations: Verify RLS policies are strict, add logging for unauthorized access attempts, consider moving sensitive reads to backend API

**User Data Sent in Payment API:**
- Risk: Sensitive user data (name, birthdate, phone, email) sent in cleartext HTTP body
- Files: `src/components/AmuletPayment.jsx` lines 39-54
- Current mitigation: Apps in Toss framework likely handles HTTPS, API key in header
- Recommendations: Ensure all API calls use HTTPS only, rotate `VITE_AMULET_PRODUCT_SKU` if exposed in build, audit what data backend stores

**Environment Variables in Import Meta:**
- Risk: `import.meta.env.VITE_*` values are baked into bundle if not tree-shaken properly
- Files: Throughout codebase (e.g., `src/lib/supabase.js`, `src/components/Loading.jsx`, `src/components/AmuletPayment.jsx`)
- Current mitigation: Vite should tree-shake unused vars, but API keys/URLs are needed for frontend
- Recommendations: Audit build output for exposed keys, use Content Security Policy headers

## Performance Bottlenecks

**Unoptimized Image Loading in HomePage:**
- Problem: Menu images and amulet images loaded without proper lazy loading sizing hints
- Files: `src/pages/HomePage.jsx` lines 476-481, 527-532
- Cause: `loading="lazy"` attribute is present but no explicit `width`/`height` attributes, `img` tags may cause layout shift
- Improvement path: Add explicit `width` and `height` attributes to all images, use `next-gen` formats like WebP with fallback, consider image CDN with auto-optimization

**API Timeout Logic Too Long (3 minutes):**
- Problem: AbortController timeout set to 180,000ms (3 minutes) - user waiting in loading screen for too long
- Files: `src/components/Loading.jsx` line 196-198, `src/components/DeepReadingLoading.jsx` similar
- Cause: Assumes backend AI processing may take up to 3 minutes
- Improvement path: Implement backend job queue with polling, set timeout to 30-60 seconds with retry logic, show estimated time remaining

**No Response Caching:**
- Problem: Every page load fetches all fortune types via Supabase `.select("*")`
- Files: `src/pages/HomePage.jsx` lines 92-112
- Cause: Data fetched on every mount with no caching layer
- Improvement path: Add React Query or SWR for caching, set stale-while-revalidate, cache fortune types for 1 hour, add local storage fallback

**Base64 Image Conversion Not Optimized:**
- Problem: Large base64 images (from photo upload) processed inline without compression
- Files: `src/components/Loading.jsx` line 246 (`base64ToBlob`), `src/utils/dataTransform.js`
- Cause: FormData appended with full base64 photo without quality optimization
- Improvement path: Compress images before upload (max width/height already handled by framework), implement progressive upload with chunks

## Fragile Areas

**Complex State Management in Loading/DeepReadingLoading Components:**
- Files: `src/components/Loading.jsx`, `src/components/DeepReadingLoading.jsx` (each ~500+ lines)
- Why fragile: Multiple interdependent state variables (`adLoaded`, `adRewarded`, `apiCompleted`, `apiError`, `currentStep`) with complex useEffect dependencies. Race conditions possible between ad load, ad show, and API call
- Safe modification: Extract ad loading logic into custom hook (`useAdMob`), extract API call logic into separate hook, use state machine library (e.g., XState) to model state transitions
- Test coverage: Missing - critical for validation. Add integration tests for ad flow + API success/error scenarios

**UserInfoInput Component with Step Logic:**
- Files: `src/components/UserInfoInput.jsx` lines 123-148 (two-step flow for compatibility mode)
- Why fragile: Nested state management for two-step input flow. Manual save/restore of form fields via `myInfoFields`. Global `window.scrollTo(0, 0)` calls without cleanup
- Safe modification: Extract two-person input flow into separate component or use form library (React Hook Form). Store step state in URL or context
- Test coverage: None. Add tests for step transitions, data persistence between steps

**Supabase Error Handling Patterns:**
- Files: `src/lib/supabase.js` lines 46-84 (`getAmuletConfig`), `src/pages/HomePage.jsx` lines 88-125 (`fetchAllTypes`)
- Why fragile: Silent fallback to defaults when errors occur - makes it hard to detect actual failures. No retry logic
- Safe modification: Distinguish between network errors (retry) vs auth errors (bail out). Add error boundaries, structured error codes
- Test coverage: None. Add tests for error scenarios and fallback behavior

## Scaling Limits

**Daily Order Limit Not Transactional:**
- Current capacity: 50 orders/day (default), configurable via Supabase `app_config`
- Limit: If two requests arrive simultaneously, both may check count=49 and proceed
- Scaling path: Move limit check to database trigger or lock, use Supabase advisory locks, implement request queuing

**Session Storage Dependency:**
- Current capacity: One session per browser tab, survives page refresh
- Limit: `sessionStorage` may be unavailable in private browsing, quota ~5-10MB per domain
- Scaling path: Test private browsing scenario, add fallback to memory-only storage, monitor quota usage

**Image Upload Size Not Validated:**
- Current capacity: `maxWidth: 360` (framework handles), no max file size check in frontend
- Limit: Base64 encoding increases size by 33%, large photos may exceed API limits
- Scaling path: Add explicit file size validation (max 5MB), show upload progress, implement chunked upload for backend optimization

## Dependencies at Risk

**Firebase SDK Version:**
- Risk: `firebase@^12.8.0` is a major version, may break if next major released (v13+)
- Impact: Analytics, auth, and event logging would break
- Migration plan: Monitor Firebase releases, test v13 in staging before updating, consider moving to native analytics solution

**Supabase SDK Version:**
- Risk: `@supabase/supabase-js@^2.86.0` at v2, next major (v3) may have breaking changes
- Impact: Database queries, auth, storage operations would break
- Migration plan: Lock to minor version during development, plan migration when v3 released

**React Router DOM v7:**
- Risk: `react-router-dom@^7.9.5` - new major version, may have incompatibilities
- Impact: Navigation, state.location.state pattern used throughout could break
- Migration plan: Check compatibility after framework updates, test all navigation flows

## Missing Critical Features

**No Offline Support:**
- Problem: App requires constant internet connection for fortune types, results, images
- Blocks: Users can't view previous results without internet
- Recommendation: Implement service worker, cache fortune type list, cache recent results

**No Error Recovery UI:**
- Problem: If API fails during loading, user sees error message but no clear recovery path beyond "retry"
- Blocks: Users stuck if backend is temporarily down
- Recommendation: Show estimated wait time, implement exponential backoff retry, queue requests for retry

**No Duplicate Payment Prevention:**
- Problem: If user clicks purchase twice rapidly, both requests may go through before `isPurchasing` flag updates
- Blocks: Double charging possible
- Recommendation: Implement idempotency keys in API, add server-side duplicate detection, test rapid clicks

## Test Coverage Gaps

**Birth Date Conversion Logic:**
- What's not tested: 12-hour to 24-hour conversion, leap month handling, edge cases (leap day, year boundaries)
- Files: `src/components/UserInfoInput.jsx`, `src/utils/dataTransform.js`
- Risk: Silent failures in fortune calculation if conversion is wrong. Users in lunar calendar get incorrect analysis
- Priority: High

**Payment Flow (Success & Failure Paths):**
- What's not tested: IAP success callback, error scenarios, recovery from incomplete orders
- Files: `src/components/AmuletPayment.jsx`
- Risk: Payment data lost, double charges, orders not recorded. Business critical
- Priority: High

**API Error Handling:**
- What's not tested: 400, 500, 503 responses, network timeouts, malformed JSON responses
- Files: `src/components/Loading.jsx`, `src/components/AmuletPayment.jsx`, `src/components/DeepReadingLoading.jsx`
- Risk: App crashes on unexpected API responses, users stuck in loading state
- Priority: High

**Photo Upload & Processing:**
- What's not tested: Large file handling, corrupted images, permission denial recovery
- Files: `src/components/PhotoUpload.jsx`
- Risk: App crashes if framework returns unexpected format, lost user input
- Priority: Medium

**Ad Flow:**
- What's not tested: Ad load timeout, user dismisses ad before reward, ad module unavailable
- Files: `src/components/Loading.jsx`, `src/components/DeepReadingLoading.jsx`
- Risk: User stuck in loading loop if ad system fails, lost user engagement
- Priority: Medium

**Compatibility Mode (Two-Person Input):**
- What's not tested: Back button behavior, step transitions, data persistence
- Files: `src/components/UserInfoInput.jsx`
- Risk: Data loss when switching between steps, confusing UX if flow breaks
- Priority: Medium

---

*Concerns audit: 2026-04-29*
