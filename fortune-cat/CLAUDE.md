<!-- GSD:project-start source:PROJECT.md -->
## Project

**복냥사주 (Fortune Cat)**

토스인앱 안에서 동작하는 AI 사주 풀이 웹앱입니다. 사용자가 이름·성별·생년월일·사진 등 간단한 정보를 입력하면 AI가 **편하게 보는 정확한 사주** 풀이를 제공하고, 신년운세 딥리딩(채팅), 부적 인앱결제까지 한 자리에서 즐길 수 있습니다. 주 사용자는 운세에 익숙한 4050 여성입니다.

**Core Value:** **편하게 보는 정확한 사주** — 입력은 간단해야 하고, 풀이는 깊이 있고 정확해야 한다. 이 둘 중 하나라도 망가지면 제품 정체성이 흔들린다.

### Constraints

- **Tech stack**: React 18 + Vite + TDS Mobile/AIT + Apps-in-Toss web-framework — 토스인앱 배포 정책 및 디자인 일관성을 위해 변경 불가
- **Platform**: Apps-in-Toss WebView — 일반 브라우저에서는 광고/IAP/GetAnonymousKey가 동작하지 않음, dev에서는 graceful degradation 필요
- **Auth**: 자체 회원 시스템 없음 — 익명키(Toss `getAnonymousKey`) + 결제 시 토스 로그인(`@apps-in-toss/web-framework`)만 사용
- **Data**: 단일 Supabase 프로젝트(현 saju.trinity-apps.net 백엔드와 동일) — 타로 메뉴/카드도 같은 프로젝트에 추가
- **Monetization (v1.1)**: 타로는 **광고 시청 후 무제한** — 별도 결제 상품 추가 금지(이번 마일스톤 한정)
- **Build**: AIT 빌드 산출물(`fortune-cat.ait`) 호환 유지 — `granite.config.ts` 권한 변경 시 토스 심사 영향 검토
- **Repository layout**: `app-in-toss/` 멀티앱 모노레포 — git는 부모 디렉토리에서 관리, `fortune-cat/` 작업 시 형제 앱(예: `ai-pet-studio`)에 영향 주지 않도록 주의
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript - Used for build and utility scripts
- JSX - React component files (`.jsx`)
- TypeScript - Configuration files (`.ts`)
## Runtime
- Node.js (inferred from package.json, no specific version locked)
- npm - Primary (package.json and package-lock.json present)
- pnpm - Also used (pnpm-lock.yaml present)
- package-lock.json
- pnpm-lock.yaml
## Frameworks
- React 18.2.0 - UI framework
- React DOM 18.2.0 - React rendering
- React Router DOM 7.9.5 - Client-side routing
- @toss/tds-mobile 2.1.2 - Toss design system for mobile
- @toss/tds-mobile-ait 2.1.2 - Toss design system apps-in-toss variant
- @toss/tds-colors 0.1.0 - Color palette
- @emotion/react 11.14.0 - CSS-in-JS styling
- Vite 5.0.8 - Build tool and dev server
- @vitejs/plugin-react 4.2.1 - Vite React plugin
- @apps-in-toss/web-framework 2.4.5 - Bridge to native Toss features (IAP, GoogleAdMob, Analytics, Camera, Album)
## Key Dependencies
- @supabase/supabase-js 2.86.0 - Database, storage, and debug logging
- firebase 12.8.0 - Analytics and crash reporting
- @sentry/react 10.33.0 - Error tracking and performance monitoring
- react-markdown 10.1.0 - Markdown rendering for results
- eslint 9.25.0 - Code linting
- eslint-plugin-react-hooks 5.2.0 - React hooks linting
- eslint-plugin-react-refresh 0.4.19 - React Fast Refresh linting
- @eslint/js 9.25.0 - JavaScript linting rules
- globals 16.0.0 - ESLint globals
## Configuration
- Vite environment variables with `VITE_` prefix (required by Vite to expose to client)
- Separate `.env.development` and `.env.production` files
- Environment-specific API base URLs:
- `VITE_API_BASE_URL` - Backend API endpoint
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase analytics measurement ID
- `VITE_SENTRY_DSN` - Sentry error tracking endpoint (optional, conditionally initialized)
- `VITE_AD_GROUP_ID` - Google AdMob ad group identifier
- `VITE_AMULET_PRODUCT_SKU` - In-app purchase product SKU (referenced but not visible in main config)
- `VITE_SAJU_AI_API_KEY` - External AI API key for deep reading
- `vite.config.js` - Vite configuration with React plugin, terser minification, console removal
- `granite.config.ts` - Apps-in-Toss framework configuration (app metadata, permissions, dev server)
- `eslint.config.js` - ESLint configuration for JavaScript/JSX linting
## Platform Requirements
- Node.js runtime
- npm or pnpm package manager
- Camera and photo album permissions (configured in `granite.config.ts`)
- Deployed as Toss in-app web view (Apps-in-Toss platform)
- Browser environment with ES2020+ support
- Access to native APIs: IAP (in-app purchase), GoogleAdMob, Camera, Album, Analytics
- Location: `dist/` directory
- Artifact: Static JavaScript bundle minified with Terser (console/debugger removed)
- Built to: `fortune-cat.ait` (Apps-in-Toss format)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase (e.g., `BirthdateInput.jsx`, `Loading.jsx`, `UserInfoInput.jsx`)
- Utility/helper files: camelCase (e.g., `dataTransform.js`, `firebase.js`, `supabase.js`)
- Hooks: camelCase with `use` prefix (e.g., `useSession.jsx`, `useToast.jsx`, `useAnonymousKey.jsx`)
- Config files: camelCase (e.g., `ads.js`)
- Pages: PascalCase (e.g., `HomePage.jsx`, `SajuPage.jsx`, `AmuletPage.jsx`)
- Named exports: camelCase (e.g., `formatBirthdate`, `logEvent`, `getMenuImageUrl`)
- Default exports for components: PascalCase function names (e.g., `export default function BirthdateInput`)
- Custom hooks: camelCase with `use` prefix (e.g., `useSession()`, `useToast()`)
- Utility functions: camelCase (e.g., `formatBirthtime`, `base64ToBlob`, `normalizeMarkdown`)
- State variables: camelCase (e.g., `year`, `month`, `day`, `birthdayType`)
- Constants: UPPER_SNAKE_CASE (e.g., `SESSION_ID_KEY`, `TEST_AD_GROUP_ID`, `USER_INFO_STORAGE_KEY`)
- Boolean variables: prefix with `is` or `has` (e.g., `isValid`, `isLeapMonth`, `hasError`, `adLoaded`)
- Refs: suffix with `Ref` (e.g., `yearRef`, `monthRef`, `cleanupRef`)
- Context objects: PascalCase suffix Context (e.g., `SessionContext`, `ToastContext`, `AnonymousKeyContext`)
- Provider components: PascalCase suffix Provider (e.g., `SessionProvider`, `ToastProvider`, `AnonymousKeyProvider`)
## Code Style
- No explicit formatter configured (Prettier config not found)
- Indentation: 2 spaces observed throughout codebase
- Line length: No strict limit observed
- Quotes: Single quotes for strings (e.g., `import { useState } from 'react'`)
- Tool: ESLint (config: `eslint.config.js`)
- Parser: `@eslint/js` with React Hooks and React Refresh plugins
- Key rules enforced:
## Import Organization
- No path aliases configured; relative paths used throughout
- Relative imports use `../` pattern to traverse directory structure
## Error Handling
- Try-catch blocks around async operations (e.g., `useUserInfoStorage.js` wraps `Storage.getItem()`)
- Console logging for errors: `console.error('[Module] Error message:', error)`
- Prefixed logging for context: `[Firebase]`, `[Storage]`, `[Supabase]`, `[AnonymousKey]`
- Graceful degradation: Errors caught but execution continues (e.g., Firebase analytics init failure doesn't block app)
- Error validation in hook initialization (e.g., `useAnonymousKey.jsx` validates SDK availability before calling)
## Logging
- Context-prefixed logs: `console.log('[Module] message', data)`
- Severity levels: `console.log()`, `console.warn()`, `console.error()`
- Fire-and-forget async logging: Supabase debug logs don't await (see `logDebug()` in `supabase.js`)
## Comments
- Complex data transformations (e.g., hour conversion in `BirthdateInput.jsx` lines 29-45)
- Workarounds and non-obvious logic: "CommonMark에서 **text** 뒤에 바로 한글이 오면 bold 파싱 실패"
- Firebase initialization conditions: "Sentry 초기화"
- Regulatory/business context: "fire-and-forget, await 하지 않음" (performance optimization)
- Debug notes: "한국 시간 기준 오늘 00:00:00 (UTC로 변환)"
- JSDoc used for utility functions (all functions in `dataTransform.js` have JSDoc)
- Includes parameter types and return types
- Korean language comments for clarity in Korean codebase
## Function Design
- Small utility functions: 20-50 lines (e.g., `formatBirthdate`, `formatGender`)
- Component functions: 100-700 lines (large components handle multi-step UI, see `BirthdateInput.jsx` 637 lines, `HomePage.jsx` 743 lines)
- Hooks: 40-100 lines for simple state management
- Use object destructuring for prop parameters: `function BirthdateInput({ name, onNext, onBack, initialBirthdate = {} })`
- Default values provided: `initialBirthdate = {}`
- Props passed down through callbacks: `onNext(data)`, `onBack()`
- JSX components return React elements
- Utility functions return primitives (strings, booleans) or Blob/data objects
- Hooks return context values or state tuple-like objects: `{ sessionId, startNewSession }`
- Async functions throw errors or return null/objects
## Module Design
- Named exports for utilities: `export function formatBirthdate()`
- Default exports for components: `export default function HomePage() { }`
- Named exports for hooks: `export function SessionProvider()`, `export function useSession()`
- Mixed exports for lib files: Both named and default exports from `firebase.js`
- No explicit barrel files detected; imports directly from component/hook files
- Components: Isolated in `src/components/` with internal state management
- Hooks: Custom hooks in `src/hooks/` for state and context management
- Utils: Pure functions in `src/utils/` for data transformation
- Libs: SDK wrappers in `src/lib/` (Supabase, Firebase)
- Pages: Route-level components in `src/pages/`
- Config: Application configuration in `src/config/`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Client-side routing with React Router for page navigation
- Context-based global state providers (Theme, Toast, Session, AnonymousKey)
- Multi-step form flows with local component state
- External API integration for fortune readings
- Real-time sync with Supabase for content and config
## Layers
- Purpose: User interface and interaction handling
- Location: `src/pages/`, `src/components/`
- Contains: Page components (`HomePage.jsx`, `SajuPage.jsx`, `NewYearPage.jsx`, `AmuletPage.jsx`), UI components for forms and displays
- Depends on: Hooks, Router, Utils
- Used by: Main app routing
- Purpose: Global and local state management using React Context API
- Location: `src/hooks/`
- Contains: `useSession` (reading session IDs), `useAnonymousKey` (user identification), `useToast` (notifications), `useUserInfoStorage` (persistent user data), `usePendingOrderStorage` (incomplete orders)
- Depends on: Firebase, Storage from web-framework
- Used by: All pages and components
- Purpose: Initialize and configure external integrations
- Location: `src/lib/`
- Contains: `firebase.js` (analytics), `supabase.js` (database, storage, config)
- Depends on: Firebase SDK, Supabase JS SDK
- Used by: Components, Hooks
- Purpose: Data transformation and helper functions
- Location: `src/utils/`
- Contains: `dataTransform.js` (birthdate/gender/image formatting), `markdown.jsx` (markdown rendering)
- Depends on: None
- Used by: Components, Loading/Result screens
- Purpose: App-wide settings and constants
- Location: `src/config/`
- Contains: `ads.js` (ad group ID resolution based on user)
- Depends on: Environment variables
- Used by: Loading components
- Purpose: Static resources
- Location: `src/assets/`
- Contains: Images, GIFs used in components
- Depends on: None
- Used by: Components
## Data Flow
## Key Abstractions
- Purpose: Unified data structure for user input across all flows
- Examples: `userData` in `SajuPage.jsx`, `NewYearPage.jsx`, `AmuletPage.jsx`
- Pattern: Local state managed via `setUserData()`, persisted via `useUserInfoStorage`
- Structure:
- Purpose: Control flow through multi-step forms
- Pattern: Each page maintains `currentPage` state, `handleNext()` transitions between steps
- Example: `SajuPage` flow: `userInfo` → `photoUpload` → `loading` → `result`
- Example: `AmuletPage` flow: `userInfo` → `tossLogin` → `contactInput` → `payment` → `result`
- `ai_saju_types`: AI-based detailed fortune readings (with deep reading capability)
- `new_year_fortune_types`: Zodiac year fortunes and compatibility readings
- `saju_reading_types`: Image-based fortune readings with photos
- `amulet_types`: Purchasable amulet designs with SKU mapping
- Purpose: Track multi-message conversations (deep reading follow-ups)
- Generated: Via `startNewSession()` in `useSession`
- Stored: In `sessionStorage` (survives page refresh, clears on tab close)
- Used in: `DeepReadingLoading` to pass `session_id` for chat endpoints
- Purpose: Unique user identifier for analytics and ad targeting
- Source: Toss SDK `getAnonymousKey()` function
- Cached: In Toss Storage (persists across sessions)
- Used in: Firebase analytics, ad group resolution, backend API calls
## Entry Points
- Location: `src/main.jsx`
- Triggers: Page load in browser/webview
- Responsibilities: Initialize providers, setup Sentry, render App component
- Location: `src/App.jsx`
- Triggers: Route navigation
- Responsibilities: Route requests to HomePage, SajuPage, NewYearPage, AmuletPage
- Location: `src/pages/HomePage.jsx`
- Triggers: Navigation to `/` or app launch
- Responsibilities: Fetch all menu types from Supabase, display fortune/amulet options, handle quick menu
- Location: `src/pages/SajuPage.jsx`
- Triggers: Navigation from HomePage with `selectedType` state
- Responsibilities: Orchestrate user info → photo upload → AI fortune reading flow
- Location: `src/pages/NewYearPage.jsx`
- Triggers: Navigation from HomePage with `selectedType` state
- Responsibilities: Orchestrate user info → deep reading (with chat capability) flow
- Location: `src/pages/AmuletPage.jsx`
- Triggers: Navigation from HomePage with `selectedType` state
- Responsibilities: Orchestrate user info → Toss login → payment → order grant flow, handle pending order recovery
## Error Handling
```javascript
```
```javascript
```
```javascript
```
- Unsupported environment → skip to API
- Load error → proceed without ad
- Show error → still proceed
- Result: Fortune never blocked by ad failures
## Cross-Cutting Concerns
- Tool: Sentry (production), console (development)
- Init: `src/main.jsx` with `VITE_SENTRY_DSN`
- Usage: Error capture in `Loading.jsx`, `DeepReadingLoading.jsx` via `Sentry.captureException()`
- Event tracking: Firebase analytics via `logEvent()` in `src/lib/firebase.js`
- Tool: Firebase Analytics
- Init: `src/lib/firebase.js` - initializes app, sets user ID and properties
- Events logged: `logEvent(eventName, params)` throughout pages
- User ID: Set via `useAnonymousKey` context
- Input validation: Inline in components (`name.trim()`, date range checks)
- Storage validation: `isValidUserInfo()` before saving to Storage
- API validation: Response status checks, JSON parsing with try/catch
- Birthdate format: Conversion via `formatBirthdate()` (validates year/month/day exist)
- Gender format: Conversion via `formatGender()` ('male' → 'M', 'female' → 'F')
- Toss Login: OAuth via `@apps-in-toss/web-framework` (TossLogin component)
- Anonymous ID: Retrieved from Toss SDK, no user account needed
- Session persistence: User info stored locally, survives app restart
- No backend user table: All data identified by `userKey` (Toss) or `anonymousKey` (Toss)
- Amulet purchases: Pending orders cached in localStorage, auto-restore on next launch
- Fortune readings: User can retry from error screen
- Ad failures: Never block fortune generation
- Storage corruption: Detected and cleared, user prompted to re-enter
- Network timeouts: 3-minute timeout on fortune API, user can retry
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
